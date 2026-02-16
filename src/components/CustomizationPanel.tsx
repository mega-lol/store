import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ColorPicker from './ColorPicker';
import { HatConfig, FONTS, PRESET_HAT_COLORS, PRESET_TEXT_COLORS } from '@/types/hat';
import { useCart, PRICE_PER_HAT } from '@/store/cartStore';
import { ShoppingCart } from 'lucide-react';
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

  return (
    <div className="space-y-5 p-5">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-white font-serif">Design Your Hat</h2>
        <p className="text-xs text-white/40 mt-1">Front text, back text, any language.</p>
      </div>

      <ColorPicker
        label="Hat Color"
        value={config.hatColor}
        onChange={hatColor => update({ hatColor })}
        presets={PRESET_HAT_COLORS}
      />

      <div className="space-y-1.5">
        <Label className="text-white/70 text-xs">Front Text</Label>
        <Input
          value={config.text}
          onChange={e => update({ text: e.target.value })}
          placeholder="MAKE IRAN GREAT AGAIN"
          maxLength={40}
          className="text-sm bg-black border-white/20 text-white placeholder:text-white/30"
        />
        <p className="text-[10px] text-white/30">{config.text.length}/40 &middot; Use \n for new line</p>
      </div>

      <div className="space-y-1.5">
        <Label className="text-white/70 text-xs">Back Text (optional)</Label>
        <Input
          value={config.backText || ''}
          onChange={e => update({ backText: e.target.value })}
          placeholder="បង្កើតឡើងដើម្បីសន្តិភាព"
          maxLength={60}
          className="text-sm bg-black border-white/20 text-white placeholder:text-white/30"
        />
        <p className="text-[10px] text-white/30">Any language - rotate hat to see back</p>
      </div>

      <div className="space-y-1.5">
        <Label className="text-white/70 text-xs">Font</Label>
        <div className="grid grid-cols-2 gap-1.5">
          {FONTS.map(f => (
            <button
              key={f.value}
              onClick={() => update({ font: f.value })}
              className={`px-3 py-1.5 rounded border text-xs transition-colors ${
                config.font === f.value
                  ? 'border-white bg-white/10 text-white'
                  : 'border-white/10 text-white/50 hover:border-white/30'
              }`}
              style={{ fontFamily: f.value }}
            >
              {f.name}
            </button>
          ))}
        </div>
      </div>

      <ColorPicker
        label="Text Color"
        value={config.textColor}
        onChange={textColor => update({ textColor })}
        presets={PRESET_TEXT_COLORS}
      />

      <div className="space-y-1.5">
        <Label className="text-white/70 text-xs">Size</Label>
        <div className="flex gap-1.5">
          {SIZES.map(s => (
            <button
              key={s}
              onClick={() => update({ size: s })}
              className={`w-10 h-8 rounded border text-xs font-medium transition-colors ${
                config.size === s
                  ? 'border-white bg-white text-black'
                  : 'border-white/10 text-white/50 hover:border-white/30'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-white/10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-white/40">Price</span>
          <span className="text-xl font-bold text-white">${PRICE_PER_HAT}</span>
        </div>
        <Button onClick={handleAddToCart} className="w-full h-10 text-sm font-semibold bg-white text-black hover:bg-white/90" size="lg">
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
      </div>
    </div>
  );
}
