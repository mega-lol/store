import { useState } from 'react';
import { Link } from 'react-router-dom';
import { VoteCounter } from '@/components/VoteCounter';
import HatScene from './HatScene';
import { COUNTRY_HATS } from '@/types/hat';

export default function CollectionSection() {
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

  return (
    <section className="py-20 bg-black border-t border-white/10">
      <div className="container">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-white/40 mb-2">Collection</p>
            <h2 className="text-2xl font-bold tracking-tight text-white" style={{ fontFamily: 'Times New Roman, Georgia, serif' }}>
              COLLECTION
            </h2>
          </div>
          <Link to="/collection" className="text-[10px] tracking-[0.2em] uppercase text-white/40 hover:text-white transition-colors underline underline-offset-4 decoration-white/10 hover:decoration-white/40">
            View All
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/10">
          {COUNTRY_HATS.map((hat) => (
            <div key={hat.id} className="bg-black">
              <div className="h-72">
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
              <div className="p-5 border-t border-white/10">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-semibold tracking-wide uppercase text-white">{hat.countryName}</h3>
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
  );
}
