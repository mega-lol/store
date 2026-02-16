import { useState } from 'react';
import HatScene from '@/components/HatScene';
import CustomizationPanel from '@/components/CustomizationPanel';
import { DEFAULT_HAT, HatConfig } from '@/types/hat';

export default function Designer() {
  const [config, setConfig] = useState<HatConfig>({ ...DEFAULT_HAT });

  return (
    <main className="h-[100dvh] bg-black overflow-hidden pt-12">
      <div className="flex flex-col lg:flex-row h-[calc(100dvh-3rem)]">
        {/* 3D Preview */}
        <div className="flex-1 relative">
          <HatScene
            hatColor={config.hatColor}
            text={config.text}
            backText={config.backText}
            textColor={config.textColor}
            className="w-full h-full"
          />
        </div>

        {/* Panel */}
        <div className="lg:w-[360px] border-l border-white/5 overflow-y-auto bg-black">
          <CustomizationPanel config={config} onChange={setConfig} />
        </div>
      </div>
    </main>
  );
}
