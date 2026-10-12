'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AccountOrderRow from '@/components/AccountOrderRow';

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

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <h2 className="text-2xl md:text-3xl font-serif uppercase tracking-tighter leading-none">Orders</h2>
        {!loading && <span className="text-[10px] text-gray-400 uppercase tracking-widest tabular-nums">{orders.length} Total</span>}
      </div>

      {loading ? (
        <div className="border-t border-black">
          {[0, 1, 2].map((i) => <div key={i} className="h-[73px] border-b border-black/10 animate-pulse bg-gray-50" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="border border-black p-12 text-center">
          <p className="text-2xl font-serif uppercase tracking-tighter mb-3">No Orders Yet</p>
          <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-8">Once you place an order it will show up here.</p>
          <Link href="/shop" className="inline-block bg-black text-white border border-black px-8 py-3 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-colors">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="border-t border-black">
          <div className="hidden md:grid grid-cols-4 gap-4 px-6 py-3 border-b border-black text-[9px] font-bold uppercase tracking-[0.3em] text-gray-400">
            <span>Order</span><span>Items</span><span>Status</span><span className="text-right">Total</span>
          </div>
          {orders.map((order: any) => <AccountOrderRow key={order.id} order={order} />)}
        </div>
      )}
    </div>
  );
}
