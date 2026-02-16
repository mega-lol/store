import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/store/cartStore';

export default function Navbar() {
  const { totalItems } = useCart();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/90 backdrop-blur-xl">
      <div className="flex h-14 items-center justify-between px-4">
        <Link to="/" className="text-2xl" aria-label="Home">
          🧢
        </Link>
        <div className="flex items-center gap-1">
          <Link to="/mg-collection" className="px-3 py-1.5 text-[10px] text-zinc-500 hover:text-white uppercase tracking-widest transition-colors">
            Collection
          </Link>
          <Link to="/cart" className="relative p-2 text-zinc-500 hover:text-white transition-colors">
            <ShoppingCart className="h-4 w-4" />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-white text-black text-[10px] flex items-center justify-center font-bold">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}
