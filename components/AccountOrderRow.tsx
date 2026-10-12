import Link from 'next/link';
import { OrderStatusBadge } from './OrderStatus';

interface OrderRowProps {
  order: { id: string; created_at: string; status: string; total: number | string; order_items?: unknown[] };
}

export default function AccountOrderRow({ order }: OrderRowProps) {
  return (
    <Link
      href={`/account/orders/${order.id}`}
      className="group grid grid-cols-2 md:grid-cols-4 items-center gap-4 px-5 md:px-6 py-5 border-b border-black/10 hover:bg-gray-50 transition-colors"
    >
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.15em]">#{order.id.slice(0, 8)}</p>
        <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-1">
          {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>
      </div>
      <p className="hidden md:block text-[10px] text-gray-500 uppercase tracking-widest">
        {order.order_items ? `${order.order_items.length} item${order.order_items.length === 1 ? '' : 's'}` : '—'}
      </p>
      <div className="text-right md:text-left">
        <OrderStatusBadge status={order.status} />
      </div>
      <p className="hidden md:flex justify-end items-center gap-3 text-sm tabular-nums">
        ₹{Number(order.total).toFixed(2)}
        <span className="text-gray-300 group-hover:text-black transition-colors">→</span>
      </p>
    </Link>
  );
}
