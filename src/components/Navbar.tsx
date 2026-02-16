import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/store/cartStore';

export default function Navbar() {
  const { totalItems } = useCart();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/5">
      <div className="flex h-12 items-center justify-between px-6">
        <Link to="/" className="text-sm tracking-[0.3em] uppercase text-white/80 hover:text-white transition-colors">
          MEGA
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/mg-collection" className="text-[10px] tracking-[0.2em] uppercase text-white/40 hover:text-white transition-colors">
            Collection
          </Link>
          <Link to="/designer" className="text-[10px] tracking-[0.2em] uppercase text-white/40 hover:text-white transition-colors">
            Design
          </Link>
          <Link to="/cart" className="relative p-1.5 text-white/40 hover:text-white transition-colors">
            <ShoppingCart className="h-4 w-4" />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-white text-black text-[9px] flex items-center justify-center font-bold">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}
