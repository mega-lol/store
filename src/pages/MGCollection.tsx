import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { VoteCounter } from '@/components/VoteCounter';
import HatScene from '@/components/HatScene';
import { COUNTRY_MG_HATS, COUNTRY_CODES } from '@/types/hat';
import { Search } from 'lucide-react';

export default function MGCollectionPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  const [votes, setVotes] = useState<Record<string, number>>({
    'mg-iran': 312,
    'mg-cambodia': 245,
    'mg-ukraine': 189,
  });

  const [votedItems, setVotedItems] = useState<Set<string>>(new Set());

  const handleVote = (countryId: string) => {
    if (!votedItems.has(countryId)) {
      setVotes(prev => ({
        ...prev,
        [countryId]: (prev[countryId] || 0) + 1
      }));
      setVotedItems(prev => new Set(prev).add(countryId));
    }
  };

  const filteredCountries = COUNTRY_CODES.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="min-h-screen pt-14 bg-black text-white">
      {/* Hero */}
      <section className="border-b border-white/10">
        <div className="container py-20">
          <div className="max-w-2xl">
            <p className="text-[10px] tracking-[0.3em] uppercase text-white/40 mb-6">
              Collection
            </p>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[0.9] mb-6" style={{ fontFamily: 'Times New Roman, Georgia, serif' }}>
              MAKE<br />
              GREAT
            </h1>
            <p className="text-sm text-white/40 max-w-sm leading-relaxed">
              Every country deserves to be great. Custom embroidered caps celebrating national pride across the globe.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-white/10">
        <div className="container">
          <div className="grid grid-cols-3 divide-x divide-white/10">
            <div className="py-8 pr-6">
              <div className="text-3xl font-bold tracking-tight">47</div>
              <div className="text-[10px] tracking-[0.2em] uppercase text-white/30 mt-1">Countries</div>
            </div>
            <div className="py-8 px-6">
              <div className="text-3xl font-bold tracking-tight">25.7K</div>
              <div className="text-[10px] tracking-[0.2em] uppercase text-white/30 mt-1">Units Sold</div>
            </div>
            <div className="py-8 pl-6">
              <div className="text-3xl font-bold tracking-tight">3</div>
              <div className="text-[10px] tracking-[0.2em] uppercase text-white/30 mt-1">Collections</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Hats */}
      <section className="py-16">
        <div className="container">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-[10px] tracking-[0.3em] uppercase text-white/40 mb-2">Featured</p>
              <h2 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'Times New Roman, Georgia, serif' }}>
                Current Editions
              </h2>
            </div>
            <Link to="/designer">
              <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white hover:text-black text-xs tracking-wider">
                Design Your Own
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/10">
            {COUNTRY_MG_HATS.map((hat) => (
              <div key={hat.id} className="bg-black">
                <div className="h-72">
                  <HatScene
                    hatColor={hat.hatColor}
                    text={hat.text}
                    backText={hat.backText}
                    textColor={hat.textColor}
                    autoRotate
                    className="w-full h-full"
                  />
                </div>
                <div className="p-5 border-t border-white/10">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-semibold tracking-wide uppercase">{hat.countryName}</h3>
                      {hat.backText && (
                        <p className="text-[10px] text-white/30 mt-1">{hat.backText}</p>
                      )}
                    </div>
                    <span className="text-[10px] text-white/20 tracking-widest">{hat.countryCode}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <VoteCounter
                      count={votes[hat.id] || 0}
                      voted={votedItems.has(hat.id)}
                      onVote={() => handleVote(hat.id)}
                    />
                    <Link to="/designer">
                      <button className="text-[10px] tracking-[0.2em] uppercase text-white/50 hover:text-white transition-colors underline underline-offset-4 decoration-white/20 hover:decoration-white/60">
                        Customize
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Country Directory */}
      <section className="py-16 border-t border-white/10">
        <div className="container">
          <div className="max-w-lg mb-10">
            <p className="text-[10px] tracking-[0.3em] uppercase text-white/40 mb-2">Directory</p>
            <h2 className="text-2xl font-bold tracking-tight mb-4" style={{ fontFamily: 'Times New Roman, Georgia, serif' }}>
              Request Your Country
            </h2>
            <p className="text-xs text-white/30 leading-relaxed mb-6">
              Don't see your country? Search below and request a custom edition.
            </p>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/20" />
              <input
                type="text"
                placeholder="Search countries..."
                className="w-full pl-9 pr-4 py-2.5 bg-transparent border border-white/10 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-px bg-white/5">
            {filteredCountries.slice(0, 24).map(country => (
              <button
                key={country.code}
                className={`bg-black p-4 text-center hover:bg-white/5 transition-colors ${
                  selectedCountry === country.code ? 'bg-white/10' : ''
                }`}
                onClick={() => setSelectedCountry(selectedCountry === country.code ? null : country.code)}
              >
                <div className="text-xl mb-1.5">
                  {String.fromCodePoint(0x1F1E6 + country.code.charCodeAt(0) - 65)}{String.fromCodePoint(0x1F1E6 + country.code.charCodeAt(1) - 65)}
                </div>
                <div className="text-[10px] font-medium tracking-wider text-white/60">{country.name}</div>
                <div className="text-[9px] text-white/20 mt-0.5">{country.code}</div>
              </button>
            ))}
          </div>

          {filteredCountries.length > 24 && (
            <div className="text-center mt-6">
              <p className="text-[10px] text-white/20 tracking-wider">
                {filteredCountries.length - 24} more countries available
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/10">
        <div className="container py-20">
          <div className="max-w-lg">
            <h2 className="text-3xl font-bold tracking-tight mb-4" style={{ fontFamily: 'Times New Roman, Georgia, serif' }}>
              Design Your Own
            </h2>
            <p className="text-sm text-white/40 mb-8 leading-relaxed">
              Any country. Any language. Black cap, white embroidery. Share your design with the world.
            </p>
            <Link to="/designer">
              <Button className="bg-white text-black hover:bg-white/90 text-xs tracking-[0.2em] uppercase px-8 h-10">
                Open Designer
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
