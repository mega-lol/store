import { useState } from 'react';
import HatScene from '@/components/HatScene';
import { DEFAULT_HAT, HatConfig, PRESET_HAT_COLORS, PRESET_TEXT_COLORS } from '@/types/hat';
import { useCart, PRICE_PER_HAT } from '@/store/cartStore';
import { useToast } from '@/hooks/use-toast';

export default function Index() {
  const [config, setConfig] = useState<HatConfig>({ ...DEFAULT_HAT });
  const { addItem } = useCart();
  const { toast } = useToast();

  const update = (partial: Partial<HatConfig>) => setConfig(prev => ({ ...prev, ...partial }));

  const handleBuy = () => {
    addItem(config);
    toast({ title: 'Added to cart', description: `${config.text.replace(/\n/g, ' ')} hat added.` });
  };

  const handleShare = () => {
    const t = config.text.replace(/\n/g, ' ');
    if (navigator.share) {
      navigator.share({ title: 'MakeHatAgain', text: t, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: 'Copied', description: 'Link copied.' });
    }
  };

  return (
    <main className="h-[100dvh] bg-zinc-950 text-zinc-100 overflow-hidden pt-14">
      <div className="flex flex-col lg:flex-row h-[calc(100dvh-3.5rem)]">

        {/* 3D Hat */}
        <div className="flex-1 relative min-h-[40vh] lg:min-h-0">
          <HatScene
            hatColor={config.hatColor}
            text={config.text}
            backText={config.backText}
            textColor={config.textColor}
            className="w-full h-full"
          />
        </div>

        {/* Controls - scrollable on mobile */}
        <div className="lg:w-[300px] border-l border-zinc-800/50 overflow-y-auto bg-zinc-950 shrink-0">
          <div className="p-3 space-y-3">

            {/* Front text */}
            <div>
              <label className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-1">Front</label>
              <textarea
                value={config.text}
                onChange={e => update({ text: e.target.value })}
                placeholder={'MAKE AMERICA\nGREAT AGAIN'}
                maxLength={50}
                rows={2}
                className="w-full text-xs bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 rounded px-2 py-1.5 resize-none focus:outline-none focus:border-zinc-600"
              />
            </div>

            {/* Back text */}
            <div>
              <label className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-1">Back</label>
              <input
                value={config.backText || ''}
                onChange={e => update({ backText: e.target.value })}
                placeholder="Optional back text"
                maxLength={40}
                className="w-full h-7 text-xs bg-zinc-900 border border-zinc-800 text-zinc-100 placeholder:text-zinc-600 rounded px-2 focus:outline-none focus:border-zinc-600"
              />
            </div>

            {/* Colors */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-1.5">Cap</label>
                <div className="flex gap-1.5 flex-wrap">
                  {PRESET_HAT_COLORS.map(c => (
                    <button
                      key={c}
                      onClick={() => update({ hatColor: c })}
                      className={`w-6 h-6 rounded-full border-2 transition-all ${
                        config.hatColor === c ? 'border-white scale-110' : 'border-zinc-700 hover:border-zinc-500'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-1.5">Text</label>
                <div className="flex gap-1.5 flex-wrap">
                  {PRESET_TEXT_COLORS.map(c => (
                    <button
                      key={c}
                      onClick={() => update({ textColor: c })}
                      className={`w-6 h-6 rounded-full border-2 transition-all ${
                        config.textColor === c ? 'border-white scale-110' : 'border-zinc-700 hover:border-zinc-500'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Size */}
            <div>
              <label className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-1.5">Size</label>
              <div className="flex gap-1">
                {(['S', 'M', 'L', 'XL'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => update({ size: s })}
                    className={`w-8 h-7 rounded text-[10px] font-medium border transition-colors ${
                      config.size === s
                        ? 'bg-white text-black border-white'
                        : 'border-zinc-800 text-zinc-500 hover:border-zinc-600'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Buy / Share */}
            <div className="pt-1 space-y-1.5">
              <button
                onClick={handleBuy}
                className="w-full h-10 rounded bg-white text-black text-sm font-bold tracking-wide hover:bg-zinc-200 transition-colors"
              >
                Buy ${PRICE_PER_HAT}
              </button>
              <button
                onClick={handleShare}
                className="w-full h-8 rounded border border-zinc-800 text-zinc-500 text-xs hover:text-white hover:border-zinc-600 transition-colors"
              >
                Share Design
              </button>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
