import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/store/cartStore';

export default function Navbar() {
  const { totalItems } = useCart();
  const { pathname } = useLocation();
  const isHome = pathname === '/' || pathname === '';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 border-b transition-colors ${
      isHome
        ? 'bg-white/60 backdrop-blur-xl border-black/5'
        : 'bg-black/80 backdrop-blur-xl border-white/5'
    }`}>
      <div className="flex h-12 items-center justify-between px-6">
        <Link to="/" className={`text-sm tracking-[0.3em] uppercase transition-colors ${
          isHome ? 'text-black/80 hover:text-black' : 'text-white/80 hover:text-white'
        }`}>
          MEGA
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/mg-collection" className={`text-[10px] tracking-[0.2em] uppercase transition-colors ${
            isHome ? 'text-black/40 hover:text-black' : 'text-white/40 hover:text-white'
          }`}>
            Collection
          </Link>
          <Link to="/designer" className={`text-[10px] tracking-[0.2em] uppercase transition-colors ${
            isHome ? 'text-black/40 hover:text-black' : 'text-white/40 hover:text-white'
          }`}>
            Design
          </Link>
          <Link to="/cart" className={`relative p-1.5 transition-colors ${
            isHome ? 'text-black/40 hover:text-black' : 'text-white/40 hover:text-white'
          }`}>
            <ShoppingCart className="h-4 w-4" />
            {totalItems > 0 && (
              <span className={`absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[9px] flex items-center justify-center font-bold ${
                isHome ? 'bg-black text-white' : 'bg-white text-black'
              }`}>
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}
