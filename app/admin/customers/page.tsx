'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { CustomerSummary } from '@/lib/admin-db';
import type { Order } from '@/lib/types';
import { api, Card, Drawer, EmptyState, inr, PageHeader, SearchInput, Select, shortDate, Skeleton, Stat, StatusBadge, useToast } from '@/components/admin/ui';

type Sort = 'spent' | 'orders' | 'recent' | 'newest';

export default function CustomersPage() {
  const toast = useToast();
  const [customers, setCustomers] = useState<CustomerSummary[] | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<Sort>('spent');
  const [selected, setSelected] = useState<CustomerSummary | null>(null);

  useEffect(() => {
    Promise.all([api<CustomerSummary[]>('/api/admin/customers'), api<Order[]>('/api/admin/orders')])
      .then(([c, o]) => { setCustomers(c); setOrders(o); })
      .catch((e) => toast(e.message, 'error'));
  }, [toast]);

  const list = (customers || [])
    .filter((c) => !search || `${c.name} ${c.email} ${c.phone}`.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === 'orders') return b.orders - a.orders;
      if (sort === 'recent') return (b.last_order || '').localeCompare(a.last_order || '');
      if (sort === 'newest') return b.created_at.localeCompare(a.created_at);
      return b.spent - a.spent;
    });

  const buyers = (customers || []).filter((c) => c.orders > 0);
  const repeat = buyers.filter((c) => c.orders > 1).length;
  const ltv = buyers.length ? buyers.reduce((s, c) => s + c.spent, 0) / buyers.length : 0;
  const history = selected ? orders.filter((o) => o.customer_id === selected.id || o.customer_email === selected.email) : [];

  return (
    <div>
      <PageHeader eyebrow="Store" title="Customers" description="Everyone with an account, with what they’ve ordered and spent." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {customers ? (
          <>
            <Stat label="Customers" value={String(customers.length)} />
            <Stat label="Have ordered" value={String(buyers.length)} hint={`${customers.length ? Math.round((buyers.length / customers.length) * 100) : 0}% of accounts`} />
            <Stat label="Repeat customers" value={String(repeat)} hint={`${buyers.length ? Math.round((repeat / buyers.length) * 100) : 0}% of buyers`} />
            <Stat label="Avg. lifetime value" value={inr(ltv)} />
          </>
        ) : [0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-[118px]" />)}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <Select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="w-52" options={[
          { value: 'spent', label: 'Sort: Highest spend' }, { value: 'orders', label: 'Sort: Most orders' },
          { value: 'recent', label: 'Sort: Recent buyers' }, { value: 'newest', label: 'Sort: Newest accounts' },
        ]} />
        <SearchInput value={search} onChange={setSearch} placeholder="Name, email or phone" />
      </div>

      <Card padded={false}>
        {!customers ? (
          <div className="p-5 space-y-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-12" />)}</div>
        ) : list.length === 0 ? (
          <EmptyState title="No customers found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[680px]">
              <thead>
                <tr className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400 border-b border-black/10">
                  <th className="px-5 py-3 font-bold">Customer</th><th className="px-5 py-3 font-bold">Joined</th>
                  <th className="px-5 py-3 font-bold text-right">Orders</th><th className="px-5 py-3 font-bold text-right">Spent</th><th className="px-5 py-3 font-bold">Last Order</th>
                </tr>
              </thead>
              <tbody>
                {list.map((c) => (
                  <tr key={c.id} onClick={() => setSelected(c)} className="border-b border-black/5 last:border-0 hover:bg-gray-50 cursor-pointer text-xs">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-black text-white flex items-center justify-center text-[10px] font-bold uppercase shrink-0">{c.name?.charAt(0) || '?'}</div>
                        <div className="min-w-0"><p className="font-semibold truncate">{c.name}</p><p className="text-[10px] text-gray-400 truncate">{c.email}</p></div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-500">{shortDate(c.created_at)}</td>
                    <td className="px-5 py-3 text-right tabular-nums">{c.orders}</td>
                    <td className="px-5 py-3 text-right tabular-nums font-semibold">{inr(c.spent)}</td>
                    <td className="px-5 py-3 text-gray-500">{c.last_order ? shortDate(c.last_order) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Drawer open={!!selected} onClose={() => setSelected(null)} title={selected?.name || ''} subtitle={selected?.email}>
        {selected && (
          <div className="space-y-8">
            <div className="grid grid-cols-3 border border-black/10 divide-x divide-black/10">
              <div className="p-4"><p className="text-[10px] text-gray-500">Orders</p><p className="text-xl font-semibold mt-1">{selected.orders}</p></div>
              <div className="p-4"><p className="text-[10px] text-gray-500">Spent</p><p className="text-xl font-semibold mt-1">{inr(selected.spent)}</p></div>
              <div className="p-4"><p className="text-[10px] text-gray-500">Avg. order</p><p className="text-xl font-semibold mt-1">{inr(selected.orders ? selected.spent / selected.orders : 0)}</p></div>
            </div>
            <div className="text-xs space-y-1">
              <p><span className="text-gray-400 inline-block w-20">Email</span><a href={`mailto:${selected.email}`} className="hover:underline">{selected.email}</a></p>
              <p><span className="text-gray-400 inline-block w-20">Phone</span>{selected.phone || '—'}</p>
              <p><span className="text-gray-400 inline-block w-20">Joined</span>{new Date(selected.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
            <section>
              <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-3">Order History</p>
              {history.length === 0 ? <p className="text-xs text-gray-400">No orders yet.</p> : (
                <ul className="border-t border-black">
                  {history.map((o) => (
                    <li key={o.id}>
                      <Link href={`/admin/orders?open=${o.id}`} className="flex items-center justify-between gap-3 py-3 border-b border-black/10 hover:bg-gray-50 px-1">
                        <div><p className="text-xs font-semibold">#{o.id.slice(0, 8)}</p><p className="text-[10px] text-gray-400">{shortDate(o.created_at)} · {o.items.length} item{o.items.length === 1 ? '' : 's'}</p></div>
                        <div className="flex items-center gap-3"><StatusBadge status={o.status} /><span className="text-xs tabular-nums font-semibold">{inr(o.total)}</span></div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}
      </Drawer>
    </div>
  );
}
