import { useState } from 'react';
import HatScene from '@/components/HatScene';
import CustomizationPanel from '@/components/CustomizationPanel';
import { DEFAULT_HAT, HatConfig } from '@/types/hat';

export default function Designer() {
  const [config, setConfig] = useState<HatConfig>({ ...DEFAULT_HAT });

  return (
    <main className="min-h-screen pt-16">
      <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)]">
        {/* 3D Preview */}
        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-secondary/30 to-background p-4">
          <HatScene
            hatColor={config.hatColor}
            text={config.text}
            textColor={config.textColor}
            font={config.font}
            className="w-full h-full min-h-[400px]"
          />
        </div>

        {/* Panel */}
        <div className="lg:w-[420px] border-l border-border overflow-y-auto bg-card">
          <CustomizationPanel config={config} onChange={setConfig} />
        </div>
      </div>
    </main>
  );
}
