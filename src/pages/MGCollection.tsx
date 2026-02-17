import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import HatScene from '@/components/HatScene';
import { COUNTRY_HATS, COUNTRY_CODES, HatConfig } from '@/types/hat';
import { getHatPrice } from '@/store/cartStore';

const megaEditions: HatConfig[] = [
  {
    id: 'edition-white',
    hatColor: '#FFFFFF',
    bandColor: '#FFFFFF',
    text: 'MAKE EARTH\nGREAT AGAIN',
    backText: 'MEGA',
    font: 'Vinegar',
    textColor: '#000000',
    size: 'M',
    flagCode: undefined,
    decals: [],
  },
  {
    id: 'edition-black',
    hatColor: '#000000',
    bandColor: '#000000',
    text: 'MAKE EARTH\nGREAT AGAIN',
    backText: 'MEGA',
    font: 'Vinegar',
    textColor: '#FFFFFF',
    size: 'M',
    flagCode: undefined,
    decals: [],
  },
  {
    id: 'edition-whiteout',
    hatColor: '#FFFFFF',
    bandColor: '#FFFFFF',
    text: 'MAKE EARTH\nGREAT AGAIN',
    backText: 'WHITEOUT',
    font: 'Vinegar',
    textColor: '#FFFFFF',
    size: 'M',
    flagCode: undefined,
    decals: [],
  },
  {
    id: 'edition-blackout',
    hatColor: '#000000',
    bandColor: '#000000',
    text: 'MAKE EARTH\nGREAT AGAIN',
    backText: 'BLACKOUT',
    font: 'Vinegar',
    textColor: '#000000',
    size: 'M',
    flagCode: undefined,
    decals: [],
  },
];

const featuredCountryCodes = new Set(['IN', 'IR', 'UA', 'KH']);

export default function CollectionPage() {
  const countryEditions = COUNTRY_HATS.filter((hat) => featuredCountryCodes.has(hat.countryCode));
  const comingSoon = COUNTRY_CODES.filter((country) => !featuredCountryCodes.has(country.code)).slice(0, 16);

  return (
    <main className="min-h-screen pt-14 bg-black text-white">
      <section className="border-b border-white/10">
        <div className="container py-16">
          <p className="text-[10px] tracking-[0.3em] uppercase text-white/40 mb-4">Collection</p>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[0.9] mb-4">MEGA</h1>
          <p className="text-sm text-white/40 max-w-xl leading-relaxed">
            White hat + black text is the lead default. Black hat + white text is the core dark edition.
            Whiteout and Blackout are special editions at $80.
          </p>
        </div>
      </section>

      <section className="py-14 border-b border-white/10">
        <div className="container">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-[10px] tracking-[0.3em] uppercase text-white/40 mb-2">MEGA Editions</p>
              <h2 className="text-2xl font-bold tracking-tight">4 Core Variations</h2>
            </div>
            <Link to="/designer">
              <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white hover:text-black text-xs tracking-wider">
                Design Your Own
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/10">
            {megaEditions.map((hat) => (
              <div key={hat.id} className="bg-black">
                <div className="h-64">
                  <HatScene
                    hatColor={hat.hatColor}
                    bandColor={hat.bandColor}
                    text={hat.text}
                    backText={hat.backText}
                    textColor={hat.textColor}
                    font={hat.font}
                    flagCode={hat.flagCode}
                    autoRotate
                    className="w-full h-full"
                  />
                </div>
                <div className="p-4 border-t border-white/10">
                  <p className="text-xs tracking-widest uppercase text-white/70 mb-1">{hat.backText || 'MEGA'}</p>
                  <p className="text-[10px] text-white/40">${getHatPrice(hat).toFixed(2)}</p>
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
              <p className="text-[10px] tracking-[0.3em] uppercase text-white/40 mb-2">Country Pride</p>
              <h2 className="text-2xl font-bold tracking-tight">Ready To Go</h2>
            </div>
            <Link to="/designer">
              <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white hover:text-black text-xs tracking-wider">
                Customize Country Hat
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
                    font={hat.font}
                    flagCode={hat.flagCode}
                    autoRotate
                    className="w-full h-full"
                  />
                </div>
                <div className="p-4 border-t border-white/10 flex items-center justify-between">
                  <div>
                    <p className="text-xs tracking-widest uppercase text-white/80">{hat.countryName}</p>
                    <p className="text-[10px] text-white/40">Default: White + Black</p>
                  </div>
                  <span className="text-[10px] tracking-[0.2em] text-white/30">{hat.countryCode}</span>
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
            Choose country, flag, font, colors, and text placements directly in the designer.
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
