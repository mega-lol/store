import { useState } from 'react';
import HatScene from '@/components/HatScene';
import CustomizationPanel from '@/components/CustomizationPanel';
import { DEFAULT_HAT, HatConfig, Decal } from '@/types/hat';

export default function Designer() {
  const [config, setConfig] = useState<HatConfig>({ ...DEFAULT_HAT });
  const [selectedDecalId, setSelectedDecalId] = useState<string | null>(null);

  const handleDecalUpdate = (id: string, updates: Partial<Decal>) => {
    setConfig(prev => ({
      ...prev,
      decals: prev.decals.map(d => d.id === id ? { ...d, ...updates } : d)
    }));
  };

  const handleConfigChange = (newConfig: HatConfig) => {
    setConfig(newConfig);
    // If a decal was removed, clear selection
    if (selectedDecalId && !newConfig.decals.find(d => d.id === selectedDecalId)) {
      setSelectedDecalId(null);
    }
  };

  return (
    <main className="h-[100dvh] bg-black overflow-hidden pt-12">
      <div className="flex flex-col lg:flex-row h-[calc(100dvh-3rem)]">
        {/* 3D Preview */}
        <div className="flex-1 relative">
          <HatScene
            hatColor={config.hatColor}
            texture={config.texture}
            text={config.text}
            backText={config.backText}
            textColor={config.textColor}
            decals={config.decals}
            onDecalUpdate={handleDecalUpdate}
            selectedDecalId={selectedDecalId || undefined}
            onDecalSelect={setSelectedDecalId}
            className="w-full h-full"
          />
        </div>

        {/* Panel */}
        <div className="lg:w-[360px] border-l border-white/5 overflow-y-auto bg-black">
          <CustomizationPanel
            config={config}
            onChange={handleConfigChange}
            selectedDecalId={selectedDecalId || undefined}
            onSelectDecal={setSelectedDecalId}
          />
        </div>
      </div>
    </main>
  );
}
