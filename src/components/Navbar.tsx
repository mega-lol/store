import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/store/cartStore';
import { Button } from '@/components/ui/button';

export default function Navbar() {
  const { totalItems } = useCart();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/90 backdrop-blur-xl">
      <div className="container flex h-14 items-center justify-between">
        <Link to="/" className="text-lg font-bold tracking-widest uppercase text-white font-serif">
          MakeHatAgain
        </Link>
        <div className="flex items-center gap-2">
          <Link to="/designer">
            <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10 text-xs">
              Designer
            </Button>
          </Link>
          <Link to="/mg-collection">
            <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10 text-xs">
              Collection
            </Button>
          </Link>
          <Link to="/cart" className="relative">
            <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10">
              <ShoppingCart className="h-4 w-4" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white text-black text-[10px] flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
