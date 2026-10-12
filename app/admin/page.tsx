'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Analytics } from '@/lib/admin-db';
import { api, Card, compact, delta, EmptyState, inr, PageHeader, shortDate, Skeleton, Stat, StatusBadge, Button } from '@/components/admin/ui';
import { TrendChart, RankBars } from '@/components/admin/charts';

export default function AdminDashboard() {
  const [data, setData] = useState<Analytics | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api<Analytics>('/api/admin/analytics?range=30').then(setData).catch((e) => setError(e.message));
  }, []);

  const greeting = (() => {
    const h = new Date().getHours();
    return h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening';
  })();

  if (error) return <Card><EmptyState title="Couldn’t load dashboard" text={error} /></Card>;

  const k = data?.kpis;
  const toFulfil = data ? data.byStatus.filter((s) => s.status === 'pending' || s.status === 'processing').reduce((n, s) => n + s.count, 0) : 0;
  const topSellers = data ? [...data.products].sort((a, b) => b.units - a.units).slice(0, 5) : [];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
        title={greeting}
        description="Here’s how the store performed over the last 30 days."
        actions={
          <>
            <Link href="/admin/products?new=1"><Button>+ Add Product</Button></Link>
            <Link href="/admin/content"><Button variant="secondary">Edit Pages</Button></Link>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {k ? (
          <>
            <Stat label="Revenue" value={inr(k.revenue)} delta={delta(k.revenue, k.revenuePrev)} hint="vs prior 30 days" />
            <Stat label="Orders" value={String(k.orders)} delta={delta(k.orders, k.ordersPrev)} hint="vs prior 30 days" />
            <Stat label="Average order value" value={inr(k.aov)} delta={delta(k.aov, k.aovPrev)} />
            <Stat label="Conversion rate" value={`${k.conversion.toFixed(2)}%`} hint={`${compact(k.views)} product views`} />
          </>
        ) : (
          [0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-[118px]" />)
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Revenue — last 30 days" className="lg:col-span-2" action={<Link href="/admin/analytics" className="text-[10px] font-bold uppercase tracking-[0.15em] hover:opacity-50">Full Analytics →</Link>}>
          {data ? (
            <TrendChart ariaLabel="Daily revenue, last 30 days" data={data.daily.map((d) => ({ label: shortDate(d.date), value: d.revenue }))} format={(n) => inr(n)} />
          ) : <Skeleton className="h-[220px]" />}
        </Card>

        <Card title="Needs Attention">
          {data ? (
            <ul className="divide-y divide-black/10 -my-2">
              <li>
                <Link href="/admin/orders?status=pending" className="flex items-center justify-between py-3 group">
                  <span className="text-xs">Orders to fulfil</span>
                  <span className="flex items-center gap-2 text-sm font-semibold">{toFulfil}<span className="text-gray-300 group-hover:text-black">→</span></span>
                </Link>
              </li>
              <li>
                <Link href="/admin/inventory?filter=low" className="flex items-center justify-between py-3 group">
                  <span className="text-xs">Low or out of stock</span>
                  <span className="flex items-center gap-2 text-sm font-semibold">{data.lowStock.length}<span className="text-gray-300 group-hover:text-black">→</span></span>
                </Link>
              </li>
              {data.lowStock.slice(0, 4).map((p) => (
                <li key={p.id} className="flex items-center justify-between py-2.5 pl-3">
                  <span className="text-[11px] text-gray-600 truncate">{p.name}</span>
                  <span className={`text-[10px] font-bold uppercase tracking-[0.1em] ${p.soldOut ? 'text-black' : 'text-gray-500'}`}>{p.soldOut ? 'Sold out' : `${p.available} left`}</span>
                </li>
              ))}
              <li className="pt-3">
                <p className="text-[10px] text-gray-400">{k?.newCustomers} new customers this month · {k?.customers} total</p>
              </li>
            </ul>
          ) : <Skeleton className="h-[220px]" />}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Recent Orders" className="lg:col-span-2" padded={false} action={<Link href="/admin/orders" className="text-[10px] font-bold uppercase tracking-[0.15em] hover:opacity-50">All Orders →</Link>}>
          {data ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400 border-b border-black/10">
                    <th className="px-5 py-3 font-bold">Order</th><th className="px-5 py-3 font-bold">Customer</th>
                    <th className="px-5 py-3 font-bold">Status</th><th className="px-5 py-3 font-bold text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentOrders.map((o) => (
                    <tr key={o.id} className="border-b border-black/5 last:border-0 hover:bg-gray-50">
                      <td className="px-5 py-3">
                        <Link href={`/admin/orders?open=${o.id}`} className="text-xs font-semibold hover:underline">#{o.id.slice(0, 8)}</Link>
                        <p className="text-[10px] text-gray-400">{shortDate(o.created_at)} · {o.items.length} item{o.items.length === 1 ? '' : 's'}</p>
                      </td>
                      <td className="px-5 py-3 text-xs">{o.customer_name || '—'}</td>
                      <td className="px-5 py-3"><StatusBadge status={o.status} /></td>
                      <td className="px-5 py-3 text-xs font-semibold text-right tabular-nums">{inr(o.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <div className="p-5"><Skeleton className="h-48" /></div>}
        </Card>

        <Card title="Top Sellers · Units" action={<Link href="/admin/analytics" className="text-[10px] font-bold uppercase tracking-[0.15em] hover:opacity-50">More →</Link>}>
          {data ? (
            <RankBars items={topSellers.map((p) => ({ label: p.name, value: p.units }))} format={(n) => `${n}`} />
          ) : <Skeleton className="h-48" />}
        </Card>
      </div>
    </div>
  );
}
