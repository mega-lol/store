import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, X, Search } from 'lucide-react';
import { useCart } from '@/store/cartStore';

const GLOBE_MENU_ITEMS = [
  { label: 'About', href: '#movement' },
  { label: 'Brand', href: 'mailto:brand@megamovement.org' },
  { label: 'Press', href: 'mailto:press@megamovement.org' },
  { label: 'Support', href: 'mailto:support@megamovement.org' },
];

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/collection', label: 'Shop' },
  { to: '/designer', label: 'Designer' },
  { to: '/cart', label: 'Cart' },
];

const SEARCH_ITEMS = [
  { label: 'Home', to: '/', keywords: 'home landing movement mega' },
  { label: 'Shop', to: '/collection', keywords: 'shop catalog collection hats browse' },
  { label: 'Designer', to: '/designer', keywords: 'designer custom design create hat' },
  { label: 'Cart', to: '/cart', keywords: 'cart checkout buy order' },
  { label: 'Pre-order Hat', to: '/designer', keywords: 'preorder pre-order buy hat purchase' },
  { label: 'MEGA Gold Hat', to: '/collection', keywords: 'mega gold white hat classic' },
  { label: 'World Editions', to: '/collection', keywords: 'country flag world culture edition heritage' },
];

export default function Navbar() {
  const { totalItems } = useCart();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isHome = pathname === '/' || pathname === '';
  const isEmbedded = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('embed') === '1';

  const [visible, setVisible] = useState(!isHome);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchIndex, setSearchIndex] = useState(0);
  const [globeMenuOpen, setGlobeMenuOpen] = useState(false);
  const [globeMenuPos, setGlobeMenuPos] = useState({ x: 0, y: 0 });
  const globeMenuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close globe menu on outside click
  useEffect(() => {
    if (!globeMenuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (globeMenuRef.current && !globeMenuRef.current.contains(e.target as Node)) {
        setGlobeMenuOpen(false);
      }
    };
    window.addEventListener('click', onClick);
    return () => window.removeEventListener('click', onClick);
  }, [globeMenuOpen]);

  // Show navbar on scroll (home only hides it at top)
  useEffect(() => {
    if (!isHome) {
      setVisible(true);
      return;
    }

    const onScroll = () => {
      setVisible(window.scrollY > 80);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isHome]);

  // Cmd+K shortcut
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setMobileOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen) {
      setSearchQuery('');
      setSearchIndex(0);
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [searchOpen]);

  // Close mobile menu on navigate
  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  const filteredSearch = searchQuery.trim()
    ? SEARCH_ITEMS.filter(
        (item) =>
          item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.keywords.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : SEARCH_ITEMS;

  const handleSearchNav = useCallback(
    (to: string) => {
      navigate(to);
      setSearchOpen(false);
      setSearchQuery('');
    },
    [navigate],
  );

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSearchIndex((i) => Math.min(i + 1, filteredSearch.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSearchIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && filteredSearch[searchIndex]) {
      handleSearchNav(filteredSearch[searchIndex].to);
    }
  };

  if (isEmbedded) return null;

  const dark = !isHome;

  return (
    <>
      {/* ─── PILL NAVBAR ─── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          visible
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        <div className="mx-4 md:mx-8 mt-3">
          <div
            className={`flex h-12 items-center justify-between px-5 rounded-full border backdrop-blur-xl transition-colors ${
              dark
                ? 'bg-black/70 border-white/10'
                : 'bg-white/70 border-black/8'
            }`}
          >
            {/* Logo */}
            <Link
              to="/"
              onContextMenu={(e) => {
                e.preventDefault();
                setGlobeMenuPos({ x: e.clientX, y: e.clientY });
                setGlobeMenuOpen(true);
              }}
              className="text-2xl leading-none select-none transition-transform hover:scale-110"
              title="Make Earth Great Again"
            >
              🌎
            </Link>

            {/* Desktop links */}
            <div className="hidden md:flex items-center gap-1">
              <Link
                to="/collection"
                className={`px-4 py-1.5 rounded-full text-[10px] tracking-[0.18em] uppercase transition-colors ${
                  pathname === '/collection'
                    ? dark
                      ? 'bg-white/10 text-white'
                      : 'bg-black/8 text-black'
                    : dark
                      ? 'text-white/50 hover:text-white hover:bg-white/5'
                      : 'text-black/40 hover:text-black hover:bg-black/5'
                }`}
              >
                Shop
              </Link>
              <Link
                to="/designer"
                className={`px-4 py-1.5 rounded-full text-[10px] tracking-[0.18em] uppercase transition-colors ${
                  pathname === '/designer'
                    ? dark
                      ? 'bg-white/10 text-white'
                      : 'bg-black/8 text-black'
                    : dark
                      ? 'text-white/50 hover:text-white hover:bg-white/5'
                      : 'text-black/40 hover:text-black hover:bg-black/5'
                }`}
              >
                Designer
              </Link>

              {/* Search trigger */}
              <button
                onClick={() => setSearchOpen(true)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] tracking-[0.12em] transition-colors ${
                  dark
                    ? 'text-white/30 hover:text-white/60 hover:bg-white/5'
                    : 'text-black/25 hover:text-black/50 hover:bg-black/5'
                }`}
              >
                <Search className="h-3 w-3" />
                <span className="hidden lg:inline">Search</span>
                <kbd
                  className={`hidden lg:inline text-[9px] px-1.5 py-0.5 rounded border ${
                    dark ? 'border-white/10 text-white/20' : 'border-black/10 text-black/20'
                  }`}
                >
                  ⌘K
                </kbd>
              </button>

              {/* Cart */}
              <Link
                to="/cart"
                className={`relative p-2 rounded-full transition-colors ${
                  dark
                    ? 'text-white/50 hover:text-white hover:bg-white/5'
                    : 'text-black/40 hover:text-black hover:bg-black/5'
                }`}
              >
                <ShoppingCart className="h-4 w-4" />
                {totalItems > 0 && (
                  <span
                    className={`absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[9px] flex items-center justify-center font-bold ${
                      dark ? 'bg-white text-black' : 'bg-black text-white'
                    }`}
                  >
                    {totalItems}
                  </span>
                )}
              </Link>
            </div>

            {/* Mobile: search + cart + hamburger */}
            <div className="flex md:hidden items-center gap-1">
              <button
                onClick={() => setSearchOpen(true)}
                className={`p-2 rounded-full transition-colors ${
                  dark ? 'text-white/40 hover:text-white' : 'text-black/40 hover:text-black'
                }`}
              >
                <Search className="h-4 w-4" />
              </button>
              <Link
                to="/cart"
                className={`relative p-2 rounded-full transition-colors ${
                  dark ? 'text-white/40 hover:text-white' : 'text-black/40 hover:text-black'
                }`}
              >
                <ShoppingCart className="h-4 w-4" />
                {totalItems > 0 && (
                  <span
                    className={`absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[9px] flex items-center justify-center font-bold ${
                      dark ? 'bg-white text-black' : 'bg-black text-white'
                    }`}
                  >
                    {totalItems}
                  </span>
                )}
              </Link>
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className={`p-2 rounded-full transition-colors ${
                  dark ? 'text-white/50 hover:text-white' : 'text-black/40 hover:text-black'
                }`}
              >
                {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ─── MOBILE MENU ─── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className={`absolute top-20 left-4 right-4 rounded-2xl border p-6 space-y-1 ${
              dark
                ? 'bg-black/90 border-white/10'
                : 'bg-white/95 border-black/10'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-3 rounded-xl text-sm tracking-[0.15em] uppercase transition-colors ${
                  pathname === link.to
                    ? dark
                      ? 'bg-white/10 text-white font-bold'
                      : 'bg-black/8 text-black font-bold'
                    : dark
                      ? 'text-white/60 hover:text-white hover:bg-white/5'
                      : 'text-black/50 hover:text-black hover:bg-black/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ─── GLOBE CONTEXT MENU ─── */}
      {globeMenuOpen && (
        <div
          ref={globeMenuRef}
          className="fixed z-[70] min-w-[140px] rounded-xl border bg-white/95 backdrop-blur-xl shadow-2xl py-1.5 overflow-hidden"
          style={{ left: globeMenuPos.x, top: globeMenuPos.y }}
        >
          {GLOBE_MENU_ITEMS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={() => setGlobeMenuOpen(false)}
              className="block px-4 py-2 text-xs tracking-[0.1em] text-black/70 hover:bg-black/5 hover:text-black transition-colors"
            >
              {item.label}
            </a>
          ))}
        </div>
      )}

      {/* ─── SEARCH MODAL (Cmd+K) ─── */}
      {searchOpen && (
        <div className="fixed inset-0 z-[60]" onClick={() => setSearchOpen(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="flex items-start justify-center pt-[15vh]">
            <div
              className="relative w-full max-w-lg mx-4 rounded-2xl border bg-white shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 px-5 border-b border-black/5">
                <Search className="h-4 w-4 text-black/30 shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSearchIndex(0);
                  }}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="Search pages, actions..."
                  className="flex-1 h-12 text-sm bg-transparent text-black placeholder:text-black/30 outline-none"
                />
                <kbd className="text-[9px] text-black/20 border border-black/10 px-1.5 py-0.5 rounded">
                  ESC
                </kbd>
              </div>
              <div className="max-h-64 overflow-y-auto py-2">
                {filteredSearch.length === 0 && (
                  <p className="px-5 py-4 text-sm text-black/30 text-center">No results</p>
                )}
                {filteredSearch.map((item, i) => (
                  <button
                    key={`${item.label}-${item.to}`}
                    onClick={() => handleSearchNav(item.to)}
                    className={`w-full text-left px-5 py-2.5 text-sm transition-colors ${
                      i === searchIndex
                        ? 'bg-black/5 text-black'
                        : 'text-black/60 hover:bg-black/5 hover:text-black'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
