'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useCart } from '@/context/CartContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Portal from '@/components/Portal';
import type { Address } from '@/lib/types';

function MockRazorpayModal({
  amount,
  onSuccess,
  onClose,
}: {
  amount: number;
  onSuccess: () => void;
  onClose: () => void;
}) {
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);

  const handlePay = async () => {
    setProcessing(true);
    // Simulate Razorpay payment processing (2 sec delay)
    await new Promise(r => setTimeout(r, 2000));
    setProcessing(false);
    setDone(true);
    setTimeout(onSuccess, 800);
  };

  return (
    <Portal>
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-6 animate-fade-in">
      <div className="bg-white w-full max-w-sm p-10 border border-black text-center animate-fade-up">
        {!done ? (
          <>
            <span className="block text-[9px] font-bold uppercase tracking-[0.4em] text-gray-400 mb-4">Secure Payment</span>
            <h2 className="text-2xl font-serif uppercase tracking-tighter mb-2">Complete Payment</h2>
            <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-2">Razorpay Mock</p>
            <p className="text-3xl font-serif my-6">₹{amount.toFixed(2)}</p>
            <div className="space-y-3">
              <div className="border border-black/10 p-3 text-[10px] text-left text-gray-500 uppercase tracking-wider">
                <span className="font-bold text-black">Card:</span> 4242 4242 4242 4242
              </div>
              <div className="border border-black/10 p-3 text-[10px] text-left text-gray-500 uppercase tracking-wider">
                <span className="font-bold text-black">Expiry:</span> 12/28 <span className="ml-6 font-bold text-black">CVV:</span> 123
              </div>
            </div>
            <button
              onClick={handlePay}
              disabled={processing}
              className="w-full bg-black text-white border border-black py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-colors mt-6 disabled:bg-gray-400 disabled:border-gray-400 disabled:text-white"
            >
              {processing ? 'Processing...' : `Pay ₹${amount.toFixed(2)}`}
            </button>
            <button
              onClick={onClose}
              disabled={processing}
              className="w-full border border-black/20 py-3 text-[10px] uppercase tracking-widest text-gray-500 hover:text-black mt-2 disabled:opacity-30"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <div className="w-14 h-14 mx-auto mb-6 bg-black text-white flex items-center justify-center text-xl">✓</div>
            <h2 className="text-2xl font-serif uppercase tracking-tighter mb-2">Payment Successful</h2>
            <p className="text-[10px] uppercase tracking-widest text-gray-400">Redirecting to your order...</p>
          </>
        )}
      </div>
    </div>
    </Portal>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartTotal, clearCart, setIsCartOpen } = useCart();
  const [customer, setCustomer] = useState<any>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [orderResult, setOrderResult] = useState<any>(null);

  // Coupon
  const [couponInput, setCouponInput] = useState('');
  const [coupon, setCoupon] = useState<{ code: string; discount: number; message: string } | null>(null);
  const [couponMessage, setCouponMessage] = useState('');
  const [checkingCoupon, setCheckingCoupon] = useState(false);

  const checkCoupon = async (code: string, amount: number) => {
    setCheckingCoupon(true);
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code, subtotal: amount }),
      });
      const data = await res.json();
      if (data.valid) {
        setCoupon({ code: data.code || code.toUpperCase(), discount: Number(data.discount), message: data.message });
        setCouponMessage('');
      } else {
        setCoupon(null);
        setCouponMessage(data.message || 'This code isn’t valid');
      }
    } catch {
      setCouponMessage('Couldn’t check this code right now');
    } finally {
      setCheckingCoupon(false);
    }
  };

  // Re-check an applied code if the cart total changes
  useEffect(() => {
    if (coupon) checkCoupon(coupon.code, cartTotal);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartTotal]);

  // New address form
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({
    label: '', line1: '', line2: '', city: '', state: '', postal_code: '', country: 'IN', is_default: false,
  });

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login?redirect=/checkout'); return; }

      const [custRes, addrRes] = await Promise.all([
        fetch('/api/customers/me'),
        fetch('/api/customers/me/addresses'),
      ]);
      const cust = await custRes.json();
      const addr = await addrRes.json();
      setCustomer(cust);
      if (Array.isArray(addr)) {
        setAddresses(addr);
        const def = addr.find((a: Address) => a.is_default);
        if (def) setSelectedAddressId(def.id);
        else if (addr.length > 0) setSelectedAddressId(addr[0].id);
      }
      setLoading(false);
    };
    init();
  }, [router]);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/customers/me/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addressForm),
      });
      if (!res.ok) throw new Error('Failed to save address');
      const created = await res.json();
      setAddresses(prev => [created, ...prev]);
      setSelectedAddressId(created.id);
      setShowAddressForm(false);
      setAddressForm({ label: '', line1: '', line2: '', city: '', state: '', postal_code: '', country: 'IN', is_default: false });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId && addresses.length > 0) return;
    setError('');
    setShowPayment(true);
  };

  const handlePaymentSuccess = async () => {
    setShowPayment(false);
    setSubmitting(true);

    const address = addresses.find(a => a.id === selectedAddressId);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          coupon_code: coupon?.code || undefined,
          shipping_address: address ? {
            label: address.label,
            line1: address.line1,
            line2: address.line2,
            city: address.city,
            state: address.state,
            postal_code: address.postal_code,
            country: address.country,
          } : {},
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Checkout failed');

      setOrderResult(data.order);
      clearCart();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow px-6 md:px-12 py-14 grid grid-cols-1 lg:grid-cols-5 gap-12">
          <div className="lg:col-span-3 space-y-4">
            <div className="h-10 w-56 bg-gray-100 animate-pulse mb-8" />
            {[0, 1].map((i) => <div key={i} className="h-28 bg-gray-50 animate-pulse" />)}
          </div>
          <div className="lg:col-span-2 h-80 bg-gray-50 animate-pulse" />
        </div>
      </div>
    );
  }

  if (orderResult) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center px-6 py-24">
          <div className="text-center max-w-md animate-fade-up">
            <div className="w-16 h-16 mx-auto mb-8 bg-black text-white flex items-center justify-center text-2xl">✓</div>
            <span className="block text-[9px] font-bold uppercase tracking-[0.4em] text-gray-400 mb-4">Order #{orderResult.id.slice(0, 8)}</span>
            <h1 className="text-4xl md:text-5xl font-serif uppercase tracking-tighter leading-none mb-6">Thank You</h1>
            <p className="text-xs text-gray-500 uppercase tracking-wider leading-relaxed mb-8">
              Thank you for your order. We&apos;ll send you a confirmation email shortly.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href={`/account/orders/${orderResult.id}`}
                className="bg-black text-white border border-black px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-colors"
              >
                View Order
              </Link>
              <Link
                href="/shop"
                className="border border-black px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const subtotal = cartTotal;
  const shipping = subtotal >= 200 ? 0 : 15;
  const discount = coupon?.discount || 0;
  const tax = (subtotal - discount) * 0.08875;
  const total = subtotal - discount + shipping + tax;

  const selectedAddress = addresses.find(a => a.id === selectedAddressId);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <header className="border-b border-black px-6 md:px-12 pt-10 pb-8 md:pt-14">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <span className="block text-[9px] font-bold uppercase tracking-[0.4em] text-gray-400 mb-4">Secure Checkout</span>
            <h1 className="text-4xl md:text-6xl font-normal font-serif uppercase tracking-tighter leading-[0.9]">Checkout</h1>
          </div>
          <ol className="flex items-center gap-3 text-[9px] font-bold uppercase tracking-[0.25em]">
            {['Cart', 'Details', 'Payment'].map((step, i) => (
              <li key={step} className="flex items-center gap-3">
                <span className={`flex items-center gap-2 ${i <= 1 ? 'text-black' : 'text-gray-300'}`}>
                  <span className={`w-5 h-5 flex items-center justify-center border ${i < 1 ? 'bg-black text-white border-black' : i === 1 ? 'border-black' : 'border-gray-300'}`}>
                    {i < 1 ? '✓' : i + 1}
                  </span>
                  {step}
                </span>
                {i < 2 && <span className="w-6 h-px bg-black/20" />}
              </li>
            ))}
          </ol>
        </div>
      </header>

      {cart.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24">
          <span className="font-serif text-7xl text-black/10 mb-6">0</span>
          <p className="text-2xl font-serif uppercase tracking-tighter mb-3">Your Cart Is Empty</p>
          <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-8">Add a few pieces before checking out.</p>
          <Link href="/shop" className="bg-black text-white border border-black px-10 py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-colors">
            Shop The Collection
          </Link>
        </div>
      ) : (
      <div className="max-w-7xl w-full px-6 md:px-12 py-12 flex-1">

        {error && (
          <div className="bg-red-50 border border-red-200 p-4 mb-8">
            <p className="text-[10px] uppercase tracking-widest text-red-600 font-bold">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Left — Shipping & Items */}
          <div className="lg:col-span-3 space-y-12">
            {/* Shipping Address */}
            <div>
              <p className="flex items-baseline gap-3 text-[11px] font-bold uppercase tracking-[0.2em] mb-6 pb-4 border-b border-black"><span className="font-serif text-2xl font-normal">01</span> Shipping Address</p>

              {addresses.length > 0 && !showAddressForm ? (
                <div className="space-y-3">
                  {addresses.map(addr => (
                    <label
                      key={addr.id}
                      className={`flex items-start gap-4 p-5 border cursor-pointer transition-colors ${
                        selectedAddressId === addr.id ? 'border-black' : 'border-black/15 hover:border-black/40'
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        checked={selectedAddressId === addr.id}
                        onChange={() => setSelectedAddressId(addr.id)}
                        className="sr-only"
                      />
                      <span className={`mt-0.5 w-4 h-4 shrink-0 border border-black flex items-center justify-center`}>
                        {selectedAddressId === addr.id && <span className="w-2 h-2 bg-black" />}
                      </span>
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-widest">{addr.label}</p>
                        <p className="text-sm mt-1">{addr.line1}</p>
                        {addr.line2 && <p className="text-sm">{addr.line2}</p>}
                        <p className="text-sm">{addr.city}, {addr.state} {addr.postal_code}</p>
                      </div>
                    </label>
                  ))}
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="text-[10px] font-bold uppercase tracking-[0.2em] border-b border-black pb-0.5 hover:opacity-50 transition-opacity"
                  >
                    + Add New Address
                  </button>
                </div>
              ) : (
                <form onSubmit={handleAddAddress} className="space-y-5 border border-black p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] uppercase tracking-widest font-bold block mb-1">Label</label>
                      <input type="text" required value={addressForm.label} onChange={e => setAddressForm({ ...addressForm, label: e.target.value })} className="w-full border-b border-black/30 focus:border-black py-2 text-sm focus:outline-none transition-colors" placeholder="Home" />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-widest font-bold block mb-1">Postal Code</label>
                      <input type="text" required value={addressForm.postal_code} onChange={e => setAddressForm({ ...addressForm, postal_code: e.target.value })} className="w-full border-b border-black/30 focus:border-black py-2 text-sm focus:outline-none transition-colors" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold block mb-1">Address Line 1</label>
                    <input type="text" required value={addressForm.line1} onChange={e => setAddressForm({ ...addressForm, line1: e.target.value })} className="w-full border-b border-black/30 focus:border-black py-2 text-sm focus:outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold block mb-1">Address Line 2 (optional)</label>
                    <input type="text" value={addressForm.line2} onChange={e => setAddressForm({ ...addressForm, line2: e.target.value })} className="w-full border-b border-black/30 focus:border-black py-2 text-sm focus:outline-none transition-colors" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] uppercase tracking-widest font-bold block mb-1">City</label>
                      <input type="text" required value={addressForm.city} onChange={e => setAddressForm({ ...addressForm, city: e.target.value })} className="w-full border-b border-black/30 focus:border-black py-2 text-sm focus:outline-none transition-colors" />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-widest font-bold block mb-1">State</label>
                      <input type="text" required value={addressForm.state} onChange={e => setAddressForm({ ...addressForm, state: e.target.value })} className="w-full border-b border-black/30 focus:border-black py-2 text-sm focus:outline-none transition-colors" />
                    </div>
                  </div>
                  <div className="flex gap-4 pt-2">
                    <button type="submit" className="bg-black text-white border border-black px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-colors">
                      Save & Use
                    </button>
                    {addresses.length > 0 && (
                      <button type="button" onClick={() => setShowAddressForm(false)} className="text-[10px] uppercase tracking-widest text-gray-500 hover:text-black">
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>

            {/* Order Items */}
            <div>
              <p className="flex items-baseline gap-3 text-[11px] font-bold uppercase tracking-[0.2em] mb-6 pb-4 border-b border-black"><span className="font-serif text-2xl font-normal">02</span> Review Items ({cart.length})</p>
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id + (item.selectedSize || '') + (item.selectedColor || '')} className="flex gap-4 pb-4 border-b border-black/10">
                    <div className="w-20 h-24 bg-gray-50 shrink-0">
                      {item.images[0] && (
                        <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-[11px] font-bold uppercase tracking-widest">{item.name}</p>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-1">
                        {[item.selectedSize, item.selectedColor].filter(Boolean).join(' / ') || item.category}
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-[10px] text-gray-500">Qty: {item.quantity}</p>
                        <p className="text-sm font-medium">₹{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right — Order Summary */}
          <div className="lg:col-span-2">
            <div className="border border-black p-8 sticky top-24">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] mb-6 pb-4 border-b border-black">Order Summary</p>

              <div className="mb-6">
                {coupon ? (
                  <div className="flex items-center justify-between gap-3 border border-black px-3 py-2.5">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.2em]">{coupon.code}</p>
                      <p className="text-[10px] text-gray-500">{coupon.message}</p>
                    </div>
                    <button onClick={() => { setCoupon(null); setCouponInput(''); }} className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400 hover:text-black">Remove</button>
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => { e.preventDefault(); if (couponInput.trim()) checkCoupon(couponInput.trim(), subtotal); }}
                    className="flex border border-black/20 focus-within:border-black transition-colors"
                  >
                    <input
                      value={couponInput}
                      onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponMessage(''); }}
                      placeholder="COUPON CODE"
                      aria-label="Coupon code"
                      className="flex-1 min-w-0 px-3 py-2.5 text-[11px] font-bold uppercase tracking-[0.15em] focus:outline-none placeholder:text-gray-300"
                    />
                    <button type="submit" disabled={checkingCoupon || !couponInput.trim()} className="px-4 text-[10px] font-bold uppercase tracking-[0.2em] border-l border-black/20 hover:bg-black hover:text-white disabled:opacity-40 transition-colors">
                      {checkingCoupon ? '…' : 'Apply'}
                    </button>
                  </form>
                )}
                {couponMessage && <p className="text-[10px] text-gray-600 mt-2">{couponMessage}</p>}
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                {coupon && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Discount <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-black border border-black px-1.5 py-0.5 ml-1">{coupon.code}</span></span>
                    <span>−₹{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Shipping</span>
                  <span>{shipping === 0 ? 'Free' : `₹${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Tax</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold border-t border-black pt-4 mt-4 text-base">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>

              {subtotal < 200 && (
                <p className="text-[9px] text-gray-400 uppercase tracking-wider mt-4">
                  Add ₹{(200 - subtotal).toFixed(2)} more for free shipping
                </p>
              )}

              <button
                onClick={handlePlaceOrder}
                disabled={submitting || cart.length === 0 || (addresses.length > 0 && !selectedAddressId)}
                className="w-full bg-black text-white border border-black py-5 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-colors mt-8 disabled:bg-gray-400 disabled:border-gray-400 disabled:text-white"
              >
                {submitting ? 'Processing...' : `Pay ₹${total.toFixed(2)}`}
              </button>

              <p className="text-[9px] text-gray-400 uppercase tracking-[0.2em] text-center mt-4">Encrypted payment · 14-day returns</p>
              <Link
                href="/shop"
                className="block text-center mt-4 text-[10px] uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
      )}

      <Footer />

      {showPayment && (
        <MockRazorpayModal
          amount={total}
          onSuccess={handlePaymentSuccess}
          onClose={() => setShowPayment(false)}
        />
      )}
    </div>
  );
}
