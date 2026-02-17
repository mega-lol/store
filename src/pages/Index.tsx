import { Link } from 'react-router-dom';
import HatScene from '@/components/HatScene';
import { DEFAULT_HAT } from '@/types/hat';
import { useCart, getHatPrice } from '@/store/cartStore';
import { useToast } from '@/hooks/use-toast';

const config = DEFAULT_HAT;
const defaultPrice = getHatPrice(config);
const adxyzHomeUrl = import.meta.env.VITE_ADXYZ_HOME_URL || 'https://ad.xyz';

export default function Index() {
  const { addItem } = useCart();
  const { toast } = useToast();

  const handleBuy = () => {
    addItem(config);
    toast({ title: 'Added to cart', description: `${config.text.replace(/\n/g, ' ')} product added.` });
  };

  return (
    <main className="h-[100dvh] overflow-hidden relative">
      {/* Soft gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-100 via-neutral-50 to-stone-100" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.04)_100%)]" />

      {/* 3D product preview - full viewport, centered and prominent */}
      <div className="absolute inset-0 animate-scale-in" style={{ opacity: 0 }}>
        <HatScene
          hatColor={config.hatColor}
          bandColor={config.bandColor}
          text={config.text}
          backText={config.backText}
          textColor={config.textColor}
          font={config.font}
          flagCode={config.flagCode}
          autoRotate
          className="w-full h-full"
        />
      </div>

      {/* Top-left branding */}
      <div className="absolute top-16 left-6 z-10 animate-fade-up delay-300" style={{ opacity: 0 }}>
        <p className="text-[9px] tracking-[0.4em] uppercase text-black/30 mb-2">3D Clothing Designer</p>
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter leading-[0.85] text-black/90">
          MEGA
        </h1>
      </div>

      {/* Bottom actions */}
      <div className="absolute bottom-8 left-6 z-10 animate-fade-up delay-500" style={{ opacity: 0 }}>
        <p className="text-[10px] tracking-[0.3em] uppercase text-black/30 mb-3">Ball caps first. More apparel next.</p>
        <div className="flex items-center gap-3">
          <button
            onClick={handleBuy}
            className="h-10 px-8 bg-black text-white text-xs tracking-[0.2em] uppercase font-bold hover:bg-black/80 transition-colors"
          >
            Pre-order ${defaultPrice}
          </button>
          <Link
            to="/designer"
            className="h-10 px-6 border border-black/20 text-black/60 text-xs tracking-[0.2em] uppercase hover:text-black hover:border-black/40 transition-colors flex items-center"
          >
            Design
          </Link>
        </div>
      </div>

      {/* Bottom-right hint */}
      <div className="absolute bottom-8 right-6 z-10 animate-fade-up delay-700" style={{ opacity: 0 }}>
        <p className="text-[10px] tracking-[0.2em] uppercase text-black/20">
          Drag to rotate
        </p>
      </div>

      {/* Tiny ADXYZ link */}
      <a
        href={adxyzHomeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-2 left-6 z-10 text-[9px] tracking-[0.24em] uppercase text-black/35 hover:text-black/70 transition-colors"
      >
        ad.xyz
      </a>
    </main>
  );
}
