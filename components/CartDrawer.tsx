'use client';

import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';
import Portal from './Portal';

export default function CartDrawer() {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, cartTotal } = useCart();

  // Disable body scroll when cart is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isCartOpen]);

  useEffect(() => {
    if (!isCartOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsCartOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isCartOpen, setIsCartOpen]);

  if (!isCartOpen) return null;

  const freeShippingAt = 200;
  const remaining = Math.max(0, freeShippingAt - cartTotal);
  const progress = Math.min(100, (cartTotal / freeShippingAt) * 100);

  return (
    <Portal>
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-fade-in"
        onClick={() => setIsCartOpen(false)}
      />
      
      {/* Drawer */}
      <div role="dialog" aria-label="Shopping cart" className="relative w-full max-w-md bg-white h-full border-l border-black flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-6 h-16 border-b border-black">
          <h2 className="text-xl font-normal font-serif uppercase tracking-tighter">
            Your Cart <span className="text-[10px] font-sans font-bold tracking-[0.2em] text-gray-400 align-middle ml-2">({cart.reduce((n, i) => n + i.quantity, 0)})</span>
          </h2>
          <button
            onClick={() => setIsCartOpen(false)}
            className="text-[10px] font-bold uppercase tracking-[0.2em] hover:opacity-50 transition-opacity"
          >
            Close ✕
          </button>
        </div>

        {cart.length > 0 && (
          <div className="px-6 py-4 border-b border-black/10">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] mb-3">
              {remaining > 0 ? <>You&apos;re ₹{remaining} away from free shipping</> : 'You\'ve unlocked free shipping'}
            </p>
            <div className="h-px bg-black/10">
              <div className="h-px bg-black transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {/* Cart Items */}
        <div className="flex-grow overflow-y-auto p-6 space-y-6">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <span className="font-serif text-6xl text-black/10 mb-6">0</span>
              <p className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-8 font-light">Your cart is empty</p>
              <Link 
                href="/shop" 
                onClick={() => setIsCartOpen(false)}
                className="border-b border-black pb-1 text-[10px] font-bold uppercase tracking-widest hover:opacity-50"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id + (item.selectedSize || '') + (item.selectedColor || '')} className="flex gap-4 pb-6 border-b border-black/10 last:border-0">
                <Link href={`/product/${item.id}`} onClick={() => setIsCartOpen(false)} className="relative w-24 h-32 bg-gray-50 flex-shrink-0 overflow-hidden">
                  {item.images?.[0] && (
                    <Image
                      src={item.images[0]}
                      alt={item.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  )}
                </Link>
                <div className="flex flex-col justify-between py-1 flex-grow">
                  <div>
                    <div className="flex justify-between items-start">
                      <p className="text-[11px] font-bold uppercase tracking-widest">{item.name}</p>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-[9px] uppercase tracking-widest text-gray-400 hover:text-black"
                      >
                        Remove
                      </button>
                    </div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">
                      {[item.selectedSize, item.selectedColor].filter(Boolean).join(' / ') || item.category}
                    </p>
                  </div>
                  
                  <div className="flex justify-between items-end">
                    <div className="flex items-center border border-black/20">
                      <button 
                        onClick={() => updateQuantity(item.id, -1)}
                        className="px-3 py-1 hover:bg-gray-50 transition-colors"
                      >
                        -
                      </button>
                      <span className="px-2 text-[11px] min-w-[20px] text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, 1)}
                        className="px-3 py-1 hover:bg-gray-50 transition-colors"
                      >
                        +
                      </button>
                    </div>
                    <p className="text-xs font-medium">₹{item.price * item.quantity}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="p-6 border-t border-black space-y-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest">Subtotal</span>
              <span className="text-sm font-medium">₹{cartTotal}</span>
            </div>
            <p className="text-[9px] text-gray-400 uppercase tracking-widest leading-relaxed">
              Shipping and taxes calculated at checkout.
            </p>
            <Link
              href="/checkout"
              onClick={() => setIsCartOpen(false)}
              className="block w-full bg-black text-white py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-gray-800 transition-colors text-center"
            >
              Checkout
            </Link>
          </div>
        )}
      </div>
    </div>
    </Portal>
  );
}
