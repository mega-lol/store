import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, ShoppingCart, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/store/cartStore';

export default function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { totalItems } = useCart();

  const isEmbedded =
    typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('embed') === '1';
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
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-white/10">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex h-14 items-center justify-between">
            <Link
              to="/"
              className="text-lg md:text-xl font-black tracking-[0.35em] uppercase text-white hover:text-white/90 transition-colors"
            >
              MEGA
            </Link>

            <div className="hidden md:flex items-center gap-7">
              <button
                onClick={scrollToMovement}
                className="text-[11px] font-black tracking-[0.28em] uppercase text-white/70 hover:text-white transition-colors"
              >
                About
              </button>
              <Link
                to="/collection"
                className={`text-[11px] font-black tracking-[0.28em] uppercase transition-colors ${
                  pathname === '/collection' ? 'text-white' : 'text-white/70 hover:text-white'
                }`}
              >
                Browse
              </Link>
              <Link
                to="/designer"
                className={`text-[11px] font-black tracking-[0.28em] uppercase transition-colors ${
                  pathname === '/designer' ? 'text-white' : 'text-white/70 hover:text-white'
                }`}
              >
                Design
              </Link>
              <button
                onClick={handleShare}
                className="text-[11px] font-black tracking-[0.28em] uppercase text-white/70 hover:text-white transition-colors"
              >
                Share
              </button>
            </div>

            <div className="flex items-center gap-1">
              <Link
                to="/cart"
                className="relative p-2 rounded-full text-white/80 hover:text-white hover:bg-white/5 transition-colors"
                aria-label={`Cart (${totalItems})`}
              >
                <ShoppingCart className="h-4 w-4" />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-white text-black text-[10px] font-black flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>

              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 rounded-full text-white/80 hover:text-white hover:bg-white/5 transition-colors"
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
            className="absolute top-16 left-4 right-4 rounded-2xl border border-white/10 bg-black p-4 space-y-1"
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
