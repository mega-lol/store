import { useEffect, useState } from 'react';
import HatScene from '@/components/HatScene';
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
            fabricCanvas={fabric.canvas}
            editingOnSurface={editingOnSurface}
            onEditingSurface={setEditingOnSurface}
            className="w-full h-full"
          />
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
