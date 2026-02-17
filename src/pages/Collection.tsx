import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import HatScene from '@/components/HatScene';
import { COUNTRY_HATS, COUNTRY_CODES, HatConfig, DEFAULT_BACK_DECALS } from '@/types/hat';

const coreEditions: HatConfig[] = [
  {
    id: 'mega-gold',
    hatColor: '#FFFFFF',
    bandColor: '#DAA520',
    text: 'MAKE EARTH\nGREAT AGAIN',
    backText: '',
    font: 'Vinegar',
    textColor: '#FFD700',
    textStyle: 'gold-embroidery',
    size: 'M',
    flagCode: undefined,
    decals: [...DEFAULT_BACK_DECALS],
  },
  {
    id: 'mega-black-gold',
    hatColor: '#000000',
    bandColor: '#000000',
    text: 'MAKE EARTH\nGREAT AGAIN',
    backText: '',
    font: 'Vinegar',
    textColor: '#FFD700',
    textStyle: 'gold-embroidery',
    size: 'M',
    flagCode: undefined,
    decals: [...DEFAULT_BACK_DECALS],
  },
  {
    id: 'white-white',
    hatColor: '#FFFFFF',
    bandColor: '#FFFFFF',
    text: 'WHITEOUT',
    backText: 'WHITEOUT',
    font: 'Vinegar',
    textColor: '#FFFFFF',
    textStyle: 'embroidery',
    size: 'M',
    flagCode: undefined,
    decals: [],
  },
  {
    id: 'black-black',
    hatColor: '#000000',
    bandColor: '#000000',
    text: 'BLACKOUT',
    backText: 'BLACKOUT',
    font: 'Vinegar',
    textColor: '#000000',
    textStyle: 'embroidery',
    size: 'M',
    flagCode: undefined,
    decals: [],
  },
];

const featuredCountryCodes = new Set(['IN', 'IR', 'UA', 'KH', 'VA']);

export default function CollectionPage() {
  const countryEditions = COUNTRY_HATS.filter((hat) => featuredCountryCodes.has(hat.countryCode));
  const comingSoon = COUNTRY_CODES.filter((country) => !featuredCountryCodes.has(country.code)).slice(0, 16);

  return (
    <main className="min-h-screen pt-14 bg-black text-white">
      <section className="border-b border-white/10">
        <div className="container py-16">
          <p className="text-[10px] tracking-[0.3em] uppercase text-white/40 mb-4">Catalog</p>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[0.9] mb-4">MEGA</h1>
          <p className="text-sm text-white/40 max-w-xl leading-relaxed">
            MAKE EARTH GREAT AGAIN. Gold embroidery on premium ball caps.
            White-on-white and black-on-black are special $80 editions.
          </p>
        </div>
      </section>

      <section className="py-14 border-b border-white/10">
        <div className="container">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-[10px] tracking-[0.3em] uppercase text-white/40 mb-2">Core Editions</p>
              <h2 className="text-2xl font-bold tracking-tight">4 Core Variations</h2>
            </div>
            <Link to="/designer">
              <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white hover:text-black text-xs tracking-wider">
                Open Designer
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/10">
            {coreEditions.map((hat) => (
              <div key={hat.id} className="bg-black">
                <div className="h-64">
                  <HatScene
                    hatColor={hat.hatColor}
                    bandColor={hat.bandColor}
                    text={hat.text}
                    backText={hat.backText}
                    textColor={hat.textColor}
                    textStyle={hat.textStyle}
                    font={hat.font}
                    flagCode={hat.flagCode}
                    decals={hat.decals}
                    autoRotate
                    className="w-full h-full"
                  />
                </div>
                <div className="p-4 border-t border-white/10 space-y-1">
                  <p className="text-xs tracking-widest uppercase text-white/70">{hat.text.replace('\n', ' ')}</p>
                  <p className="text-[10px] text-white/35">{hat.textStyle.replace('-', ' ')} · {hat.font} · {hat.size}</p>
                  {hat.backText && (
                    <p className="text-[10px] text-white/25 truncate">Back: {hat.backText}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 border-b border-white/10">
        <div className="container">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-[10px] tracking-[0.3em] uppercase text-white/40 mb-2">Celebrate Every Culture</p>
              <h2 className="text-2xl font-bold tracking-tight">World Editions</h2>
              <p className="text-xs text-white/40 mt-2">Rep your heritage, celebrate your roots — matching colors for every flag on Earth.</p>
            </div>
            <Link to="/designer">
              <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white hover:text-black text-xs tracking-wider">
                Customize In Designer
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/10">
            {countryEditions.map((hat) => (
              <div key={hat.id} className="bg-black">
                <div className="h-64">
                  <HatScene
                    hatColor={hat.hatColor}
                    bandColor={hat.bandColor}
                    text={hat.text}
                    backText={hat.backText}
                    textColor={hat.textColor}
                    textStyle={hat.textStyle}
                    font={hat.font}
                    flagCode={hat.flagCode}
                    decals={hat.decals}
                    autoRotate
                    className="w-full h-full"
                  />
                </div>
                <div className="p-4 border-t border-white/10">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs tracking-widest uppercase text-white/80">{hat.countryName}</p>
                    <span className="text-[10px] tracking-[0.2em] text-white/30">{hat.countryCode}</span>
                  </div>
                  <p className="text-[10px] text-white/35">{hat.textStyle.replace('-', ' ')} · {hat.font} · {hat.size}</p>
                  {hat.backText && (
                    <p className="text-[10px] text-white/25 truncate mt-0.5">Back: {hat.backText}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 border-b border-white/10">
        <div className="container">
          <p className="text-[10px] tracking-[0.3em] uppercase text-white/40 mb-2">Coming Next</p>
          <h2 className="text-2xl font-bold tracking-tight mb-6">Flag Placeholders</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-8 gap-px bg-white/5">
            {comingSoon.map((country) => (
              <Link
                key={country.code}
                to="/designer"
                className="bg-black p-3 text-center hover:bg-white/5 transition-colors"
              >
                <div className="text-lg mb-1">
                  {String.fromCodePoint(0x1f1e6 + country.code.charCodeAt(0) - 65)}
                  {String.fromCodePoint(0x1f1e6 + country.code.charCodeAt(1) - 65)}
                </div>
                <div className="text-[10px] text-white/60 leading-tight">{country.name}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="container py-16">
          <h2 className="text-3xl font-bold tracking-tight mb-4">Design Your Own</h2>
          <p className="text-sm text-white/40 mb-8 leading-relaxed max-w-lg">
            Start with a cap, then add text, flags, decals, and custom textures directly on the 3D model.
          </p>
          <Link to="/designer">
            <Button className="bg-white text-black hover:bg-white/90 text-xs tracking-[0.2em] uppercase px-8 h-10">
              Open Designer
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
