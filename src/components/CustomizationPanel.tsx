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
    toast({ title: '🧢 Added to cart!', description: `Your custom hat has been added.` });
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight font-display">Customize Your Hat</h2>
        <p className="text-sm text-muted-foreground mt-1">Design it. Own it.</p>
      </div>

      <ColorPicker
        label="Hat Color"
        value={config.hatColor}
        onChange={hatColor => update({ hatColor })}
        presets={PRESET_HAT_COLORS}
      />

      <div className="space-y-2">
        <Label>Your Text</Label>
        <Input
          value={config.text}
          onChange={e => update({ text: e.target.value })}
          placeholder="Type your message..."
          maxLength={40}
          className="text-base"
        />
        <p className="text-xs text-muted-foreground">{config.text.length}/40 characters</p>
      </div>

      <div className="space-y-2">
        <Label>Font Style</Label>
        <div className="grid grid-cols-2 gap-2">
          {FONTS.map(f => (
            <button
              key={f.value}
              onClick={() => update({ font: f.value })}
              className={`px-3 py-2 rounded-md border text-sm transition-colors ${
                config.font === f.value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border hover:border-muted-foreground'
              }`}
              style={{ fontFamily: f.value }}
            >
              {f.name}
            </button>
          ))}
        </div>
      </div>

      <ColorPicker
        label="Stitching / Text Color"
        value={config.textColor}
        onChange={textColor => update({ textColor })}
        presets={PRESET_TEXT_COLORS}
      />

      <div className="space-y-2">
        <Label>Size</Label>
        <div className="flex gap-2">
          {SIZES.map(s => (
            <button
              key={s}
              onClick={() => update({ size: s })}
              className={`w-12 h-10 rounded-md border text-sm font-medium transition-colors ${
                config.size === s
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border hover:border-muted-foreground'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-border">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted-foreground">Price</span>
          <span className="text-2xl font-bold text-primary">${PRICE_PER_HAT}</span>
        </div>
        <Button onClick={handleAddToCart} className="w-full h-12 text-base font-semibold" size="lg">
          <ShoppingCart className="mr-2 h-5 w-5" />
          Add to Cart
        </Button>
      </div>
    </div>
  );
}
