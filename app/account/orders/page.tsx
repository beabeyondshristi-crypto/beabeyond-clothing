'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AccountOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/customers/me/orders')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setOrders(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-[10px] uppercase tracking-widest text-gray-400">Loading orders...</p>;

  if (orders.length === 0) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-serif uppercase tracking-tighter">Orders</h1>
        <div className="border border-black/10 p-12 text-center">
          <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-4">No orders yet</p>
          <Link href="/shop" className="inline-block bg-black text-white px-8 py-3 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-gray-800 transition-colors">
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-serif uppercase tracking-tighter">Orders ({orders.length})</h1>

      <div className="space-y-2">
        {orders.map((order: any) => (
          <Link
            key={order.id}
            href={`/account/orders/${order.id}`}
            className="flex justify-between items-center px-6 py-4 border border-black/5 hover:border-black transition-colors"
          >
            <div>
              <p className="text-sm font-medium">#{order.id.slice(0, 8)}</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">{new Date(order.created_at).toLocaleDateString()} — {order.order_items?.length || 0} item(s)</p>
            </div>
            <div className="text-right">
              <span className={`text-[10px] font-bold uppercase tracking-widest ${
                order.status === 'delivered' ? 'text-green-700' :
                order.status === 'cancelled' ? 'text-red-600' :
                'text-yellow-700'
              }`}>
                {order.status}
              </span>
              <p className="text-[10px] text-gray-500 mt-1">₹{Number(order.total).toFixed(2)}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
