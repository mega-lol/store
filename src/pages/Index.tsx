import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import HatScene from '@/components/HatScene';
import { DEFAULT_HAT, HatConfig, PRESET_HAT_COLORS, PRESET_TEXT_COLORS } from '@/types/hat';
import { useCart, PRICE_PER_HAT } from '@/store/cartStore';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, Share2, Info } from 'lucide-react';

export default function Index() {
  const [config, setConfig] = useState<HatConfig>({ ...DEFAULT_HAT });
  const [showAbout, setShowAbout] = useState(false);
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
            showViewButtons
            className="w-full h-full"
          />
        </div>

        {/* Controls */}
        <div className="lg:w-[340px] border-l border-zinc-800 overflow-y-auto bg-zinc-950 shrink-0">
          <div className="p-4 space-y-3">

            {/* Logo */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CapLogo color={config.hatColor} size={28} />
                <span className="text-sm font-semibold tracking-wider">MakeHatAgain</span>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowAbout(!showAbout)}>
                <Info className="h-3.5 w-3.5" />
              </Button>
            </div>

            {showAbout && (
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                Design custom "Make Great" hats for any country, in any language.
                Black cap, white embroidery. Share your design or buy one.
              </p>
            )}

            <Separator className="bg-zinc-800" />

            {/* Front text */}
            <Field label="Front Text">
              <Input
                value={config.text}
                onChange={e => update({ text: e.target.value })}
                placeholder="MAKE IRAN\nGREAT AGAIN"
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

// SVG cap logo that matches current hat color
function CapLogo({ color, size = 24 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Brim */}
      <path
        d="M2 16C2 16 6 18 12 18C18 18 22 16 22 16L20 15C20 15 16.5 16.5 12 16.5C7.5 16.5 4 15 4 15L2 16Z"
        fill={color}
        stroke="currentColor"
        strokeWidth="0.5"
        opacity="0.9"
      />
      {/* Crown */}
      <path
        d="M5 15C5 15 5 8 12 6C19 8 19 15 19 15"
        fill={color}
        stroke="currentColor"
        strokeWidth="0.5"
      />
      {/* Button */}
      <circle cx="12" cy="6" r="0.8" fill={color} stroke="currentColor" strokeWidth="0.3" />
    </svg>
  );
}
