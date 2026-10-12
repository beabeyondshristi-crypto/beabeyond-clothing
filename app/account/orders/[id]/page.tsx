'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { OrderStatusBadge, OrderTracker } from '@/components/OrderStatus';

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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-56 bg-gray-100 animate-pulse" />
        <div className="h-40 bg-gray-50 animate-pulse" />
      </div>
    );
  }

  if (notFound || !order) {
    return (
      <div className="border border-black p-12 text-center">
        <p className="text-2xl font-serif uppercase tracking-tighter mb-3">Order Not Found</p>
        <Link href="/account/orders" className="text-[10px] font-bold uppercase tracking-[0.2em] border-b border-black pb-0.5 hover:opacity-50">
          Back to Orders
        </Link>
      </div>
    );
  }

  const address = order.shipping_address || {};
  const addressLines = [address.label, address.line1, address.line2, [address.city, address.state, address.postal_code].filter(Boolean).join(', '), address.country].filter(Boolean);

  return (
    <div className="space-y-12">
      <div>
        <Link href="/account/orders" className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 hover:text-black transition-colors">
          ← All Orders
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-6">
          <div>
            <h2 className="text-3xl md:text-4xl font-serif uppercase tracking-tighter leading-none">Order #{order.id.slice(0, 8)}</h2>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-3">
              Placed {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>
      </div>

      <div className="border border-black p-6 md:p-8">
        <OrderTracker status={order.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-4">Items</p>
          <div className="border-t border-black">
            {(order.order_items || []).map((item: any) => (
              <div key={item.id} className="flex justify-between items-center gap-4 py-5 border-b border-black/10">
                <div>
                  <Link href={`/product/${item.product_id}`} className="text-[11px] font-bold uppercase tracking-[0.15em] hover:opacity-50 transition-opacity">
                    {item.product_name}
                  </Link>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-1">
                    {[item.size && `Size ${item.size}`, item.color, `Qty ${item.quantity}`].filter(Boolean).join(' / ')}
                  </p>
                </div>
                <p className="text-sm tabular-nums">₹{(Number(item.price) * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </section>

        <aside className="space-y-8">
          <div className="border border-black p-6 space-y-3 text-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-4">Summary</p>
            <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span className="tabular-nums">₹{Number(order.subtotal).toFixed(2)}</span></div>
            {Number(order.discount) > 0 && (
              <div className="flex justify-between"><span className="text-gray-500">Discount{order.coupon_code ? ` (${order.coupon_code})` : ''}</span><span className="tabular-nums">−₹{Number(order.discount).toFixed(2)}</span></div>
            )}
            <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span>{Number(order.shipping_cost) === 0 ? 'Free' : `₹${Number(order.shipping_cost).toFixed(2)}`}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Tax</span><span className="tabular-nums">₹{Number(order.tax).toFixed(2)}</span></div>
            <div className="flex justify-between font-bold border-t border-black pt-3 mt-3"><span>Total</span><span className="tabular-nums">₹{Number(order.total).toFixed(2)}</span></div>
          </div>

          {addressLines.length > 0 && (
            <div className="border border-black p-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-4">Shipping To</p>
              {addressLines.map((line: string, i: number) => (
                <p key={i} className={i === 0 ? 'text-[11px] font-bold uppercase tracking-[0.15em] mb-1' : 'text-sm text-gray-700'}>{line}</p>
              ))}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
