import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CartItem, HatConfig } from '@/types/hat';

interface CartContextType {
  items: CartItem[];
  addItem: (hat: HatConfig) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | null>(null);

const STANDARD_HAT_PRICE = 50.0;
const SPECIAL_EDITION_PRICE = 80.0;

function normalizeColor(color?: string): string {
  return (color || '').trim().toLowerCase();
}

function isWhite(color?: string): boolean {
  const c = normalizeColor(color);
  return c === '#fff' || c === '#ffffff' || c === 'white' || c === 'rgb(255,255,255)';
}

function isBlack(color?: string): boolean {
  const c = normalizeColor(color);
  return c === '#000' || c === '#000000' || c === 'black' || c === 'rgb(0,0,0)';
}

function getHatPrice(hat: HatConfig): number {
  const whiteOnWhite = isWhite(hat.hatColor) && isWhite(hat.textColor);
  const blackOnBlack = isBlack(hat.hatColor) && isBlack(hat.textColor);
  return whiteOnWhite || blackOnBlack ? SPECIAL_EDITION_PRICE : STANDARD_HAT_PRICE;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (hat: HatConfig) => {
    const id = crypto.randomUUID();
    setItems(prev => [...prev, { hat: { ...hat, id }, quantity: 1 }]);
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(i => i.hat.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return removeItem(id);
    setItems(prev => prev.map(i => i.hat.id === id ? { ...i, quantity } : i));
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.quantity * getHatPrice(i.hat), 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be inside CartProvider');
  return ctx;
}

export { STANDARD_HAT_PRICE, SPECIAL_EDITION_PRICE, getHatPrice };
