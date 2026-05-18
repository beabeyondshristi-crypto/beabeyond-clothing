'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Product } from '@/lib/data';

interface CartItem extends Product {
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, options?: { size?: string; color?: string }) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, delta: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  cartCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = 'beabeyond_cart';

function loadCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveCart(items: CartItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {}
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setCart(loadCart());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveCart(cart);
  }, [cart, hydrated]);

  const addToCart = useCallback((product: Product, quantity: number = 1, options?: { size?: string; color?: string }) => {
    setCart((prevCart) => {
      const key = product.id + (options?.size || '') + (options?.color || '');
      const idx = prevCart.findIndex(
        (item) => item.id + (item.selectedSize || '') + (item.selectedColor || '') === key
      );
      if (idx >= 0) {
        const updated = [...prevCart];
        updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + quantity };
        return updated;
      }
      return [...prevCart, { ...product, quantity, selectedSize: options?.size || '', selectedColor: options?.color || '' }];
    });
    setIsCartOpen(true);
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, delta: number) => {
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.id === productId) {
          const newQuantity = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
