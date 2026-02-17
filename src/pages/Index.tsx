import { Link } from 'react-router-dom';
import HatScene from '@/components/HatScene';
import { DEFAULT_HAT } from '@/types/hat';
import { useCart, getHatPrice } from '@/store/cartStore';
import { useToast } from '@/hooks/use-toast';

const config = DEFAULT_HAT;
const defaultPrice = getHatPrice(config);

const QUOTES = [
  {
    text: 'Every culture carries something powerful. When we honor each other, we grow stronger.',
    author: 'MEGA Earth',
  },
  {
    text: 'Kindness travels. One hat, one cause, one step closer to the world we want.',
    author: 'MEGA Earth',
  },
  {
    text: 'Different flags. Different stories. One shared home. Let\u2019s show up for each other.',
    author: 'MEGA Earth',
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
          <p className="text-[10px] tracking-[0.4em] uppercase text-white/40 mb-3">MEGA &middot; Shop &middot; Designer</p>
          <h1 className="text-5xl sm:text-6xl md:text-8xl lg:text-[7.5rem] font-black tracking-[-0.06em] leading-[0.84] text-white drop-shadow-[0_10px_45px_rgba(0,0,0,0.7)]">
            MEGA<br />EARTH!
          </h1>
          <p className="mt-5 text-lg md:text-xl text-white/65 font-medium leading-snug max-w-md">
            Make Earth Great — Together
          </p>
          <p className="mt-3 text-sm md:text-base text-white/45 leading-relaxed max-w-md">
            One planet. One people. One future.<br />
            Celebrate every culture. Back real causes. Wear the mission.
          </p>
        </div>

        {/* CTA */}
        <div className="absolute bottom-12 left-6 md:left-12 z-10 animate-fade-up delay-500" style={{ opacity: 0 }}>
          <div className="flex items-center gap-3 flex-wrap">
            <Link
              to="/designer"
              className="h-11 px-8 rounded-full bg-white text-black text-xs tracking-[0.2em] uppercase font-bold hover:bg-white/90 transition-colors shadow-[0_12px_44px_rgba(0,0,0,0.35)] flex items-center"
            >
              Design Your Own
            </Link>
            <a
              href="#movement"
              className="h-11 px-6 rounded-full border border-white/25 text-white/75 text-xs tracking-[0.2em] uppercase hover:text-white hover:border-white/50 hover:bg-white/5 transition-colors flex items-center"
            >
              Learn More
            </a>
          </div>
        </div>

        <div className="absolute bottom-12 right-6 md:right-12 z-10 animate-fade-up delay-700" style={{ opacity: 0 }}>
          <p className="text-[10px] tracking-[0.2em] uppercase text-white/35">Drag to rotate</p>
        </div>
      </section>

      {/* ─── THE MOVEMENT ─── */}
      <section id="movement" className="py-24 md:py-32 border-t border-black/5">
        <div className="container max-w-4xl mx-auto px-6 md:px-12">
          <p className="text-[10px] tracking-[0.4em] uppercase text-black/30 mb-4">The Movement</p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight leading-[0.92] mb-8">
            One world. One us.
          </h2>
          <div className="space-y-6 text-base md:text-lg text-black/50 leading-relaxed">
            <p>
              This is the Earth we all share — and the Earth we all belong in.{' '}
              <strong className="text-black/80">MEGA Earth!</strong> is for everyone who loves this planet and the people on it.
            </p>
            <p>
              We celebrate every culture, every community, every story — because when we lift each other up, everybody rises.
            </p>
            <p>
              Most people are good. Most people want to help.
              MEGA exists to turn that everyday goodness into real impact — connecting people to trusted non-profits,
              local heroes, and global causes doing the work.
            </p>
            <p>
              Every hat supports vetted charitable causes around the world.
              Small action. Big ripple. Local love with global reach.
              The future is now — and it's ours to build.
            </p>
          </div>
        </div>
      </section>

      {/* ─── PEOPLE OF EARTH ─── */}
      <section className="py-20 md:py-28 bg-stone-50 border-t border-black/5">
        <div className="container max-w-5xl mx-auto px-6 md:px-12">
          <p className="text-[10px] tracking-[0.4em] uppercase text-black/30 mb-12 text-center">People of Earth</p>
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
                Gold embroidery on premium ball caps.
                A portion of every purchase goes directly to non-profits and impact causes worldwide.
              </p>
              <p className="text-base text-black/45 leading-relaxed mb-6">
                Create yours with custom text, colors, country flags, and decals — or choose a classic.
              </p>
              <p className="text-sm text-black/30 leading-relaxed mb-8">
                White-on-white and black-on-black special editions: $80.
                New designs ship after 1,000 pre-orders.
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                <Link
                  to="/designer"
                  className="h-11 px-8 rounded-full bg-black text-white text-xs tracking-[0.2em] uppercase font-bold hover:bg-black/80 transition-colors flex items-center"
                >
                  Open Designer
                </Link>
                <Link
                  to="/collection"
                  className="h-11 px-6 rounded-full border border-black/20 text-black/60 text-xs tracking-[0.2em] uppercase hover:text-black hover:border-black/40 transition-colors flex items-center"
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
          <p className="text-base text-white/40 leading-relaxed mb-4 max-w-lg mx-auto">
            One person can spark change. A million can move the world.
            Wear the hat. Support a cause. Celebrate every culture.
          </p>
          <p className="text-lg text-white/55 font-medium mb-10 max-w-lg mx-auto">
            This is our home. This is our moment.<br />
            MEGA Earth!
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
          <p className="text-[9px] tracking-[0.1em] text-black/15">
            ADXYZ Inc &middot; Payments via Hanzo Commerce
          </p>
        </div>
      </footer>
    </main>
  );
}
