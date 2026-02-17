import { useState } from 'react';
import { useCart, getHatPrice } from '@/store/cartStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Minus, Plus, Trash2, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Cart() {
  const { items, updateQuantity, removeItem, totalPrice, clearCart, totalItems } = useCart();
  const [ordered, setOrdered] = useState(false);

  if (ordered) {
    return (
      <main className="min-h-screen pt-16 flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-md">
          <CheckCircle className="h-16 w-16 text-primary mx-auto" />
          <h1 className="text-3xl font-bold">Order Confirmed!</h1>
          <p className="text-muted-foreground">Thanks for your order. Your custom hats are being crafted!</p>
          <Link to="/"><Button>Back to Home</Button></Link>
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen pt-16 flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Your Cart is Empty</h1>
          <p className="text-muted-foreground">Design a custom hat to get started!</p>
          <Link to="/designer"><Button>Go to Designer</Button></Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-20 pb-12 px-4">
      <div className="container max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Your Cart ({totalItems})</h1>

        <div className="space-y-4 mb-8">
          {items.map(item => (
            <div key={item.hat.id} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card">
              <div
                className="w-16 h-16 rounded-lg shrink-0 border border-white/10"
                style={{ backgroundColor: item.hat.hatColor }}
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{item.hat.text || 'Custom Hat'}</p>
                <p className="text-xs text-muted-foreground">Size: {item.hat.size} · Font: {item.hat.font}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.hat.id, item.quantity - 1)}>
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="w-8 text-center font-medium">{item.quantity}</span>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.hat.id, item.quantity + 1)}>
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              <p className="font-semibold w-20 text-right">${(item.quantity * getHatPrice(item.hat)).toFixed(2)}</p>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeItem(item.hat.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div className="space-y-4 p-6 rounded-xl border border-border bg-card">
            <h2 className="text-xl font-bold">Shipping Details</h2>
            <div className="space-y-3">
              <div><Label>Full Name</Label><Input placeholder="John Doe" /></div>
              <div><Label>Email</Label><Input type="email" placeholder="john@example.com" /></div>
              <div><Label>Address</Label><Input placeholder="123 Main St" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>City</Label><Input placeholder="New York" /></div>
                <div><Label>ZIP</Label><Input placeholder="10001" /></div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-4 p-6 rounded-xl border border-border bg-card">
            <h2 className="text-xl font-bold">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>${totalPrice.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>Free</span></div>
              <div className="border-t border-border pt-2 flex justify-between text-lg font-bold">
                <span>Total</span><span className="text-primary">${totalPrice.toFixed(2)}</span>
              </div>
            </div>
            <Button
              className="w-full h-12 text-base font-semibold mt-4"
              onClick={() => { clearCart(); setOrdered(true); }}
            >
              Place Order
            </Button>
            <p className="text-xs text-muted-foreground text-center">Demo only — no payment will be processed</p>
          </div>
        </div>
      </div>
    </main>
  );
}
