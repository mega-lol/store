import { useEffect, useState } from 'react';
import HatScene from '@/components/HatScene';
import { CAMERA_PRESETS } from '@/components/HatScene';
import CustomizationPanel from '@/components/CustomizationPanel';
import { DEFAULT_HAT, HatConfig, Decal } from '@/types/hat';
import { applySiteFont, ensureFontLoaded } from '@/lib/fonts';
import { decodeDesign } from '@/lib/designShare';
import useFabricCanvas from '@/hooks/useFabricCanvas';
import { toFontStack } from '@/lib/fonts';

export default function Designer() {
  const [config, setConfig] = useState<HatConfig>({ ...DEFAULT_HAT });
  const [selectedDecalId, setSelectedDecalId] = useState<string | null>(null);
  const [placementMode, setPlacementMode] = useState(false);
  const [editingOnSurface, setEditingOnSurface] = useState(false);
  const [cameraPreset, setCameraPreset] = useState(-1);
  const [presetTrigger, setPresetTrigger] = useState(0);

  // Preview mode disables Fabric.js (used for screenshots/SSR/headless captures)
  const isPreviewMode = typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).has('preview');

  // Fabric.js canvas for direct text manipulation on 3D surface
  const fabric = useFabricCanvas(config.hatColor);

  useEffect(() => {
    const encoded = new URLSearchParams(window.location.search).get('d');
    if (!encoded) return;
    const shared = decodeDesign(encoded);
    if (!shared) return;

    setConfig((prev) => ({
      ...prev,
      ...shared,
      id: shared.id || prev.id || crypto.randomUUID(),
      decals: Array.isArray(shared.decals) ? shared.decals : prev.decals,
    }));
  }, []);

  useEffect(() => {
    applySiteFont(config.font);
    void ensureFontLoaded(config.font);
  }, [config.font]);

  // Sync config text/color/font/style to Fabric canvas
  useEffect(() => {
    if (!fabric.canvas) return;
    fabric.setText(config.text, {
      fill: config.textColor,
      fontFamily: toFontStack(config.font),
      textStyle: config.textStyle,
    });
  }, [config.text, config.textColor, config.font, config.textStyle, fabric.canvas, fabric.setText]);

  const handleDecalUpdate = (id: string, updates: Partial<Decal>) => {
    setConfig(prev => ({
      ...prev,
      decals: prev.decals.map(d => d.id === id ? { ...d, ...updates } : d)
    }));
  };

  const handleConfigChange = (newConfig: HatConfig) => {
    setConfig(newConfig);
    if (selectedDecalId && !newConfig.decals.find(d => d.id === selectedDecalId)) {
      setSelectedDecalId(null);
      setPlacementMode(false);
    }
  };

  const handleSelectDecal = (id: string | null) => {
    setSelectedDecalId(id);
    if (!id) setPlacementMode(false);
  };

  return (
    <main className="h-[100dvh] bg-black overflow-hidden pt-12">
      <div className="flex flex-col lg:flex-row h-[calc(100dvh-3rem)]">
        {/* 3D Preview */}
        <div className="flex-1 relative">
          <HatScene
            hatColor={config.hatColor}
            bandColor={config.bandColor}
            texture={config.texture}
            text={config.text}
            backText={config.backText}
            brimText={config.brimText}
            textColor={config.textColor}
            textStyle={config.textStyle}
            font={config.font}
            flagCode={config.flagCode}
            decals={config.decals}
            onDecalUpdate={handleDecalUpdate}
            selectedDecalId={selectedDecalId || undefined}
            onDecalSelect={handleSelectDecal}
            placementMode={placementMode}
            onPlacementComplete={() => setPlacementMode(false)}
            fabricCanvas={isPreviewMode ? null : fabric.canvas}
            editingOnSurface={editingOnSurface}
            onEditingSurface={isPreviewMode ? undefined : setEditingOnSurface}
            cameraPreset={cameraPreset}
            cameraPresetTrigger={presetTrigger}
            className="w-full h-full"
          />
          {/* Camera angle preset pill bar */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-0 rounded-full border border-white/10 bg-black/70 backdrop-blur-sm p-0.5">
            {CAMERA_PRESETS.map((preset, i) => (
              <button
                key={preset.label}
                onClick={() => { setCameraPreset(i); setPresetTrigger(t => t + 1); }}
                className={`px-2.5 py-1 text-[9px] uppercase tracking-wider rounded-full transition-all ${
                  cameraPreset === i
                    ? 'bg-white/15 text-yellow-300 shadow-sm'
                    : 'text-white/45 hover:text-white/80 hover:bg-white/5'
                }`}
                title={preset.label}
              >
                {preset.shortLabel}
              </button>
            ))}
          </div>
        </div>

        {/* Panel */}
        <div className="lg:w-[360px] border-l border-white/5 overflow-y-auto bg-black">
          <CustomizationPanel
            config={config}
            onChange={handleConfigChange}
            selectedDecalId={selectedDecalId || undefined}
            onSelectDecal={handleSelectDecal}
            onStartPlacement={() => setPlacementMode(true)}
          />
        </div>
      </div>
    </main>
  );
}
