'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AccountOrderRow from '@/components/AccountOrderRow';

export default function AccountDashboard() {
  const [stats, setStats] = useState({ total: 0, pending: 0, spent: 0, recent: [] as any[] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/customers/me/orders')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setStats({
            total: data.length,
            pending: data.filter((o: any) => o.status === 'pending' || o.status === 'processing').length,
            spent: data.filter((o: any) => o.status !== 'cancelled').reduce((sum: number, o: any) => sum + Number(o.total), 0),
            recent: data.slice(0, 5),
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: 'Total Orders', value: String(stats.total).padStart(2, '0') },
    { label: 'Active Orders', value: String(stats.pending).padStart(2, '0') },
    { label: 'Total Spent', value: `₹${Math.round(stats.spent)}` },
  ];

  return (
    <div className="space-y-16">
      <div className="grid grid-cols-1 sm:grid-cols-3 border border-black">
        {cards.map((card, i) => (
          <div key={card.label} className={`p-8 border-black ${i < cards.length - 1 ? 'border-b sm:border-b-0 sm:border-r' : ''}`}>
            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-6">{card.label}</p>
            <p className={`text-5xl font-serif tabular-nums ${loading ? 'text-gray-200' : ''}`}>{card.value}</p>
          </div>
        ))}
      </div>

      <section>
        <div className="flex justify-between items-end mb-6">
          <div>
            <span className="block text-[9px] font-bold uppercase tracking-[0.4em] text-gray-400 mb-3">History</span>
            <h2 className="text-2xl md:text-3xl font-serif uppercase tracking-tighter leading-none">Recent Orders</h2>
          </div>
          <Link href="/account/orders" className="text-[10px] font-bold uppercase tracking-[0.2em] border-b border-black pb-0.5 hover:opacity-50 transition-opacity">
            View All
          </Link>
        </div>

        {!loading && stats.recent.length === 0 ? (
          <div className="border border-black p-12 text-center">
            <p className="text-2xl font-serif uppercase tracking-tighter mb-3">No Orders Yet</p>
            <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-8">Your orders will appear here.</p>
            <Link href="/shop" className="inline-block bg-black text-white border border-black px-8 py-3 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-colors">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="border-t border-black">
            {stats.recent.map((order: any) => <AccountOrderRow key={order.id} order={order} />)}
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-black border border-black">
        {[
          { title: 'Profile', text: 'Update your name and phone number', href: '/account/profile' },
          { title: 'Addresses', text: 'Manage your saved delivery addresses', href: '/account/addresses' },
        ].map((item) => (
          <Link key={item.href} href={item.href} className="group bg-white p-8 hover:bg-gray-50 transition-colors">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] mb-2 flex justify-between">
              {item.title}
              <span className="text-gray-300 group-hover:text-black transition-colors">→</span>
            </p>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">{item.text}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
