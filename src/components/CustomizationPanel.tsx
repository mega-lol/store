import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import ColorPicker from './ColorPicker';
import {
  HatConfig, PRESET_HAT_COLORS, PRESET_TEXT_COLORS, Decal, COUNTRY_CODES,
  FONTS, DEFAULT_HAT, TEXT_STYLES, PLACEMENT_ZONES, BUILT_IN_PRESETS,
  DesignPreset, PlacementZone, TextStyle,
} from '@/types/hat';
import { Share2, Plus, Trash2, Upload, Image as ImageIcon, Type, RotateCw, Move, Sparkles, Save, FolderOpen, Wand2, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { applySiteFont, ensureFontLoaded, toFontStack } from '@/lib/fonts';
import { v4 as uuidv4 } from 'uuid';
import { buildShareUrl } from '@/lib/designShare';

interface CustomizationPanelProps {
  config: HatConfig;
  onChange: (config: HatConfig) => void;
  selectedDecalId?: string;
  onSelectDecal?: (id: string | null) => void;
  onStartPlacement?: () => void;
}

const SIZES = ['S', 'M', 'L', 'XL'] as const;
const FLAG_NONE = 'NONE';
const SAVED_DESIGNS_KEY = 'mega_saved_designs_v1';

function countryFlagEmoji(code: string): string {
  const up = code.toUpperCase();
  if (!/^[A-Z]{2}$/.test(up)) return '';
  return String.fromCodePoint(0x1f1e6 + up.charCodeAt(0) - 65) +
    String.fromCodePoint(0x1f1e6 + up.charCodeAt(1) - 65);
}

export default function CustomizationPanel({
  config,
  onChange,
  selectedDecalId,
  onSelectDecal,
  onStartPlacement,
}: CustomizationPanelProps) {
  const { toast } = useToast();
  const [googleFontName, setGoogleFontName] = useState('');
  const [canvasBaseUrl, setCanvasBaseUrl] = useState<string | null>(null);
  const [canvasTopText, setCanvasTopText] = useState('YOUR BRAND');
  const [canvasBottomText, setCanvasBottomText] = useState('');
  const [canvasTextColor, setCanvasTextColor] = useState('#ffffff');
  const [canvasFontSize, setCanvasFontSize] = useState(88);
  const [canvasImageScale, setCanvasImageScale] = useState(1);
  const [canvasImageRotation, setCanvasImageRotation] = useState(0);
  const [canvasBrightness, setCanvasBrightness] = useState(100);
  const [canvasContrast, setCanvasContrast] = useState(100);
  const [canvasSaturation, setCanvasSaturation] = useState(100);
  const canvasPreviewRef = useRef<HTMLCanvasElement | null>(null);
  const canvasImageRef = useRef<HTMLImageElement | null>(null);

  const update = (partial: Partial<HatConfig>) => onChange({ ...config, ...partial });

  useEffect(() => {
    applySiteFont(config.font);
    void ensureFontLoaded(config.font);
  }, [config.font]);

  const setEdition = (hatColor: string, textColor: string) => {
    update({ hatColor, bandColor: hatColor, textColor });
  };

  const handleFontSelect = async (font: string) => {
    await ensureFontLoaded(font);
    update({ font });
  };

  const handleGoogleFontApply = async () => {
    const trimmed = googleFontName.trim();
    if (!trimmed) return;
    await ensureFontLoaded(trimmed);
    update({ font: trimmed });
    toast({ title: 'Font Applied', description: `${trimmed} is now your active font.` });
  };

  const handleFlagChange = (value: string) => {
    update({ flagCode: value === FLAG_NONE ? undefined : value });
  };

  const redrawCanvasPreview = useCallback(() => {
    const canvas = canvasPreviewRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#141414';
    ctx.fillRect(0, 0, w, h);

    const img = canvasImageRef.current;
    if (img) {
      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.rotate((canvasImageRotation * Math.PI) / 180);
      ctx.filter = `brightness(${canvasBrightness}%) contrast(${canvasContrast}%) saturate(${canvasSaturation}%)`;
      const fit = Math.min(w / img.width, h / img.height);
      const drawW = img.width * fit * canvasImageScale;
      const drawH = img.height * fit * canvasImageScale;
      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
      ctx.restore();
    }

    const fontStack = toFontStack(config.font);
    const lineHeight = canvasFontSize * 1.05;
    const topLines = canvasTopText.split('\n').filter(Boolean);
    const bottomLines = canvasBottomText.split('\n').filter(Boolean);

    ctx.textAlign = 'center';
    ctx.fillStyle = canvasTextColor;
    ctx.strokeStyle = 'rgba(0,0,0,0.35)';
    ctx.lineWidth = Math.max(2, canvasFontSize * 0.06);
    ctx.font = `900 ${canvasFontSize}px ${fontStack}`;

    topLines.forEach((line, index) => {
      const y = 80 + index * lineHeight;
      ctx.strokeText(line, w / 2, y);
      ctx.fillText(line, w / 2, y);
    });

    bottomLines.forEach((line, index) => {
      const y = h - 80 - (bottomLines.length - 1 - index) * lineHeight;
      ctx.strokeText(line, w / 2, y);
      ctx.fillText(line, w / 2, y);
    });
  }, [
    config.font,
    canvasTopText,
    canvasBottomText,
    canvasTextColor,
    canvasFontSize,
    canvasImageScale,
    canvasImageRotation,
    canvasBrightness,
    canvasContrast,
    canvasSaturation,
  ]);

  useEffect(() => {
    redrawCanvasPreview();
  }, [redrawCanvasPreview]);

  useEffect(() => {
    if (!canvasBaseUrl) {
      canvasImageRef.current = null;
      redrawCanvasPreview();
      return;
    }

    const img = new Image();
    img.src = canvasBaseUrl;
    img.onload = () => {
      canvasImageRef.current = img;
      redrawCanvasPreview();
    };
  }, [canvasBaseUrl, redrawCanvasPreview]);

  const handleCanvasBaseUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCanvasBaseUrl(URL.createObjectURL(file));
  };

  const addCanvasAsDecal = () => {
    const canvas = canvasPreviewRef.current;
    if (!canvas) return;

    const newDecal: Decal = {
      id: uuidv4(),
      type: 'image',
      url: canvas.toDataURL('image/png'),
      position: [0, 0.45, 0.84],
      rotation: [0, 0, 0],
      scale: [0.2, 0.2, 0.2],
      normal: [0, 0, 1],
      spin: 0,
    };

    update({ decals: [...config.decals, newDecal] });
    onSelectDecal?.(newDecal.id);
    onStartPlacement?.();
    toast({ title: 'Layer Added', description: 'Click on the model to place this layer.' });
  };

  const useCanvasAsTexture = () => {
    const canvas = canvasPreviewRef.current;
    if (!canvas) return;
    update({ texture: canvas.toDataURL('image/png') });
    toast({ title: 'Texture Applied', description: 'Canvas design is now your product texture.' });
  };

  const handleMintNew = () => {
    onChange({
      ...DEFAULT_HAT,
      id: crypto.randomUUID(),
      font: config.font,
    });
    onSelectDecal?.(null);
    toast({ title: 'New Hat Minted', description: 'Fresh MEGA hat ready to design.' });
  };

  const handleSaveDesign = () => {
    try {
      const id = config.id || crypto.randomUUID();
      const nextConfig = { ...config, id };
      const existing = localStorage.getItem(SAVED_DESIGNS_KEY);
      const parsed = existing ? (JSON.parse(existing) as HatConfig[]) : [];
      const merged = [nextConfig, ...parsed.filter((design) => design.id !== id)].slice(0, 100);
      localStorage.setItem(SAVED_DESIGNS_KEY, JSON.stringify(merged));
      update({ id });
      toast({ title: 'Design Saved', description: 'Saved locally for quick relaunch.' });
    } catch {
      toast({ title: 'Save Failed', description: 'Unable to save this design locally.' });
    }
  };

  const handleShare = async () => {
    const t = config.text.replace(/\n/g, ' ');
    const shareUrl = buildShareUrl(config);
    const shareData = {
      title: 'MEGA Hats',
      text: `Check out my custom design: "${t}"`,
      url: shareUrl,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        toast({ title: 'Copied', description: 'Share link copied to clipboard.' });
      }
    } catch {
      // Cancelled
    }
  };

  const handleTextureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      update({ texture: url });
    }
  };

  const addDecal = (type: 'image' | 'text') => {
    const newDecal: Decal = {
      id: uuidv4(),
      type,
      position: [0, 0.5, 0.8],
      rotation: [0, 0, 0],
      scale: [0.15, 0.15, 0.15],
      normal: [0, 0, 1],
      spin: 0,
      text: type === 'text' ? 'New Text' : undefined,
      color: type === 'text' ? '#ffffff' : undefined,
      font: type === 'text' ? config.font : undefined,
    };

    // For images, we need to trigger upload immediately or just add placeholder
    if (type === 'image') {
      // Create a hidden input to trigger upload
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          newDecal.url = URL.createObjectURL(file);
          update({ decals: [...config.decals, newDecal] });
          onSelectDecal?.(newDecal.id);
          onStartPlacement?.();
        }
      };
      input.click();
    } else {
      update({ decals: [...config.decals, newDecal] });
      onSelectDecal?.(newDecal.id);
      onStartPlacement?.();
    }
  };

  const updateDecal = (id: string, partial: Partial<Decal>) => {
    update({
      decals: config.decals.map(d => d.id === id ? { ...d, ...partial } : d)
    });
  };

  const removeDecal = (id: string) => {
    update({ decals: config.decals.filter(d => d.id !== id) });
    if (selectedDecalId === id) onSelectDecal?.(null);
  };

  // Zone-based placement positions (pre-calculated for baseball cap model)
  const ZONE_POSITIONS: Record<PlacementZone, { position: [number, number, number]; rotation: [number, number, number]; normal: [number, number, number] }> = {
    'front':      { position: [0, 0.50, 0.84],    rotation: [0, 0, 0],        normal: [0, 0, 1] },
    'back':       { position: [0, 0.47, -0.84],   rotation: [0, Math.PI, 0],  normal: [0, 0, -1] },
    'left':       { position: [-0.72, 0.48, 0.10], rotation: [0, -Math.PI/2, 0], normal: [-1, 0, 0] },
    'right':      { position: [0.72, 0.48, 0.10],  rotation: [0, Math.PI/2, 0],  normal: [1, 0, 0] },
    'brim-top':   { position: [0, 0.28, 0.80],    rotation: [-Math.PI/3, 0, 0], normal: [0, 0.5, 0.87] },
    'brim-under': { position: [0, 0.22, 0.70],    rotation: [Math.PI/3, 0, 0],  normal: [0, -0.5, 0.87] },
    'rear-seam':  { position: [0, 0.58, -0.70],   rotation: [0, Math.PI, 0],  normal: [0, 0.2, -1] },
    'inside':     { position: [0, 0.30, 0.50],    rotation: [-0.3, 0, 0],     normal: [0, -1, 0] },
  };

  const addDecalAtZone = (zone: PlacementZone) => {
    const zoneData = ZONE_POSITIONS[zone];
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const newDecal: Decal = {
        id: uuidv4(),
        type: 'image',
        url: URL.createObjectURL(file),
        position: zoneData.position,
        rotation: zoneData.rotation,
        scale: [0.18, 0.18, 0.18],
        normal: zoneData.normal,
        spin: 0,
        zone,
      };
      update({ decals: [...config.decals, newDecal] });
      onSelectDecal?.(newDecal.id);
      toast({ title: `Decal added: ${PLACEMENT_ZONES.find(z => z.value === zone)?.label}`, description: 'Image placed at zone position.' });
    };
    input.click();
  };

  // Presets management
  const loadPreset = (preset: DesignPreset) => {
    onChange({
      ...preset.config,
      id: crypto.randomUUID(),
      decals: preset.config.decals || [],
    });
    onSelectDecal?.(null);
    toast({ title: 'Preset Loaded', description: `"${preset.name}" applied.` });
  };

  const getSavedPresets = (): DesignPreset[] => {
    try {
      const raw = localStorage.getItem('mega_user_presets_v1');
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  };

  const saveAsPreset = () => {
    const name = prompt('Preset name:');
    if (!name) return;
    const preset: DesignPreset = {
      id: crypto.randomUUID(),
      name,
      config: { ...config },
    };
    const existing = getSavedPresets();
    localStorage.setItem('mega_user_presets_v1', JSON.stringify([preset, ...existing].slice(0, 50)));
    toast({ title: 'Preset Saved', description: `"${name}" saved to your presets.` });
  };

  const deleteUserPreset = (id: string) => {
    const existing = getSavedPresets();
    localStorage.setItem('mega_user_presets_v1', JSON.stringify(existing.filter(p => p.id !== id)));
    toast({ title: 'Preset Deleted' });
  };

  const selectedDecal = config.decals.find(d => d.id === selectedDecalId);

  return (
    <div className="flex flex-col h-full">
      <div className="p-5 pb-0" />

      <div className="flex-1 overflow-y-auto p-5 pt-0 space-y-6">
        <Tabs defaultValue="base" className="w-full">
          <TabsList className="w-full grid grid-cols-5 bg-white/5 mb-4">
            <TabsTrigger value="base">Base</TabsTrigger>
            <TabsTrigger value="text">Text</TabsTrigger>
            <TabsTrigger value="canvas">Canvas</TabsTrigger>
            <TabsTrigger value="decals">Decals</TabsTrigger>
            <TabsTrigger value="presets">Presets</TabsTrigger>
          </TabsList>

          <TabsContent value="base" className="space-y-5">
            <ColorPicker
              label="Cap Color"
              value={config.hatColor}
              onChange={hatColor => update({ hatColor, texture: undefined })} // Clear texture if color selected
              presets={PRESET_HAT_COLORS}
            />

            <ColorPicker
              label="Band Color"
              value={config.bandColor || config.hatColor}
              onChange={bandColor => update({ bandColor })}
              presets={PRESET_HAT_COLORS}
            />

            <div className="space-y-1.5">
              <label className="text-[10px] tracking-[0.2em] uppercase text-white/40">Quick Editions</label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => setEdition('#FFFFFF', '#000000')}
                  className="h-8 text-[10px] border border-white/20 text-white/80 hover:border-white/50"
                >
                  White Base
                </button>
                <button
                  onClick={() => setEdition('#000000', '#FFFFFF')}
                  className="h-8 text-[10px] border border-white/20 text-white/80 hover:border-white/50"
                >
                  Black Base
                </button>
                <button
                  onClick={() => update({ hatColor: '#FFFFFF', bandColor: '#FFFFFF', textColor: '#FFFFFF', text: 'MAKE EARTH\nGREAT AGAIN', backText: 'MAKE EARTH\nGREAT AGAIN', textStyle: 'flat' as const })}
                  className="h-8 text-[10px] border border-white/20 text-white/80 hover:border-white/50"
                >
                  Light MEGA ($80)
                </button>
                <button
                  onClick={() => update({ hatColor: '#000000', bandColor: '#000000', textColor: '#000000', text: 'MAKE EARTH\nGREAT AGAIN', backText: 'MAKE EARTH\nGREAT AGAIN', textStyle: 'flat' as const })}
                  className="h-8 text-[10px] border border-white/20 text-white/80 hover:border-white/50"
                >
                  Dark MEGA ($80)
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Pattern / Texture</label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="w-full border-dashed border-white/20 hover:border-white/40 bg-transparent text-white/60 hover:text-white"
                  onClick={() => document.getElementById('texture-upload')?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {config.texture ? 'Change Texture' : 'Upload Pattern'}
                </Button>
                {config.texture && (
                  <Button
                    variant="outline"
                    className="px-2 border-white/20 hover:bg-red-900/50 hover:border-red-500/50"
                    onClick={() => update({ texture: undefined })}
                  >
                    <Trash2 className="h-4 w-4 text-white/60" />
                  </Button>
                )}
              </div>
              <input
                id="texture-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleTextureUpload}
              />
              <p className="text-[10px] text-white/30">Upload an image to wrap around the base surface.</p>
            </div>

            <div className="space-y-1.5 pt-4">
              <label className="text-[10px] tracking-[0.2em] uppercase text-white/40">Size</label>
              <div className="flex gap-1.5">
                {SIZES.map(s => (
                  <button
                    key={s}
                    onClick={() => update({ size: s })}
                    className={`w-10 h-8 text-xs font-medium border transition-colors ${config.size === s
                        ? 'border-white bg-white text-black'
                        : 'border-white/10 text-white/40 hover:border-white/30'
                      }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="text" className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] tracking-[0.2em] uppercase text-white/40">Text Style</label>
              <div className="grid grid-cols-2 gap-1.5">
                {TEXT_STYLES.map(style => (
                  <button
                    key={style.value}
                    onClick={() => update({ textStyle: style.value })}
                    className={`h-8 text-[10px] border transition-colors ${
                      config.textStyle === style.value
                        ? 'border-yellow-400/80 bg-yellow-400/10 text-yellow-300'
                        : 'border-white/10 text-white/40 hover:border-white/30'
                    }`}
                  >
                    {style.label}
                  </button>
                ))}
              </div>
            </div>

            <ColorPicker
              label="Text Color"
              value={config.textColor}
              onChange={textColor => update({ textColor })}
              presets={PRESET_TEXT_COLORS}
            />

            <div className="space-y-1.5">
              <label className="text-[10px] tracking-[0.2em] uppercase text-white/40">Font</label>
              <select
                value={config.font}
                onChange={e => void handleFontSelect(e.target.value)}
                className="w-full h-8 text-xs bg-transparent border border-white/10 text-white px-2 focus:outline-none focus:border-white/30"
              >
                {FONTS.map((font) => (
                  <option key={font.value} value={font.value} className="bg-black text-white">
                    {font.name}
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <input
                  value={googleFontName}
                  onChange={e => setGoogleFontName(e.target.value)}
                  placeholder="Google font name (e.g. Oswald)"
                  className="flex-1 h-8 text-xs bg-transparent border border-white/10 text-white placeholder:text-white/20 px-2 focus:outline-none focus:border-white/30"
                />
                <Button
                  variant="outline"
                  className="h-8 px-2 text-[10px] border-white/20 text-white/70"
                  onClick={() => void handleGoogleFontApply()}
                >
                  Load
                </Button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] tracking-[0.2em] uppercase text-white/40">Right-Side Flag</label>
              <select
                value={config.flagCode || FLAG_NONE}
                onChange={e => handleFlagChange(e.target.value)}
                className="w-full h-8 text-xs bg-transparent border border-white/10 text-white px-2 focus:outline-none focus:border-white/30"
              >
                <option value={FLAG_NONE} className="bg-black text-white">None</option>
                {COUNTRY_CODES.map((country) => (
                  <option key={country.code} value={country.code} className="bg-black text-white">
                    {countryFlagEmoji(country.code)} {country.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] tracking-[0.2em] uppercase text-white/40">Front Text</label>
              <textarea
                value={config.text}
                onChange={e => update({ text: e.target.value })}
                placeholder={'YOUR\nDESIGN'}
                maxLength={50}
                rows={2}
                className="w-full text-xs bg-transparent border border-white/10 text-white placeholder:text-white/20 px-2 py-1.5 resize-none focus:outline-none focus:border-white/30"
              />
              <p className="text-[9px] text-white/20">{config.text.length}/50</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] tracking-[0.2em] uppercase text-white/40">Back Text</label>
              <input
                value={config.backText || ''}
                onChange={e => update({ backText: e.target.value })}
                placeholder="Optional — any language"
                maxLength={40}
                className="w-full h-8 text-xs bg-transparent border border-white/10 text-white placeholder:text-white/20 px-2 focus:outline-none focus:border-white/30"
              />
            </div>
          </TabsContent>

          <TabsContent value="canvas" className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Canvas Base Image</label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="w-full border-dashed border-white/20 hover:border-white/40 bg-transparent text-white/60 hover:text-white"
                  onClick={() => document.getElementById('canvas-base-upload')?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {canvasBaseUrl ? 'Change Base' : 'Upload Base'}
                </Button>
                {canvasBaseUrl && (
                  <Button
                    variant="outline"
                    className="px-2 border-white/20 hover:bg-red-900/50 hover:border-red-500/50"
                    onClick={() => setCanvasBaseUrl(null)}
                  >
                    <Trash2 className="h-4 w-4 text-white/60" />
                  </Button>
                )}
              </div>
              <input
                id="canvas-base-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCanvasBaseUpload}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] tracking-[0.2em] uppercase text-white/40">Preview</label>
              <div className="border border-white/10 bg-black p-2">
                <canvas ref={canvasPreviewRef} width={1024} height={1024} className="w-full aspect-square" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] tracking-[0.2em] uppercase text-white/40">Top Text</label>
              <input
                value={canvasTopText}
                onChange={e => setCanvasTopText(e.target.value)}
                className="w-full h-8 text-xs bg-transparent border border-white/10 text-white px-2 focus:outline-none focus:border-white/30"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] tracking-[0.2em] uppercase text-white/40">Bottom Text</label>
              <input
                value={canvasBottomText}
                onChange={e => setCanvasBottomText(e.target.value)}
                className="w-full h-8 text-xs bg-transparent border border-white/10 text-white px-2 focus:outline-none focus:border-white/30"
              />
            </div>

            <ColorPicker
              label="Canvas Text Color"
              value={canvasTextColor}
              onChange={setCanvasTextColor}
              presets={PRESET_TEXT_COLORS}
            />

            <div className="space-y-2">
              <label className="text-[10px] text-white/40 uppercase">Text Size</label>
              <Slider
                defaultValue={[canvasFontSize]}
                min={32}
                max={180}
                step={2}
                value={[canvasFontSize]}
                onValueChange={([val]) => setCanvasFontSize(val)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-white/40 uppercase">Image Scale</label>
              <Slider
                defaultValue={[canvasImageScale]}
                min={0.5}
                max={2.5}
                step={0.05}
                value={[canvasImageScale]}
                onValueChange={([val]) => setCanvasImageScale(val)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-white/40 uppercase">Image Rotation</label>
              <Slider
                defaultValue={[canvasImageRotation]}
                min={-180}
                max={180}
                step={1}
                value={[canvasImageRotation]}
                onValueChange={([val]) => setCanvasImageRotation(val)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-white/40 uppercase">Brightness</label>
              <Slider
                defaultValue={[canvasBrightness]}
                min={25}
                max={200}
                step={1}
                value={[canvasBrightness]}
                onValueChange={([val]) => setCanvasBrightness(val)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-white/40 uppercase">Contrast</label>
              <Slider
                defaultValue={[canvasContrast]}
                min={25}
                max={200}
                step={1}
                value={[canvasContrast]}
                onValueChange={([val]) => setCanvasContrast(val)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-white/40 uppercase">Saturation</label>
              <Slider
                defaultValue={[canvasSaturation]}
                min={0}
                max={200}
                step={1}
                value={[canvasSaturation]}
                onValueChange={([val]) => setCanvasSaturation(val)}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="h-9 border-white/20 text-white/80 hover:text-white"
                onClick={useCanvasAsTexture}
              >
                Use As Texture
              </Button>
              <Button
                variant="outline"
                className="h-9 border-white/20 text-white/80 hover:text-white"
                onClick={addCanvasAsDecal}
              >
                Add As Decal
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="decals" className="space-y-5">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="border-dashed border-white/20 hover:border-white/40 bg-transparent text-white/60 hover:text-white h-auto py-4 flex flex-col gap-2"
                onClick={() => addDecal('image')}
              >
                <ImageIcon className="h-5 w-5" />
                <span className="text-xs">Add Image</span>
              </Button>
              <Button
                variant="outline"
                className="border-dashed border-white/20 hover:border-white/40 bg-transparent text-white/60 hover:text-white h-auto py-4 flex flex-col gap-2"
                onClick={() => addDecal('text')}
              >
                <Type className="h-5 w-5" />
                <span className="text-xs">Add Text</span>
              </Button>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] tracking-[0.2em] uppercase text-white/40">Quick Placement Zones</label>
              <div className="grid grid-cols-4 gap-1">
                {PLACEMENT_ZONES.map(zone => (
                  <button
                    key={zone.value}
                    onClick={() => addDecalAtZone(zone.value)}
                    className="h-7 text-[9px] border border-white/10 text-white/40 hover:border-white/30 hover:text-white/70 transition-colors truncate px-1"
                    title={zone.label}
                  >
                    {zone.label}
                  </button>
                ))}
              </div>
              <p className="text-[9px] text-white/20">Click a zone to add an image decal at that position</p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] tracking-[0.2em] uppercase text-white/40">Layers</label>
              {config.decals.length === 0 && (
                <p className="text-sm text-white/20 text-center py-4 italic">No decals added yet</p>
              )}
              <div className="space-y-1">
                {config.decals.map((decal, index) => (
                  <div
                    key={decal.id}
                    className={`flex items-center justify-between p-2 rounded border cursor-pointer transition-colors ${selectedDecalId === decal.id
                        ? 'bg-white/10 border-white/30'
                        : 'bg-transparent border-white/5 hover:border-white/20'
                      }`}
                    onClick={() => onSelectDecal?.(decal.id)}
                  >
                    <div className="flex items-center gap-2">
                      {decal.type === 'image' ? <ImageIcon className="h-3 w-3 text-white/50" /> : <Type className="h-3 w-3 text-white/50" />}
                      <span className="text-xs text-white truncate max-w-[120px]">
                        {decal.type === 'text' ? (decal.text || 'Text') : `Image ${index + 1}`}
                      </span>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeDecal(decal.id); }}
                      className="text-white/20 hover:text-red-400"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {selectedDecal && (
              <div className="p-3 bg-white/5 rounded space-y-3 mt-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Selected Layer</h3>

                {selectedDecal.type === 'text' && (
                  <div className="space-y-2">
                    <input
                      value={selectedDecal.text || ''}
                      onChange={e => updateDecal(selectedDecal.id, { text: e.target.value })}
                      className="w-full h-8 text-xs bg-black/50 border border-white/10 text-white px-2 focus:outline-none focus:border-white/30 rounded"
                    />
                    <ColorPicker
                      label="Color"
                      value={selectedDecal.color || '#ffffff'}
                      onChange={color => updateDecal(selectedDecal.id, { color })}
                      presets={PRESET_TEXT_COLORS}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] text-white/40 uppercase">Scale</label>
                  <Slider
                    defaultValue={[selectedDecal.scale[0]]}
                    min={0.05}
                    max={0.5}
                    step={0.01}
                    value={[selectedDecal.scale[0]]}
                    onValueChange={([val]) => updateDecal(selectedDecal.id, { scale: [val, val, val] })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] text-white/40 uppercase">Rotation</label>
                  <Slider
                    defaultValue={[selectedDecal.spin ?? selectedDecal.rotation[2] ?? 0]}
                    min={-Math.PI}
                    max={Math.PI}
                    step={0.1}
                    value={[selectedDecal.spin ?? selectedDecal.rotation[2] ?? 0]}
                    onValueChange={([val]) => updateDecal(selectedDecal.id, { spin: val })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] text-white/40 uppercase">Jump to Zone</label>
                  <div className="grid grid-cols-4 gap-1">
                    {PLACEMENT_ZONES.map(zone => (
                      <button
                        key={zone.value}
                        onClick={() => {
                          const zoneData = ZONE_POSITIONS[zone.value];
                          updateDecal(selectedDecal.id, {
                            position: zoneData.position,
                            normal: zoneData.normal,
                            zone: zone.value,
                          });
                        }}
                        className={`h-6 text-[8px] border transition-colors truncate px-0.5 ${
                          selectedDecal.zone === zone.value
                            ? 'border-yellow-400/50 text-yellow-300 bg-yellow-400/10'
                            : 'border-white/10 text-white/30 hover:border-white/30'
                        }`}
                        title={zone.label}
                      >
                        {zone.label}
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full h-8 text-[10px] border-white/20 text-white/70"
                  onClick={() => onStartPlacement?.()}
                >
                  Place On Model
                </Button>

                <p className="text-[10px] text-white/30 italic mt-2">
                  <Move className="inline h-3 w-3 mr-1" />
                  Use "Place On Model", then click exactly where the layer should land
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="presets" className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] tracking-[0.2em] uppercase text-white/40">Built-in Presets</label>
              <div className="grid grid-cols-2 gap-1.5">
                {BUILT_IN_PRESETS.map(preset => (
                  <button
                    key={preset.id}
                    onClick={() => loadPreset(preset)}
                    className="h-10 text-[10px] border border-white/10 text-white/60 hover:border-yellow-400/40 hover:text-yellow-300 transition-colors px-2 text-left truncate"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] tracking-[0.2em] uppercase text-white/40">Your Presets</label>
                <button
                  onClick={saveAsPreset}
                  className="text-[10px] text-white/40 hover:text-white flex items-center gap-1"
                >
                  <Save className="h-3 w-3" /> Save Current
                </button>
              </div>
              {getSavedPresets().length === 0 ? (
                <p className="text-[10px] text-white/20 text-center py-3 italic">No saved presets yet</p>
              ) : (
                <div className="space-y-1">
                  {getSavedPresets().map(preset => (
                    <div
                      key={preset.id}
                      className="flex items-center justify-between p-2 border border-white/5 hover:border-white/20 cursor-pointer transition-colors"
                      onClick={() => loadPreset(preset)}
                    >
                      <span className="text-xs text-white/70 truncate">{preset.name}</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteUserPreset(preset.id); }}
                        className="text-white/20 hover:text-red-400"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border border-white/10 p-3 space-y-2">
              <div className="flex items-center gap-2 text-white/60">
                <Sparkles className="h-4 w-4 text-yellow-400" />
                <span className="text-xs font-bold uppercase tracking-wider">AI Design</span>
              </div>
              <p className="text-[10px] text-white/30 leading-relaxed">
                Generate designs, change textures, and create images with AI.
                Requires a Hanzo AI subscription.
              </p>
              <a
                href="https://hanzo.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button
                  variant="outline"
                  className="w-full h-9 text-[10px] border-yellow-400/30 text-yellow-300 hover:bg-yellow-400/10 hover:border-yellow-400/50 tracking-wider uppercase"
                >
                  <Wand2 className="h-3 w-3 mr-2" />
                  Subscribe to Hanzo AI
                </Button>
              </a>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <div className="pt-4 border-t border-white/5 space-y-2 p-5 bg-black">
        <div className="grid grid-cols-2 gap-2 mb-2">
          <Button
            variant="outline"
            className="h-8 border-white/20 text-white/80 hover:text-white text-[10px] tracking-[0.1em] uppercase"
            onClick={handleMintNew}
          >
            Mint New Hat
          </Button>
          <Button
            variant="outline"
            className="h-8 border-white/20 text-white/80 hover:text-white text-[10px] tracking-[0.1em] uppercase"
            onClick={handleSaveDesign}
          >
            Save Design
          </Button>
        </div>
        <a
          href="https://hanzo.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <Button className="w-full h-10 text-xs font-bold tracking-[0.15em] uppercase bg-white text-black hover:bg-white/90" size="lg">
            <CreditCard className="mr-2 h-3.5 w-3.5" />
            Pay via Hanzo
          </Button>
        </a>
        <button onClick={handleShare} className="w-full h-8 text-[10px] tracking-[0.2em] uppercase text-white/30 hover:text-white border border-white/5 hover:border-white/20 transition-colors flex items-center justify-center gap-2">
          <Share2 className="h-3 w-3" />
          Share Design
        </button>
        <p className="mt-2 text-[9px] text-white/25 text-center tracking-[0.1em]">
          Payments by Hanzo AI
        </p>
      </div>
    </div>
  );
}
