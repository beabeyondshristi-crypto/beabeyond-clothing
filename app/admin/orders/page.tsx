'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import type { Order } from '@/lib/types';
import { OrderTracker } from '@/components/OrderStatus';
import { api, Button, Card, dateTime, Drawer, EmptyState, inr, PageHeader, SearchInput, shortDate, Skeleton, StatusBadge, Tabs, useToast } from '@/components/admin/ui';

type StatusFilter = 'all' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
const NEXT: Record<string, { status: string; label: string } | undefined> = {
  pending: { status: 'processing', label: 'Start Processing' },
  processing: { status: 'shipped', label: 'Mark as Shipped' },
  shipped: { status: 'delivered', label: 'Mark as Delivered' },
};

export default function OrdersPage() {
  const toast = useToast();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [status, setStatus] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Order | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const data = await api<Order[]>('/api/admin/orders');
    setOrders(data);
    return data;
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const s = params.get('status') as StatusFilter | null;
    if (s) setStatus(s);
    load()
      .then((data) => { const id = params.get('open'); if (id) setSelected(data.find((o) => o.id === id) || null); })
      .catch((e) => toast(e.message, 'error'));
  }, [load, toast]);

  const count = (s: StatusFilter) => (orders || []).filter((o) => s === 'all' || o.status === s).length;
  const visible = (orders || []).filter((o) => {
    if (status !== 'all' && o.status !== status) return false;
    if (!search) return true;
    const q = search.toLowerCase().replace('#', '');
    return o.id.toLowerCase().includes(q) || o.customer_name?.toLowerCase().includes(q) || o.customer_email?.toLowerCase().includes(q);
  });

  const setOrderStatus = async (order: Order, next: string) => {
    if (next === 'cancelled' && !confirm('Cancel this order? The customer will see it as cancelled.')) return;
    setBusy(true);
    try {
      const updated = await api<Order>(`/api/admin/orders/${order.id}`, { method: 'PATCH', json: { status: next } });
      toast(`Order #${order.id.slice(0, 8)} → ${next}`);
      setSelected(updated);
      await load();
    } catch (e) { toast(e instanceof Error ? e.message : 'Update failed', 'error'); }
    finally { setBusy(false); }
  };

  const address = selected?.shipping_address || {};
  const addressLines = [address.line1, address.line2, [address.city, address.state, address.postal_code].filter(Boolean).join(', '), address.country].filter(Boolean);

  return (
    <div>
      <PageHeader eyebrow="Store" title="Orders" description="Track, fulfil and update every order. Customers see status changes on their account instantly." />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4">
        <Tabs<StatusFilter> value={status} onChange={setStatus} options={(['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'] as StatusFilter[]).map((s) => ({ value: s, label: s, count: count(s) }))} />
        <SearchInput value={search} onChange={setSearch} placeholder="Order #, name or email" />
      </div>

      <Card padded={false}>
        {!orders ? (
          <div className="p-5 space-y-3">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-12" />)}</div>
        ) : visible.length === 0 ? (
          <EmptyState title="No orders here" text={search ? 'No orders match your search.' : 'Orders with this status will appear here.'} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[720px]">
              <thead>
                <tr className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400 border-b border-black/10">
                  <th className="px-5 py-3 font-bold">Order</th><th className="px-5 py-3 font-bold">Date</th><th className="px-5 py-3 font-bold">Customer</th>
                  <th className="px-5 py-3 font-bold">Items</th><th className="px-5 py-3 font-bold">Status</th><th className="px-5 py-3 font-bold text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((o) => (
                  <tr key={o.id} onClick={() => setSelected(o)} className="border-b border-black/5 last:border-0 hover:bg-gray-50 cursor-pointer text-xs">
                    <td className="px-5 py-3 font-semibold">#{o.id.slice(0, 8)}</td>
                    <td className="px-5 py-3 text-gray-500">{shortDate(o.created_at)}</td>
                    <td className="px-5 py-3"><p>{o.customer_name || '—'}</p><p className="text-[10px] text-gray-400">{o.customer_email}</p></td>
                    <td className="px-5 py-3 text-gray-500">{o.items.reduce((n, i) => n + i.quantity, 0)}</td>
                    <td className="px-5 py-3"><StatusBadge status={o.status} /></td>
                    <td className="px-5 py-3 text-right font-semibold tabular-nums">{inr(o.total, 2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Drawer
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected ? `Order #${selected.id.slice(0, 8)}` : ''}
        subtitle={selected ? dateTime(selected.created_at) : ''}
        footer={selected && (
          <>
            {selected.status !== 'cancelled' && selected.status !== 'delivered' && (
              <Button variant="danger" className="mr-auto" disabled={busy} onClick={() => setOrderStatus(selected, 'cancelled')}>Cancel Order</Button>
            )}
            <Button variant="ghost" onClick={() => window.print()}>Print</Button>
            {NEXT[selected.status] && <Button disabled={busy} onClick={() => setOrderStatus(selected, NEXT[selected.status]!.status)}>{busy ? 'Updating…' : NEXT[selected.status]!.label}</Button>}
          </>
        )}
      >
        {selected && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <StatusBadge status={selected.status} />
              <span className="text-xl font-semibold tabular-nums">{inr(selected.total, 2)}</span>
            </div>
            <div className="border border-black/10 p-5"><OrderTracker status={selected.status} /></div>

            <section>
              <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-3">Items</p>
              <ul className="border-t border-black">
                {selected.items.map((item) => (
                  <li key={item.id} className="flex justify-between gap-4 py-3 border-b border-black/10">
                    <div>
                      <Link href={`/product/${item.product_id}`} target="_blank" className="text-xs font-semibold hover:underline">{item.product_name}</Link>
                      <p className="text-[10px] text-gray-400 mt-0.5">{[item.size && `Size ${item.size}`, item.color, `Qty ${item.quantity}`].filter(Boolean).join(' · ')}</p>
                    </div>
                    <span className="text-xs tabular-nums">{inr(item.price * item.quantity, 2)}</span>
                  </li>
                ))}
              </ul>
              <div className="space-y-1.5 text-xs mt-4">
                <div className="flex justify-between text-gray-500"><span>Subtotal</span><span className="tabular-nums">{inr(selected.subtotal, 2)}</span></div>
                {selected.discount > 0 && (
                  <div className="flex justify-between text-gray-500"><span>Discount{selected.coupon_code ? ` · ${selected.coupon_code}` : ''}</span><span className="tabular-nums">−{inr(selected.discount, 2)}</span></div>
                )}
                <div className="flex justify-between text-gray-500"><span>Shipping</span><span>{selected.shipping_cost === 0 ? 'Free' : inr(selected.shipping_cost, 2)}</span></div>
                <div className="flex justify-between text-gray-500"><span>Tax</span><span className="tabular-nums">{inr(selected.tax, 2)}</span></div>
                <div className="flex justify-between font-semibold text-sm pt-2 border-t border-black/10"><span>Total</span><span className="tabular-nums">{inr(selected.total, 2)}</span></div>
              </div>
            </section>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <section className="border border-black/10 p-4">
                <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-3">Customer</p>
                <p className="text-xs font-semibold">{selected.customer_name || '—'}</p>
                <a href={`mailto:${selected.customer_email}`} className="text-xs text-gray-600 hover:underline break-all">{selected.customer_email}</a>
              </section>
              <section className="border border-black/10 p-4">
                <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-3">Ship To</p>
                {addressLines.length ? addressLines.map((l, i) => <p key={i} className="text-xs text-gray-700">{l}</p>) : <p className="text-xs text-gray-400">No address</p>}
              </section>
            </div>
            {selected.notes && <p className="text-xs text-gray-600 border-l-2 border-black pl-3">{selected.notes}</p>}
          </div>
        )}
      </Drawer>
    </div>
  );
}
