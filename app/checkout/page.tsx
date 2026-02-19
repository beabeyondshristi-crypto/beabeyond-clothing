'use client';

import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export default function CheckoutPage() {
  const { cart, cartTotal } = useCart();
  const [shippingMethod, setShippingMethod] = useState('standard');
  
  const shippingCost = shippingMethod === 'standard' ? 0 : 25;
  const finalTotal = cartTotal + shippingCost;

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-4xl md:text-6xl font-serif font-normal uppercase mb-6">Cart is Empty</h1>
        <p className="text-sm font-light uppercase tracking-widest mb-8 text-gray-500">
          You haven&apos;t added any items yet.
        </p>
        <Link 
          href="/shop" 
          className="inline-block border border-black px-12 py-4 text-xs font-bold uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-screen">
        
        {/* Left Column: Form */}
        <div className="lg:col-span-7 p-6 md:p-12 lg:p-24 border-r border-black/10 order-2 lg:order-1">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="mb-12 flex items-center justify-between">
               <h1 className="text-3xl md:text-4xl font-serif uppercase tracking-tight">Checkout</h1>
               <Link href="/shop" className="text-[10px] uppercase tracking-widest underline hover:text-gray-500">
                 Continue Shopping
               </Link>
            </div>

            <form className="space-y-16">
              {/* Contact Section */}
              <section>
                <h2 className="text-sm font-bold uppercase tracking-widest mb-6 pb-2 border-b border-black">Contact</h2>
                <div className="space-y-4">
                  <div className="grid gap-1">
                    <label className="text-[10px] uppercase tracking-widest text-gray-500">Email Address</label>
                    <input 
                      type="email" 
                      className="w-full bg-transparent border border-gray-300 p-4 text-sm focus:border-black focus:outline-none transition-colors placeholder:text-gray-300"
                      placeholder="YOU@EXAMPLE.COM"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="newsletter" className="accent-black w-4 h-4 rounded-none" />
                    <label htmlFor="newsletter" className="text-[10px] uppercase tracking-wider text-gray-500">
                      Subscribe to our newsletter for updates
                    </label>
                  </div>
                </div>
              </section>

              {/* Shipping Address */}
              <section>
                <h2 className="text-sm font-bold uppercase tracking-widest mb-6 pb-2 border-b border-black">Shipping Address</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-1 space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-gray-500">First Name</label>
                    <input type="text" className="w-full bg-transparent border border-gray-300 p-4 text-sm focus:border-black focus:outline-none" />
                  </div>
                  <div className="md:col-span-1 space-y-1">
                     <label className="text-[10px] uppercase tracking-widest text-gray-500">Last Name</label>
                    <input type="text" className="w-full bg-transparent border border-gray-300 p-4 text-sm focus:border-black focus:outline-none" />
                  </div>
                  
                  <div className="md:col-span-2 space-y-1">
                     <label className="text-[10px] uppercase tracking-widest text-gray-500">Address</label>
                    <input type="text" className="w-full bg-transparent border border-gray-300 p-4 text-sm focus:border-black focus:outline-none" />
                  </div>
                   <div className="md:col-span-2 space-y-1">
                     <label className="text-[10px] uppercase tracking-widest text-gray-500">Apartment, suite, etc.</label>
                    <input type="text" className="w-full bg-transparent border border-gray-300 p-4 text-sm focus:border-black focus:outline-none" />
                  </div>

                  <div className="space-y-1">
                     <label className="text-[10px] uppercase tracking-widest text-gray-500">City</label>
                    <input type="text" className="w-full bg-transparent border border-gray-300 p-4 text-sm focus:border-black focus:outline-none" />
                  </div>
                  <div className="space-y-1">
                     <label className="text-[10px] uppercase tracking-widest text-gray-500">Postcode</label>
                    <input type="text" className="w-full bg-transparent border border-gray-300 p-4 text-sm focus:border-black focus:outline-none" />
                  </div>
                  <div className="md:col-span-2 space-y-1">
                     <label className="text-[10px] uppercase tracking-widest text-gray-500">Phone</label>
                    <input type="tel" className="w-full bg-transparent border border-gray-300 p-4 text-sm focus:border-black focus:outline-none" />
                  </div>
                </div>
              </section>

               {/* Shipping Method */}
               <section>
                <h2 className="text-sm font-bold uppercase tracking-widest mb-6 pb-2 border-b border-black">Shipping Method</h2>
                <div className="space-y-4">
                  <label className={`block border ${shippingMethod === 'standard' ? 'border-black bg-gray-50' : 'border-gray-200'} p-4 cursor-pointer transition-all hover:border-black`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <input 
                          type="radio" 
                          name="shipping" 
                          checked={shippingMethod === 'standard'}
                          onChange={() => setShippingMethod('standard')}
                          className="accent-black w-4 h-4" 
                        />
                        <div className="flex flex-col">
                           <span className="text-xs uppercase font-bold tracking-widest">Standard Shipping</span>
                           <span className="text-[10px] text-gray-500 uppercase tracking-widest">5-7 Business Days</span>
                        </div>
                      </div>
                      <span className="text-sm font-serif">Free</span>
                    </div>
                  </label>
                  
                  <label className={`block border ${shippingMethod === 'express' ? 'border-black bg-gray-50' : 'border-gray-200'} p-4 cursor-pointer transition-all hover:border-black`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <input 
                          type="radio" 
                          name="shipping"
                          checked={shippingMethod === 'express'}
                          onChange={() => setShippingMethod('express')} 
                          className="accent-black w-4 h-4" 
                        />
                         <div className="flex flex-col">
                           <span className="text-xs uppercase font-bold tracking-widest">Express Shipping</span>
                           <span className="text-[10px] text-gray-500 uppercase tracking-widest">1-2 Business Days</span>
                        </div>
                      </div>
                      <span className="text-sm font-serif">$25.00</span>
                    </div>
                  </label>
                </div>
              </section>

              {/* Payment */}
              <section>
                 <h2 className="text-sm font-bold uppercase tracking-widest mb-6 pb-2 border-b border-black">Payment</h2>
                 <div className="bg-gray-50 border border-gray-200 p-8 text-center space-y-4">
                    <p className="text-xs uppercase tracking-widest text-gray-500">Secure Payment Provider</p>
                    <div className="flex justify-center gap-4 opacity-50 grayscale">
                        <div className="w-10 h-6 bg-gray-300"></div>
                        <div className="w-10 h-6 bg-gray-300"></div>
                        <div className="w-10 h-6 bg-gray-300"></div>
                    </div>
                    <p className="text-[10px] text-gray-400 font-light">Payment integration will be handled by Stripe/PayPal.</p>
                 </div>
              </section>

              <button className="w-full bg-black text-white py-5 text-sm font-bold uppercase tracking-[0.2em] hover:bg-gray-800 transition-colors">
                Pay Now — ${finalTotal.toFixed(2)}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-5 bg-gray-50 p-6 md:p-12 lg:p-24 order-1 lg:order-2">
           <div className="lg:sticky lg:top-32 space-y-8">
             <h2 className="text-xl font-serif uppercase tracking-tight mb-8">Order Summary</h2>
             
             <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-2">
               {cart.map((item) => (
                 <div key={item.id} className="flex gap-4 items-start">
                   <div className="relative w-20 aspect-[3/4] bg-gray-200 border border-black/10">
                     <Image
                        src={item.images[0]}
                        alt={item.name}
                        fill
                        className="object-cover"
                        unoptimized
                     />
                     <span className="absolute -top-2 -right-2 bg-black text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold">
                       {item.quantity}
                     </span>
                   </div>
                   <div className="flex-1">
                     <h3 className="text-xs font-bold uppercase tracking-widest mb-1">{item.name}</h3>
                     <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">{item.category}</p>
                   </div>
                   <div className="text-sm font-serif">
                     ${(item.price * item.quantity).toFixed(2)}
                   </div>
                 </div>
               ))}
             </div>

             <div className="border-t border-black/10 pt-6 space-y-4">
               <div className="flex justify-between items-center text-xs uppercase tracking-widest text-gray-600">
                 <span>Subtotal</span>
                 <span>${cartTotal.toFixed(2)}</span>
               </div>
               <div className="flex justify-between items-center text-xs uppercase tracking-widest text-gray-600">
                 <span>Shipping</span>
                 <span>{shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}</span>
               </div>
               <div className="flex justify-between items-center text-lg font-serif pt-4 border-t border-black/10">
                 <span>Total</span>
                 <span>${finalTotal.toFixed(2)}</span>
               </div>
             </div>
           </div>
        </div>

      </div>
    </div>
  );
}
