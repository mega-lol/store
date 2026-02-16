import { Button } from '@/components/ui/button';
import ColorPicker from './ColorPicker';
import { HatConfig, PRESET_HAT_COLORS, PRESET_TEXT_COLORS } from '@/types/hat';
import { useCart, PRICE_PER_HAT } from '@/store/cartStore';
import { ShoppingCart, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CustomizationPanelProps {
  config: HatConfig;
  onChange: (config: HatConfig) => void;
}

const SIZES = ['S', 'M', 'L', 'XL'] as const;

export default function CustomizationPanel({ config, onChange }: CustomizationPanelProps) {
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

  return (
    <div className="space-y-5 p-5">
      <div>
        <h2 className="text-lg font-bold tracking-tight text-white">Design Your Hat</h2>
        <p className="text-[10px] text-white/30 mt-1 tracking-wide">Front text, back text, any language.</p>
      </div>

      <ColorPicker
        label="Hat Color"
        value={config.hatColor}
        onChange={hatColor => update({ hatColor })}
        presets={PRESET_HAT_COLORS}
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

      <ColorPicker
        label="Text Color"
        value={config.textColor}
        onChange={textColor => update({ textColor })}
        presets={PRESET_TEXT_COLORS}
      />

      <div className="space-y-1.5">
        <label className="text-[10px] tracking-[0.2em] uppercase text-white/40">Size</label>
        <div className="flex gap-1.5">
          {SIZES.map(s => (
            <button
              key={s}
              onClick={() => update({ size: s })}
              className={`w-10 h-8 text-xs font-medium border transition-colors ${
                config.size === s
                  ? 'border-white bg-white text-black'
                  : 'border-white/10 text-white/40 hover:border-white/30'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-white/5 space-y-2">
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
