import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import ColorPicker from './ColorPicker';
import { HatConfig, PRESET_HAT_COLORS, PRESET_TEXT_COLORS, Decal } from '@/types/hat';
import { useCart, PRICE_PER_HAT } from '@/store/cartStore';
import { ShoppingCart, Share2, Plus, Trash2, Upload, Image as ImageIcon, Type, RotateCw, Move } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

interface CustomizationPanelProps {
  config: HatConfig;
  onChange: (config: HatConfig) => void;
  selectedDecalId?: string;
  onSelectDecal?: (id: string | null) => void;
}

const SIZES = ['S', 'M', 'L', 'XL'] as const;

export default function CustomizationPanel({ config, onChange, selectedDecalId, onSelectDecal }: CustomizationPanelProps) {
  const { addItem } = useCart();
  const { toast } = useToast();

  const update = (partial: Partial<HatConfig>) => onChange({ ...config, ...partial });

  const handleAddToCart = () => {
    addItem(config);
    toast({ title: 'Added to cart', description: 'Your custom hat has been added.' });
  };

  const handleShare = async () => {
    const t = config.text.replace(/\n/g, ' ');
    const shareData = {
      title: 'MEGA — Make Earth Great Again',
      text: `Check out my custom MEGA hat: "${t}"`,
      url: window.location.href,
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
      position: [0, 0.5, 0.8], // Default position on front/top
      rotation: [0, 0, 0],
      scale: [0.15, 0.15, 0.15],
      text: type === 'text' ? 'New Text' : undefined,
      color: type === 'text' ? '#ffffff' : undefined,
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
        }
      };
      input.click();
    } else {
      update({ decals: [...config.decals, newDecal] });
      onSelectDecal?.(newDecal.id);
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

  const selectedDecal = config.decals.find(d => d.id === selectedDecalId);

  return (
    <div className="flex flex-col h-full">
      <div className="p-5 pb-0">
        <h2 className="text-lg font-bold tracking-tight text-white mb-4">Design Your Hat</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-5 pt-0 space-y-6">
        <Tabs defaultValue="base" className="w-full">
          <TabsList className="w-full grid grid-cols-3 bg-white/5 mb-4">
            <TabsTrigger value="base">Base</TabsTrigger>
            <TabsTrigger value="text">Text</TabsTrigger>
            <TabsTrigger value="decals">Decals</TabsTrigger>
          </TabsList>

          <TabsContent value="base" className="space-y-5">
            <ColorPicker
              label="Hat Color"
              value={config.hatColor}
              onChange={hatColor => update({ hatColor, texture: undefined })} // Clear texture if color selected
              presets={PRESET_HAT_COLORS}
            />

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
              <p className="text-[10px] text-white/30">Upload an image to wrap around the hat.</p>
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
            <ColorPicker
              label="Text Color"
              value={config.textColor}
              onChange={textColor => update({ textColor })}
              presets={PRESET_TEXT_COLORS}
            />

            <div className="space-y-1.5">
              <label className="text-[10px] tracking-[0.2em] uppercase text-white/40">Front Text</label>
              <textarea
                value={config.text}
                onChange={e => update({ text: e.target.value })}
                placeholder={'MAKE EARTH\nGREAT AGAIN'}
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
                    defaultValue={[selectedDecal.rotation[2]]}
                    min={-Math.PI}
                    max={Math.PI}
                    step={0.1}
                    value={[selectedDecal.rotation[2]]}
                    onValueChange={([val]) => updateDecal(selectedDecal.id, { rotation: [selectedDecal.rotation[0], selectedDecal.rotation[1], val] })}
                  />
                </div>

                <p className="text-[10px] text-white/30 italic mt-2">
                  <Move className="inline h-3 w-3 mr-1" />
                  Drag the gizmo on the hat to position
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <div className="pt-4 border-t border-white/5 space-y-2 p-5 bg-black">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] tracking-[0.2em] uppercase text-white/30">Price</span>
          <span className="text-xl font-bold text-white">${PRICE_PER_HAT}</span>
        </div>
        <Button onClick={handleAddToCart} className="w-full h-10 text-xs font-bold tracking-[0.15em] uppercase bg-white text-black hover:bg-white/90" size="lg">
          <ShoppingCart className="mr-2 h-3.5 w-3.5" />
          Add to Cart
        </Button>
        <button onClick={handleShare} className="w-full h-8 text-[10px] tracking-[0.2em] uppercase text-white/30 hover:text-white border border-white/5 hover:border-white/20 transition-colors flex items-center justify-center gap-2">
          <Share2 className="h-3 w-3" />
          Share Design
        </button>
      </div>
    </div>
  );
}
