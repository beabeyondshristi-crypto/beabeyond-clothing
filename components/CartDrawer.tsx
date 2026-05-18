'use client';

import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';

export default function CartDrawer() {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, cartTotal } = useCart();

  // Disable body scroll when cart is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={() => setIsCartOpen(false)}
      />
      
      {/* Drawer */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 ease-out">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-normal font-serif uppercase tracking-tighter">Your Cart</h2>
          <button 
            onClick={() => setIsCartOpen(false)}
            className="text-2xl font-light hover:rotate-90 transition-transform duration-300"
          >
            ✕
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-grow overflow-y-auto p-6 space-y-8">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-6 font-light">Your cart is empty</p>
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
              <div key={item.id} className="flex gap-4">
                <div className="relative w-24 h-32 bg-gray-50 flex-shrink-0">
                  <Image
                    src={item.images[0]}
                    alt={item.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="flex flex-col justify-between py-1 flex-grow">
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="text-[11px] font-bold uppercase tracking-widest">{item.name}</h3>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-[9px] uppercase tracking-widest text-gray-400 hover:text-black"
                      >
                        Remove
                      </button>
                    </div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">{item.category}</p>
                  </div>
                  
                  <div className="flex justify-between items-end">
                    <div className="flex items-center border border-gray-200">
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
                    <p className="text-xs font-medium">${item.price * item.quantity}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="p-6 border-t border-gray-100 space-y-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest">Subtotal</span>
              <span className="text-sm font-medium">${cartTotal}</span>
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
  );
}
