import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const isEmbedded = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('embed') === '1';
  const [mobileOpen, setMobileOpen] = useState(false);

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
      // Wait a beat for the route to render, then attempt a few frames.
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
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/90 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex h-12 items-center justify-between">
            <Link
              to="/"
              className="text-base font-black tracking-[0.35em] uppercase text-white/95 hover:text-white transition-colors"
            >
              MEGA
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <button
                onClick={scrollToMovement}
                className="text-[10px] font-bold tracking-[0.28em] uppercase text-white/60 hover:text-white transition-colors"
              >
                About
              </button>
              <Link
                to="/collection"
                className={`text-[10px] font-bold tracking-[0.28em] uppercase transition-colors ${
                  pathname === '/collection' ? 'text-white' : 'text-white/60 hover:text-white'
                }`}
              >
                Browse
              </Link>
              <Link
                to="/designer"
                className={`text-[10px] font-bold tracking-[0.28em] uppercase transition-colors ${
                  pathname === '/designer' ? 'text-white' : 'text-white/60 hover:text-white'
                }`}
              >
                Design
              </Link>
              <button
                onClick={handleShare}
                className="text-[10px] font-bold tracking-[0.28em] uppercase text-white/60 hover:text-white transition-colors"
              >
                Share
              </button>

            </div>

            <div className="flex md:hidden items-center gap-1">
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="p-2 rounded-full text-white/80 hover:text-white transition-colors"
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              >
                {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {mobileOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="absolute top-14 left-4 right-4 rounded-2xl border border-white/10 bg-black/90 p-4 space-y-1"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setMobileOpen(false);
                scrollToMovement();
              }}
              className="block w-full text-left px-4 py-3 rounded-xl text-sm tracking-[0.15em] uppercase transition-colors text-white/70 hover:text-white hover:bg-white/5 font-bold"
            >
              About
            </button>
            <Link
              to="/collection"
              onClick={() => setMobileOpen(false)}
              className={`block px-4 py-3 rounded-xl text-sm tracking-[0.15em] uppercase transition-colors font-bold ${
                pathname === '/collection' ? 'bg-white/10 text-white' : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              Browse
            </Link>
            <Link
              to="/designer"
              onClick={() => setMobileOpen(false)}
              className={`block px-4 py-3 rounded-xl text-sm tracking-[0.15em] uppercase transition-colors font-bold ${
                pathname === '/designer' ? 'bg-white/10 text-white' : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              Design
            </Link>
            <button
              onClick={() => {
                setMobileOpen(false);
                handleShare();
              }}
              className="block w-full text-left px-4 py-3 rounded-xl text-sm tracking-[0.15em] uppercase transition-colors text-white/70 hover:text-white hover:bg-white/5 font-bold"
            >
              Share
            </button>
          </div>
        </div>
      )}
    </>
  );
}
