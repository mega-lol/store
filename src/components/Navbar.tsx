import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

function DoveIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M23.5 2.5c0 0-4.8 1.3-7.2 3.7-1.6 1.6-2.3 3.2-2.6 4.3-.8-.3-1.7-.5-2.7-.5-3.3 0-6 2.2-6 5 0 .5.1 1 .2 1.5C3.2 17.3 1 19 1 19s2.5.5 5 0c1.3-.3 2.4-.8 3.2-1.3.5.1 1 .2 1.5.2 4 0 6.5-2.5 7.5-4.5.5-1 .8-2.3.8-3.4 0-.5 0-1-.1-1.5l4.6-6z" />
      <path d="M4 15c0 0 1.5-1 3-1" opacity="0.4" fill="none" stroke="currentColor" strokeWidth="0.8" />
    </svg>
  );
}

export default function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const isEmbedded =
    typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('embed') === '1';
  const [mobileOpen, setMobileOpen] = useState(false);
  const [visible, setVisible] = useState(false);

  // Show navbar after scrolling past hero
  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > window.innerHeight * 0.35);
    };
    // Always show on non-index pages
    if (pathname !== '/') {
      setVisible(true);
      return;
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathname]);

  // Escape closes overlays
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Close mobile menu on navigate
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const scrollToMovement = useCallback(() => {
    if (typeof window === 'undefined') return;

    const tryScroll = (triesLeft: number) => {
      const el = document.getElementById('movement');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      if (triesLeft <= 0) return;
      window.requestAnimationFrame(() => tryScroll(triesLeft - 1));
    };

    if (pathname !== '/') {
      navigate('/');
      window.setTimeout(() => tryScroll(80), 50);
      return;
    }

    tryScroll(80);
  }, [navigate, pathname]);

  const handleShare = useCallback(async () => {
    if (typeof window === 'undefined') return;

    const url = window.location.href;
    const title = document.title || 'MEGA';

    try {
      if (typeof navigator !== 'undefined' && 'share' in navigator) {
        // @ts-expect-error - navigator.share is not in TS lib for all targets
        await navigator.share({ title, url });
        return;
      }

      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        toast({ title: 'Link copied', description: 'Paste it anywhere.' });
        return;
      }

      window.prompt('Copy this link:', url);
    } catch {
      // User cancellation or share failure: do nothing.
    }
  }, [toast]);

  if (isEmbedded) return null;

  return (
    <>
      <nav
        className="fixed top-3 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-out"
        style={{
          opacity: visible ? 1 : 0,
          transform: `translateX(-50%) translateY(${visible ? '0' : '-20px'})`,
          pointerEvents: visible ? 'auto' : 'none',
        }}
      >
        <div className="flex h-11 items-center gap-5 px-5 rounded-full bg-black/80 backdrop-blur-2xl border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          <Link
            to="/"
            className="text-white/90 hover:text-white transition-colors flex-shrink-0"
            aria-label="Home"
          >
            <DoveIcon className="h-5 w-5" />
          </Link>

          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={scrollToMovement}
              className="text-[10px] font-bold tracking-[0.25em] uppercase text-white/50 hover:text-white transition-colors"
            >
              About
            </button>
            <Link
              to="/collection"
              className={`text-[10px] font-bold tracking-[0.25em] uppercase transition-colors ${
                pathname === '/collection' ? 'text-white' : 'text-white/50 hover:text-white'
              }`}
            >
              Browse
            </Link>
            <Link
              to="/designer"
              className={`text-[10px] font-bold tracking-[0.25em] uppercase transition-colors ${
                pathname === '/designer' ? 'text-white' : 'text-white/50 hover:text-white'
              }`}
            >
              Design
            </Link>
            <button
              onClick={handleShare}
              className="text-[10px] font-bold tracking-[0.25em] uppercase text-white/50 hover:text-white transition-colors"
            >
              Share
            </button>
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-1 rounded-full text-white/70 hover:text-white transition-colors"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="absolute top-16 left-4 right-4 rounded-2xl border border-white/10 bg-black/90 backdrop-blur-2xl p-4 space-y-1"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setMobileOpen(false);
                scrollToMovement();
              }}
              className="block w-full text-left px-4 py-3 rounded-xl text-sm tracking-[0.15em] uppercase transition-colors text-white/75 hover:text-white hover:bg-white/5 font-black"
            >
              About
            </button>
            <Link
              to="/collection"
              onClick={() => setMobileOpen(false)}
              className={`block px-4 py-3 rounded-xl text-sm tracking-[0.15em] uppercase transition-colors font-black ${
                pathname === '/collection' ? 'bg-white/10 text-white' : 'text-white/75 hover:text-white hover:bg-white/5'
              }`}
            >
              Browse
            </Link>
            <Link
              to="/designer"
              onClick={() => setMobileOpen(false)}
              className={`block px-4 py-3 rounded-xl text-sm tracking-[0.15em] uppercase transition-colors font-black ${
                pathname === '/designer' ? 'bg-white/10 text-white' : 'text-white/75 hover:text-white hover:bg-white/5'
              }`}
            >
              Design
            </Link>
            <button
              onClick={() => {
                setMobileOpen(false);
                handleShare();
              }}
              className="block w-full text-left px-4 py-3 rounded-xl text-sm tracking-[0.15em] uppercase transition-colors text-white/75 hover:text-white hover:bg-white/5 font-black"
            >
              Share
            </button>
          </div>
        </div>
      )}
    </>
  );
}
