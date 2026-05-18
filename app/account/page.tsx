'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from './useAuth';

export default function AccountDashboard() {
  const { customer } = useAuth();
  const [stats, setStats] = useState({ total: 0, pending: 0, recent: [] as any[] });

  useEffect(() => {
    fetch('/api/customers/me/orders')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setStats({
            total: data.length,
            pending: data.filter((o: any) => o.status === 'pending' || o.status === 'processing').length,
            recent: data.slice(0, 5),
          });
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-3xl font-serif uppercase tracking-tighter">Welcome{customer?.name ? `, ${customer.name.split(' ')[0]}` : ''}</h1>
        <p className="text-[10px] uppercase tracking-widest text-gray-400 mt-2">Account Dashboard</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        <div className="border border-black/10 p-8 text-center">
          <p className="text-4xl font-serif">{stats.total}</p>
          <p className="text-[10px] uppercase tracking-widest text-gray-500 mt-2">Total Orders</p>
        </div>
        <div className="border border-black/10 p-8 text-center">
          <p className="text-4xl font-serif">{stats.pending}</p>
          <p className="text-[10px] uppercase tracking-widest text-gray-500 mt-2">Active Orders</p>
        </div>
        <div className="border border-black/10 p-8 text-center">
          <p className="text-4xl font-serif">{customer?.name ? customer.name.split(' ').map((w: string) => w[0]).join('').toUpperCase() : '—'}</p>
          <p className="text-[10px] uppercase tracking-widest text-gray-500 mt-2">{customer?.email}</p>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xs font-bold uppercase tracking-widest">Recent Orders</h2>
          <Link href="/account/orders" className="text-[10px] uppercase tracking-widest text-gray-400 hover:text-black underline underline-offset-4">
            View All
          </Link>
        </div>

        {stats.recent.length === 0 ? (
          <div className="border border-black/10 p-12 text-center">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-4">No orders yet</p>
            <Link
              href="/shop"
              className="inline-block bg-black text-white px-8 py-3 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-gray-800 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {stats.recent.map((order: any) => (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="flex justify-between items-center px-6 py-4 border border-black/5 hover:border-black transition-colors"
              >
                <div>
                  <p className="text-sm font-medium">#{order.id.slice(0, 8)}</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider">{new Date(order.created_at).toLocaleDateString()}</p>
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
        )}
      </div>
    </div>
  );
}
