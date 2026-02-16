import { Heart } from 'lucide-react';

interface VoteCounterProps {
  count: number;
  voted: boolean;
  onVote: () => void;
}

export function VoteCounter({ count, voted, onVote }: VoteCounterProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onVote}
        disabled={voted}
        className={`flex items-center gap-1.5 px-2.5 py-1 text-[10px] tracking-wider uppercase border transition-colors ${
          voted
            ? 'border-white/10 text-white/40 cursor-default'
            : 'border-white/10 text-white/50 hover:border-white/30 hover:text-white'
        }`}
      >
        <Heart
          className={`h-3 w-3 ${voted ? 'fill-white/40 text-white/40' : ''}`}
        />
        {voted ? 'Voted' : 'Vote'}
      </button>
      <span className="text-[10px] text-white/30 tabular-nums">{count}</span>
    </div>
  );
}
