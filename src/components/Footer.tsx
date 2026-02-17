export default function Footer() {
  const isEmbedded = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('embed') === '1';
  if (isEmbedded) return null;

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/5 bg-black/80 backdrop-blur px-4 py-1.5">
      <div className="mx-auto flex max-w-6xl items-center justify-between text-[10px] text-white/55">
        <a href="https://ad.xyz" target="_blank" rel="noopener noreferrer" className="uppercase tracking-[0.2em] hover:text-white/80 transition-colors">
          ADXYZ Inc
        </a>
        <span className="uppercase tracking-[0.15em]">
          Payments via{' '}
          <a href="https://hanzo.ai" target="_blank" rel="noopener noreferrer" className="hover:text-white/80 transition-colors">
            Hanzo
          </a>
          {' '}Commerce
        </span>
      </div>
    </footer>
  );
}
