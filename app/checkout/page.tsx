'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useCart } from '@/context/CartContext';
import Navbar from '@/components/Navbar';
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
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-sm p-10 shadow-2xl text-center animate-in zoom-in-95 duration-300">
        {!done ? (
          <>
            <div className="text-3xl mb-4 font-serif">💳</div>
            <h2 className="text-lg font-serif uppercase tracking-tighter mb-2">Complete Payment</h2>
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
              className="w-full bg-blue-600 text-white py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-blue-700 transition-colors mt-6 disabled:bg-gray-400"
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
            <div className="text-5xl mb-4 text-green-600">✓</div>
            <h2 className="text-lg font-serif uppercase tracking-tighter mb-2">Payment Successful!</h2>
            <p className="text-[10px] uppercase tracking-widest text-gray-400">Redirecting to your order...</p>
          </>
        )}
      </div>
    </div>
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

  // New address form
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({
    label: '', line1: '', line2: '', city: '', state: '', postal_code: '', country: 'US', is_default: false,
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
      setAddressForm({ label: '', line1: '', line2: '', city: '', state: '', postal_code: '', country: 'US', is_default: false });
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
        <div className="flex-grow flex items-center justify-center">
          <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (orderResult) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center p-6">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-6 text-green-600">✓</div>
            <h1 className="text-3xl font-serif uppercase tracking-tighter mb-4">Order Placed!</h1>
            <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-2">Order #{orderResult.id.slice(0, 8)}</p>
            <p className="text-xs text-gray-500 uppercase tracking-wider leading-relaxed mb-8">
              Thank you for your order. We'll send you a confirmation email shortly.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href={`/account/orders/${orderResult.id}`}
                className="bg-black text-white px-8 py-3 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-gray-800 transition-colors"
              >
                View Order
              </Link>
              <Link
                href="/shop"
                className="border border-black px-8 py-3 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const subtotal = cartTotal;
  const shipping = subtotal >= 200 ? 0 : 15;
  const tax = subtotal * 0.08875;
  const total = subtotal + shipping + tax;

  const selectedAddress = addresses.find(a => a.id === selectedAddressId);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <div className="max-w-6xl mx-auto w-full px-6 md:px-12 py-12 flex-1">
        <h1 className="text-3xl font-serif uppercase tracking-tighter mb-12">Checkout</h1>

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
              <h2 className="text-xs font-bold uppercase tracking-widest mb-4">Shipping Address</h2>

              {addresses.length > 0 && !showAddressForm ? (
                <div className="space-y-3">
                  {addresses.map(addr => (
                    <label
                      key={addr.id}
                      className={`flex items-start gap-4 p-4 border cursor-pointer transition-colors ${
                        selectedAddressId === addr.id ? 'border-black' : 'border-black/10 hover:border-black/30'
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        checked={selectedAddressId === addr.id}
                        onChange={() => setSelectedAddressId(addr.id)}
                        className="mt-1"
                      />
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
                    className="text-[10px] uppercase tracking-widest text-gray-500 hover:text-black underline underline-offset-4"
                  >
                    + Add New Address
                  </button>
                </div>
              ) : (
                <form onSubmit={handleAddAddress} className="space-y-4 border border-black/10 p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] uppercase tracking-widest font-bold block mb-1">Label</label>
                      <input type="text" required value={addressForm.label} onChange={e => setAddressForm({ ...addressForm, label: e.target.value })} className="w-full border-b border-black py-2 text-sm focus:outline-none" placeholder="Home" />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-widest font-bold block mb-1">Postal Code</label>
                      <input type="text" required value={addressForm.postal_code} onChange={e => setAddressForm({ ...addressForm, postal_code: e.target.value })} className="w-full border-b border-black py-2 text-sm focus:outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold block mb-1">Address Line 1</label>
                    <input type="text" required value={addressForm.line1} onChange={e => setAddressForm({ ...addressForm, line1: e.target.value })} className="w-full border-b border-black py-2 text-sm focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold block mb-1">Address Line 2 (optional)</label>
                    <input type="text" value={addressForm.line2} onChange={e => setAddressForm({ ...addressForm, line2: e.target.value })} className="w-full border-b border-black py-2 text-sm focus:outline-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] uppercase tracking-widest font-bold block mb-1">City</label>
                      <input type="text" required value={addressForm.city} onChange={e => setAddressForm({ ...addressForm, city: e.target.value })} className="w-full border-b border-black py-2 text-sm focus:outline-none" />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-widest font-bold block mb-1">State</label>
                      <input type="text" required value={addressForm.state} onChange={e => setAddressForm({ ...addressForm, state: e.target.value })} className="w-full border-b border-black py-2 text-sm focus:outline-none" />
                    </div>
                  </div>
                  <div className="flex gap-4 pt-2">
                    <button type="submit" className="bg-black text-white px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-gray-800 transition-colors">
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
              <h2 className="text-xs font-bold uppercase tracking-widest mb-4">Items ({cart.length})</h2>
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b border-black/5">
                    <div className="w-20 h-24 bg-gray-50 shrink-0">
                      {item.images[0] && (
                        <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-[11px] font-bold uppercase tracking-widest">{item.name}</p>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-1">{item.category}</p>
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
            <div className="border border-black/10 p-8 sticky top-24">
              <h2 className="text-xs font-bold uppercase tracking-widest mb-6">Order Summary</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Shipping</span>
                  <span>{shipping === 0 ? 'Free' : `₹${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Tax</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold border-t border-black/10 pt-3 mt-3">
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
                className="w-full bg-black text-white py-5 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-gray-800 transition-colors mt-8 disabled:bg-gray-400"
              >
                {submitting ? 'Processing...' : 'Place Order'}
              </button>

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
