import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import HatScene from '@/components/HatScene';
import { Button } from '@/components/ui/button';
import { useCart } from '@/store/cartStore';
import { buildHat, Colorway, Finish, FINISHES, finishTint, HAT_PRICE, Style } from '@/types/hat';

export default function Designer() {
  // ?preview freezes auto-rotation; ?colorway=, ?finish= and ?angle=
  // (CAMERA_PRESETS index) give deterministic renders for visual captures.
  const [params] = useSearchParams();
  const preview = params.has('preview');
  const angle = Number(params.get('angle') ?? '-1');
  const [colorway, setColorway] = useState<Colorway>(
    params.get('colorway') === 'white' ? 'white' : 'black',
  );
  const [finish, setFinish] = useState<Finish>(() => {
    const f = params.get('finish');
    return f === 'rose' || f === 'tonal' ? f : 'gold';
  });
  const [style, setStyle] = useState<Style>(
    params.get('style') === 'heritage' ? 'heritage' : 'classic',
  );
  const navigate = useNavigate();
  const { addItem } = useCart();

  const config = useMemo(() => buildHat(colorway, finish, style), [colorway, finish, style]);

  const handleAdd = () => {
    addItem(config);
    navigate('/cart');
  };

  return (
    <main className="min-h-[100dvh] bg-black text-white pt-12">
      <div className="flex flex-col lg:flex-row min-h-[calc(100dvh-3rem)]">
        <div className="flex-1 relative h-[60vh] lg:h-auto">
          <HatScene
            hatColor={config.hatColor}
            bandColor={config.bandColor}
            text={config.text}
            backText={config.backText}
            brimText={config.brimText}
            textColor={config.textColor}
            textStyle={config.textStyle}
            font={config.font}
            decals={config.decals}
            autoRotate={!preview}
            cameraPreset={angle}
            cameraPresetTrigger={preview && angle >= 0 ? 1 : 0}
            className="w-full h-full"
          />
        </div>

        <aside className="lg:w-[360px] border-l border-white/5 p-8 space-y-8">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-2">Osage Brothers</p>
            <h1 className="text-2xl font-bold tracking-tight">MEGA Hat</h1>
            <p className="text-sm text-white/50 mt-1">Make Earth Great Again</p>
          </div>

          <div className="space-y-3">
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">Colorway</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setColorway('black')}
                className={`h-14 rounded-xl border transition-colors text-xs uppercase tracking-[0.2em] font-bold ${
                  colorway === 'black'
                    ? 'border-white bg-white text-black'
                    : 'border-white/15 text-white/60 hover:border-white/30'
                }`}
              >
                Black
              </button>
              <button
                onClick={() => setColorway('white')}
                className={`h-14 rounded-xl border transition-colors text-xs uppercase tracking-[0.2em] font-bold ${
                  colorway === 'white'
                    ? 'border-white bg-white text-black'
                    : 'border-white/15 text-white/60 hover:border-white/30'
                }`}
              >
                White
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">Style</p>
            <div className="grid grid-cols-2 gap-2">
              {(['classic', 'heritage'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStyle(s)}
                  className={`h-14 rounded-xl border transition-colors text-xs uppercase tracking-[0.2em] font-bold ${
                    style === s
                      ? 'border-white bg-white text-black'
                      : 'border-white/15 text-white/60 hover:border-white/30'
                  }`}
                >
                  {s === 'classic' ? 'Classic' : 'Heritage'}
                </button>
              ))}
            </div>
            {style === 'heritage' && (
              <p className="text-xs text-white/45 leading-relaxed">
                Dove &amp; globe at the back, gold laurels and Khmer blessing on the brim.
              </p>
            )}
          </div>

          <div className="space-y-3">
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">Embroidery</p>
            <div className="grid grid-cols-3 gap-2">
              {FINISHES.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFinish(key)}
                  className={`h-14 rounded-xl border transition-colors text-[10px] uppercase tracking-[0.15em] font-bold flex flex-col items-center justify-center gap-1.5 ${
                    finish === key
                      ? 'border-white bg-white/10 text-white'
                      : 'border-white/15 text-white/60 hover:border-white/30'
                  }`}
                >
                  <span
                    className="h-3.5 w-3.5 rounded-full border border-white/25"
                    style={{ backgroundColor: finishTint(key, config.hatColor) }}
                  />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">Details</p>
            <ul className="text-sm text-white/65 space-y-1.5 leading-relaxed">
              <li>Premium ball cap</li>
              <li>Gold, rose gold or tonal embroidery</li>
              <li>"Out, Out" inside label</li>
              <li>One size, structured fit</li>
            </ul>
          </div>

          <div className="pt-2 border-t border-white/10">
            <div className="flex items-baseline justify-between mb-4">
              <span className="text-xs uppercase tracking-[0.2em] text-white/40">Price</span>
              <span className="text-3xl font-bold">${HAT_PRICE.toFixed(0)}</span>
            </div>
            <Button onClick={handleAdd} className="w-full h-12 text-sm font-bold tracking-[0.15em] uppercase">
              Add to Cart
            </Button>
          </div>
        </aside>
      </div>
    </main>
  );
}
