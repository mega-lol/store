import { useState } from 'react';
import { Link } from 'react-router-dom';
import HatScene from '@/components/HatScene';
import { DEFAULT_HAT, HatConfig, PRESET_HAT_COLORS, PRESET_TEXT_COLORS, COUNTRY_MG_HATS } from '@/types/hat';
import { useCart, PRICE_PER_HAT } from '@/store/cartStore';
import { useToast } from '@/hooks/use-toast';

export default function Index() {
  const [config, setConfig] = useState<HatConfig>({ ...DEFAULT_HAT });
  const [showControls, setShowControls] = useState(false);
  const { addItem } = useCart();
  const { toast } = useToast();

  const update = (partial: Partial<HatConfig>) => setConfig(prev => ({ ...prev, ...partial }));

  const handleBuy = () => {
    addItem(config);
    toast({ title: 'Added to cart', description: `${config.text.replace(/\n/g, ' ')} hat added.` });
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
      await navigator.clipboard.writeText(window.location.href);
      toast({ title: 'Copied', description: 'Link copied.' });
    }
  };

  return (
    <main className="h-[100dvh] bg-black text-white overflow-hidden">

      {/* Full viewport hero */}
      <div className="relative h-full">

        {/* 3D Hat - full viewport */}
        <div className="absolute inset-0 animate-scale-in" style={{ opacity: 0 }}>
          <HatScene
            hatColor={config.hatColor}
            text={config.text}
            backText={config.backText}
            textColor={config.textColor}
            className="w-full h-full"
          />
        </div>

        {/* Top-left branding */}
        <div className="absolute top-16 left-6 z-10 animate-fade-up delay-300" style={{ opacity: 0 }}>
          <p className="text-[9px] tracking-[0.4em] uppercase text-white/30 mb-2">Make Earth Great Again</p>
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter leading-[0.85]">
            MEGA
          </h1>
        </div>

        {/* Bottom-left tagline */}
        <div className="absolute bottom-8 left-6 z-10 animate-fade-up delay-500" style={{ opacity: 0 }}>
          <p className="text-[10px] tracking-[0.3em] uppercase text-white/30 mb-3">Any country. Any language.</p>
          <div className="flex items-center gap-3">
            <button
              onClick={handleBuy}
              className="h-10 px-8 bg-white text-black text-xs tracking-[0.2em] uppercase font-bold hover:bg-white/90 transition-colors"
            >
              Buy ${PRICE_PER_HAT}
            </button>
            <button
              onClick={handleShare}
              className="h-10 px-6 border border-white/20 text-white/60 text-xs tracking-[0.2em] uppercase hover:text-white hover:border-white/40 transition-colors"
            >
              Share
            </button>
            <Link
              to="/designer"
              className="h-10 px-6 border border-white/20 text-white/60 text-xs tracking-[0.2em] uppercase hover:text-white hover:border-white/40 transition-colors flex items-center"
            >
              Design
            </Link>
          </div>
        </div>

        {/* Right side - minimal controls toggle */}
        <div className="absolute bottom-8 right-6 z-10 animate-fade-up delay-700" style={{ opacity: 0 }}>
          <button
            onClick={() => setShowControls(!showControls)}
            className="text-[10px] tracking-[0.2em] uppercase text-white/30 hover:text-white/60 transition-colors"
          >
            {showControls ? 'Close' : 'Customize'}
          </button>
        </div>

        {/* Slide-up controls panel */}
        {showControls && (
          <div className="absolute bottom-20 right-6 z-10 w-64 bg-black/90 backdrop-blur-xl border border-white/10 p-4 space-y-4 animate-fade-up">

            {/* Front text */}
            <div>
              <label className="text-[9px] tracking-[0.3em] uppercase text-white/30 block mb-1">Front</label>
              <textarea
                value={config.text}
                onChange={e => update({ text: e.target.value })}
                placeholder={'MAKE EARTH\nGREAT AGAIN'}
                maxLength={50}
                rows={2}
                className="w-full text-xs bg-transparent border border-white/10 text-white placeholder:text-white/20 px-2 py-1.5 resize-none focus:outline-none focus:border-white/30"
              />
            </div>

            {/* Back text */}
            <div>
              <label className="text-[9px] tracking-[0.3em] uppercase text-white/30 block mb-1">Back</label>
              <input
                value={config.backText || ''}
                onChange={e => update({ backText: e.target.value })}
                placeholder="Optional"
                maxLength={40}
                className="w-full h-7 text-xs bg-transparent border border-white/10 text-white placeholder:text-white/20 px-2 focus:outline-none focus:border-white/30"
              />
            </div>

            {/* Hat colors */}
            <div>
              <label className="text-[9px] tracking-[0.3em] uppercase text-white/30 block mb-1.5">Cap</label>
              <div className="flex gap-1.5 flex-wrap">
                {PRESET_HAT_COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => update({ hatColor: c })}
                    className={`w-5 h-5 rounded-full border transition-all ${
                      config.hatColor === c ? 'border-white scale-125' : 'border-white/20 hover:border-white/40'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            {/* Text colors */}
            <div>
              <label className="text-[9px] tracking-[0.3em] uppercase text-white/30 block mb-1.5">Text</label>
              <div className="flex gap-1.5 flex-wrap">
                {PRESET_TEXT_COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => update({ textColor: c })}
                    className={`w-5 h-5 rounded-full border transition-all ${
                      config.textColor === c ? 'border-white scale-125' : 'border-white/20 hover:border-white/40'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            {/* Size */}
            <div>
              <label className="text-[9px] tracking-[0.3em] uppercase text-white/30 block mb-1.5">Size</label>
              <div className="flex gap-1">
                {(['S', 'M', 'L', 'XL'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => update({ size: s })}
                    className={`w-8 h-6 text-[10px] font-medium border transition-colors ${
                      config.size === s
                        ? 'bg-white text-black border-white'
                        : 'border-white/10 text-white/40 hover:border-white/30'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Featured MEGA hats - bottom ticker */}
        <div className="absolute top-16 right-6 z-10 animate-fade-up delay-1000" style={{ opacity: 0 }}>
          <p className="text-[9px] tracking-[0.3em] uppercase text-white/20 mb-2">Top Hats</p>
          <div className="space-y-1">
            {COUNTRY_MG_HATS.slice(0, 4).map((hat, i) => (
              <button
                key={hat.id}
                onClick={() => setConfig({ ...config, text: hat.text, hatColor: hat.hatColor, textColor: hat.textColor, backText: hat.backText })}
                className="block text-[10px] text-white/30 hover:text-white transition-colors text-right"
              >
                <span className="text-white/10 mr-2">{String(i + 1).padStart(2, '0')}</span>
                {hat.text.replace('\n', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
