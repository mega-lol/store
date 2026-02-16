import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import HatScene from '@/components/HatScene';
import { DEFAULT_HAT, HatConfig, PRESET_HAT_COLORS, PRESET_TEXT_COLORS } from '@/types/hat';
import { useCart, PRICE_PER_HAT } from '@/store/cartStore';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, Share2 } from 'lucide-react';

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
      navigator.share({ title: 'MAKE GREAT', text: t, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: 'Copied', description: 'Link copied to clipboard.' });
    }
  };

  return (
    <main className="h-screen bg-zinc-950 text-zinc-100 overflow-hidden pt-14">
      <div className="flex flex-col lg:flex-row h-[calc(100vh-3.5rem)]">

        {/* 3D viewport */}
        <div className="flex-1 relative min-h-[45vh] lg:min-h-0">
          <HatScene
            hatColor={config.hatColor}
            text={config.text}
            backText={config.backText}
            textColor={config.textColor}
            className="w-full h-full"
          />
        </div>

        {/* Controls */}
        <div className="lg:w-[340px] border-l border-zinc-800 overflow-y-auto bg-zinc-950 shrink-0">
          <div className="p-4 space-y-3">

            {/* Logo */}
            <div className="flex items-center gap-2">
              <span className="text-xl">🧢</span>
              <span className="text-sm font-semibold tracking-wider">MakeHatAgain</span>
            </div>

            <Separator className="bg-zinc-800" />

            {/* Front text */}
            <Field label="Front Text">
              <Input
                value={config.text}
                onChange={e => update({ text: e.target.value })}
                placeholder="MAKE AMERICA\nGREAT AGAIN"
                maxLength={40}
                className="h-8 text-xs bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-600"
              />
            </Field>

            {/* Back text */}
            <Field label="Back Text">
              <Input
                value={config.backText || ''}
                onChange={e => update({ backText: e.target.value })}
                placeholder="បង្កើតឡើងដើម្បីសន្តិភorg"
                maxLength={60}
                className="h-8 text-xs bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-600"
              />
            </Field>

            {/* Hat color */}
            <Field label="Cap Color">
              <div className="flex gap-1.5 flex-wrap">
                {PRESET_HAT_COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => update({ hatColor: c })}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${
                      config.hatColor === c ? 'border-zinc-100 scale-110' : 'border-zinc-700'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </Field>

            {/* Text color */}
            <Field label="Text Color">
              <div className="flex gap-1.5 flex-wrap">
                {PRESET_TEXT_COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => update({ textColor: c })}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${
                      config.textColor === c ? 'border-zinc-100 scale-110' : 'border-zinc-700'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </Field>

            {/* Size */}
            <Field label="Size">
              <div className="flex gap-1">
                {(['S', 'M', 'L', 'XL'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => update({ size: s })}
                    className={`w-8 h-7 rounded text-[10px] font-medium border transition-colors ${
                      config.size === s
                        ? 'bg-zinc-100 text-zinc-900 border-zinc-100'
                        : 'border-zinc-800 text-zinc-500 hover:border-zinc-600'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </Field>

            <Separator className="bg-zinc-800" />

            {/* Actions */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Price</span>
                <span className="text-lg font-bold">${PRICE_PER_HAT}</span>
              </div>

              <Button onClick={handleBuy} className="w-full h-9 text-xs font-semibold bg-zinc-100 text-zinc-900 hover:bg-zinc-200">
                <ShoppingCart className="mr-1.5 h-3.5 w-3.5" />
                Buy Now
              </Button>

              <Button onClick={handleShare} variant="outline" className="w-full h-8 text-[11px] border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900">
                <Share2 className="mr-1.5 h-3 w-3" />
                Share Design
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-[10px] text-zinc-500 uppercase tracking-wider">{label}</Label>
      {children}
    </div>
  );
}

