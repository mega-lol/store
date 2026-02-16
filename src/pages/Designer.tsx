import { useState } from 'react';
import HatScene from '@/components/HatScene';
import CustomizationPanel from '@/components/CustomizationPanel';
import { DEFAULT_HAT, HatConfig } from '@/types/hat';

export default function Designer() {
  const [config, setConfig] = useState<HatConfig>({ ...DEFAULT_HAT });

  return (
    <main className="min-h-screen pt-14 bg-black">
      <div className="flex flex-col lg:flex-row h-[calc(100vh-3.5rem)]">
        {/* 3D Preview */}
        <div className="flex-1 flex items-center justify-center p-4">
          <HatScene
            hatColor={config.hatColor}
            text={config.text}
            backText={config.backText}
            textColor={config.textColor}
            className="w-full h-full min-h-[400px]"
          />
        </div>

        {/* Panel */}
        <div className="lg:w-[420px] border-l border-white/10 overflow-y-auto bg-zinc-950">
          <CustomizationPanel config={config} onChange={setConfig} />
        </div>
      </div>
    </main>
  );
}
