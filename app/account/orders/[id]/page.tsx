'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/customers/me/orders/${id}`)
      .then(r => { if (r.status === 404) { setNotFound(true); return null; } return r.json(); })
      .then(data => { if (data) setOrder(data); })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-[10px] uppercase tracking-widest text-gray-400">Loading order...</p>;
  if (notFound || !order) return <p className="text-[10px] uppercase tracking-widest text-gray-400">Order not found.</p>;

  return (
    <div className="space-y-8">
      <div>
        <Link href="/account/orders" className="text-[10px] uppercase tracking-widest text-gray-400 hover:text-black underline underline-offset-4">&larr; Back to Orders</Link>
        <h1 className="text-3xl font-serif uppercase tracking-tighter mt-4">Order #{order.id.slice(0, 8)}</h1>
        <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-1">{new Date(order.created_at).toLocaleDateString()}</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="border border-black/10 p-6">
          <h3 className="text-[10px] font-bold uppercase tracking-widest mb-3">Status</h3>
          <span className={`text-xs font-bold uppercase tracking-widest ${
            order.status === 'delivered' ? 'text-green-700' :
            order.status === 'cancelled' ? 'text-red-600' :
            'text-yellow-700'
          }`}>{order.status}</span>
        </div>
        <div className="border border-black/10 p-6">
          <h3 className="text-[10px] font-bold uppercase tracking-widest mb-3">Total</h3>
          <p className="text-xl font-serif">₹{Number(order.total).toFixed(2)}</p>
        </div>
      </div>

      <div>
        <h2 className="text-xs font-bold uppercase tracking-widest mb-4">Items</h2>
        <div className="space-y-2">
          {(order.order_items || []).map((item: any) => (
            <div key={item.id} className="flex justify-between items-center px-6 py-4 border border-black/5">
              <div>
                <p className="text-sm font-medium">{item.product_name}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">Qty: {item.quantity} {item.size ? `/ Size: ${item.size}` : ''} {item.color ? `/ Color: ${item.color}` : ''}</p>
              </div>
              <p className="text-sm">₹{(Number(item.price) * item.quantity).toFixed(2)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="border border-black/10 p-6 space-y-2">
        <div className="flex justify-between text-sm"><span>Subtotal</span><span>₹{Number(order.subtotal).toFixed(2)}</span></div>
        <div className="flex justify-between text-sm"><span>Shipping</span><span>{Number(order.shipping_cost) === 0 ? 'Free' : `₹${Number(order.shipping_cost).toFixed(2)}`}</span></div>
        <div className="flex justify-between text-sm"><span>Tax</span><span>₹{Number(order.tax).toFixed(2)}</span></div>
        <div className="flex justify-between text-sm font-bold border-t border-black/10 pt-2"><span>Total</span><span>₹{Number(order.total).toFixed(2)}</span></div>
      </div>

      {order.shipping_address && Object.keys(order.shipping_address).length > 0 && (
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest mb-4">Shipping Address</h2>
          <div className="border border-black/10 p-6 text-sm space-y-1">
            {Object.entries(order.shipping_address).map(([key, val]) => (
              <p key={key}><span className="text-[10px] uppercase tracking-widest text-gray-400">{key}: </span>{String(val)}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
