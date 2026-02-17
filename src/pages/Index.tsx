import { Link } from 'react-router-dom';
import HatScene from '@/components/HatScene';
import { DEFAULT_HAT } from '@/types/hat';
import { useCart, getHatPrice } from '@/store/cartStore';
import { useToast } from '@/hooks/use-toast';

const config = DEFAULT_HAT;
const defaultPrice = getHatPrice(config);

const QUOTES = [
  {
    text: 'We are not combatants — we are citizens of the world, and our allegiance is to humanity.',
    author: 'The MEGA Movement',
  },
  {
    text: 'Borders divide maps, not people. What unites us will always be greater than what separates us.',
    author: 'The MEGA Movement',
  },
  {
    text: 'The future belongs to those who build bridges, not walls. Together, we are unstoppable.',
    author: 'The MEGA Movement',
  },
];

export default function Index() {
  const { addItem } = useCart();
  const { toast } = useToast();

  const handleBuy = () => {
    addItem(config);
    toast({ title: 'Added to cart', description: 'MEGA hat added to your cart.' });
  };

  return (
    <main className="min-h-screen bg-white text-black overflow-x-hidden pt-12">
      {/* ─── HERO ─── */}
      <section className="relative h-[100dvh] -mt-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-neutral-950 to-stone-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.14)_0%,transparent_55%)]" />

        {/* Hat preview */}
        <div className="absolute inset-0 animate-scale-in" style={{ opacity: 0 }}>
          <HatScene
            hatColor={config.hatColor}
            bandColor={config.bandColor}
            text={config.text}
            backText={config.backText}
            textColor={config.textColor}
            textStyle={config.textStyle}
            font={config.font}
            flagCode={config.flagCode}
            decals={config.decals}
            autoRotate
            className="w-full h-full"
          />
        </div>

        {/* Headline */}
        <div className="absolute top-20 left-6 md:left-12 z-10 max-w-xl animate-fade-up delay-300" style={{ opacity: 0 }}>
          {/* tagline hidden for now */}
          <h1 className="text-5xl sm:text-6xl md:text-8xl lg:text-[7.5rem] font-black tracking-[-0.06em] leading-[0.84] text-white drop-shadow-[0_10px_45px_rgba(0,0,0,0.7)]">
            MAKE EARTH<br />GREAT AGAIN
          </h1>
          <p className="mt-4 text-sm md:text-base text-white/55 leading-relaxed max-w-md">
            Join the movement. Wear the mission.
          </p>
        </div>

        {/* CTA */}
        <div className="absolute bottom-12 left-6 md:left-12 z-10 animate-fade-up delay-500" style={{ opacity: 0 }}>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleBuy}
              className="h-11 px-8 rounded-full bg-white text-black text-xs tracking-[0.2em] uppercase font-bold hover:bg-white/90 transition-colors shadow-[0_12px_44px_rgba(0,0,0,0.35)]"
            >
              Pre-order ${defaultPrice}
            </button>
            <Link
              to="/designer"
              className="h-11 px-6 rounded-full border border-white/25 text-white/75 text-xs tracking-[0.2em] uppercase hover:text-white hover:border-white/50 hover:bg-white/5 transition-colors flex items-center"
            >
              Design Your Own
            </Link>
            <a
              href="#movement"
              className="h-11 px-6 rounded-full text-white/55 text-xs tracking-[0.2em] uppercase hover:text-white hover:bg-white/5 transition-colors flex items-center"
            >
              Learn More
            </a>
          </div>
        </div>

        <div className="absolute bottom-12 right-6 md:right-12 z-10 animate-fade-up delay-700" style={{ opacity: 0 }}>
          <p className="text-[10px] tracking-[0.2em] uppercase text-white/35">Drag to rotate</p>
        </div>
      </section>

      {/* ─── MOVEMENT ─── */}
      <section id="movement" className="py-24 md:py-32 border-t border-black/5">
        <div className="container max-w-4xl mx-auto px-6 md:px-12">
          <p className="text-[10px] tracking-[0.4em] uppercase text-black/30 mb-4">The Movement</p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight leading-[0.92] mb-8">
            One world. One mission.
          </h2>
          <div className="space-y-6 text-base md:text-lg text-black/50 leading-relaxed">
            <p>
              <strong className="text-black/80">Make Earth Great Again</strong> is a movement for everyone
              who believes that isolationist and nationalist politics endanger our shared future. We envision
              a world where every person has access to the resources they need to live a healthy, happy,
              and fulfilling life — regardless of background, ethnicity, or circumstances.
            </p>
            <p>
              We believe there are more of <em>us</em> than there are of <em>them</em>. Moderates and
              compassionate people everywhere have been too silent for too long. It's time to unite into what
              could become the most powerful movement the Earth has ever seen — or at least make the attempt.
            </p>
            <p>
              Acts of kindness. Peaceful resistance. Local action with global impact.
              The future is now. The stakes have never been greater and the rewards are priceless.
            </p>
          </div>
        </div>
      </section>

      {/* ─── QUOTES ─── */}
      <section className="py-20 md:py-28 bg-stone-50 border-t border-black/5">
        <div className="container max-w-5xl mx-auto px-6 md:px-12">
          <p className="text-[10px] tracking-[0.4em] uppercase text-black/30 mb-12 text-center">Citizens of the World</p>
          <div className="grid gap-12 md:gap-16">
            {QUOTES.map((q, i) => (
              <blockquote key={i} className="text-center max-w-2xl mx-auto">
                <p className="text-lg md:text-xl text-black/60 leading-relaxed italic">
                  &ldquo;{q.text}&rdquo;
                </p>
                <cite className="block mt-3 text-[11px] tracking-[0.3em] uppercase text-black/30 not-italic">
                  — {q.author}
                </cite>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SHOP ─── */}
      <section className="py-24 md:py-32 border-t border-black/5">
        <div className="container max-w-5xl mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-[10px] tracking-[0.4em] uppercase text-black/30 mb-4">Wear the Mission</p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight leading-[0.92] mb-6">
                MEGA Hat Shop
              </h2>
              <p className="text-base text-black/45 leading-relaxed mb-6">
                Gold embroidery on premium ball caps. Every purchase supports the movement.
                Design your own with custom text, colors, country flags, and decals — or grab a classic.
              </p>
              <p className="text-sm text-black/30 leading-relaxed mb-8">
                White-on-white and black-on-black special editions available at $80.
                New designs ship after 1,000 pre-orders.
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={handleBuy}
                  className="h-11 px-8 rounded-full bg-black text-white text-xs tracking-[0.2em] uppercase font-bold hover:bg-black/80 transition-colors"
                >
                  Pre-order ${defaultPrice}
                </button>
                <Link
                  to="/designer"
                  className="h-11 px-6 rounded-full border border-black/20 text-black/60 text-xs tracking-[0.2em] uppercase hover:text-black hover:border-black/40 transition-colors flex items-center"
                >
                  Open Designer
                </Link>
                <Link
                  to="/collection"
                  className="h-11 px-6 rounded-full text-black/40 text-xs tracking-[0.2em] uppercase hover:text-black transition-colors flex items-center"
                >
                  View Collection
                </Link>
              </div>
            </div>
            <div className="h-80 md:h-96">
              <HatScene
                hatColor={config.hatColor}
                bandColor={config.bandColor}
                text={config.text}
                backText={config.backText}
                textColor={config.textColor}
                textStyle={config.textStyle}
                font={config.font}
                flagCode={config.flagCode}
                decals={config.decals}
                autoRotate
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─── JOIN ─── */}
      <section className="py-24 md:py-32 bg-black text-white">
        <div className="container max-w-3xl mx-auto px-6 md:px-12 text-center">
          <p className="text-[10px] tracking-[0.5em] uppercase text-white/30 mb-6">Together</p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight leading-[0.92] mb-6">
            Join the MEGA Mission
          </h2>
          <p className="text-base text-white/40 leading-relaxed mb-10 max-w-lg mx-auto">
            If one person can make a difference, then a multitude of committed individuals
            can perform miracles. Let's fight hate, intolerance, and discrimination together.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <a
              href="mailto:support@megamovement.org"
              className="h-11 px-8 rounded-full bg-white text-black text-xs tracking-[0.2em] uppercase font-bold hover:bg-white/90 transition-colors inline-flex items-center"
            >
              Get Involved
            </a>
            <Link
              to="/designer"
              className="h-11 px-6 rounded-full border border-white/20 text-white/70 text-xs tracking-[0.2em] uppercase hover:text-white hover:border-white/40 transition-colors inline-flex items-center"
            >
              Design a Hat
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="py-8 border-t border-black/5 bg-white">
        <div className="container max-w-5xl mx-auto px-6 md:px-12 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[10px] tracking-[0.2em] uppercase text-black/25">
            Make Earth Great Again &copy; {new Date().getFullYear()}
          </p>
          <div className="flex items-center gap-6">
            <a
              href="mailto:support@megamovement.org"
              className="text-[10px] tracking-[0.15em] uppercase text-black/25 hover:text-black/60 transition-colors"
            >
              Contact
            </a>
            <Link
              to="/collection"
              className="text-[10px] tracking-[0.15em] uppercase text-black/25 hover:text-black/60 transition-colors"
            >
              Shop
            </Link>
            <Link
              to="/designer"
              className="text-[10px] tracking-[0.15em] uppercase text-black/25 hover:text-black/60 transition-colors"
            >
              Designer
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
