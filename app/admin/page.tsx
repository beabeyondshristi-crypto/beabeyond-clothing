'use client';

import { useEffect, useState } from 'react';
import type { DashboardStats, Order } from '@/lib/types';

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then(async (r) => {
        const d = await r.json();
        if (d?.error) throw new Error(d.error);
        setStats(d);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 p-6">
        <p className="text-[10px] uppercase tracking-widest text-red-600 font-bold">{error}</p>
        <p className="text-[9px] text-red-500 mt-2">Run SQL migration in Supabase Studio first.</p>
      </div>
    );
  }

  const statCards = [
    { name: 'Total Products', value: stats?.total_products ?? 0 },
    { name: 'Total Collections', value: stats?.total_collections ?? 0 },
    { name: 'Active Orders', value: stats?.pending_orders ?? 0 },
    { name: 'Total Revenue', value: `$${((stats?.total_revenue ?? 0)).toLocaleString()}` },
  ];

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.name} className="bg-white p-8 border border-black/5 shadow-sm">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-2 font-bold">{stat.name}</p>
            <p className="text-3xl font-serif">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="bg-white border border-black/5 shadow-sm">
          <div className="p-6 border-b border-black/5 flex justify-between items-center">
            <h2 className="text-[11px] font-bold uppercase tracking-widest">Recent Orders</h2>
          </div>
          <div className="divide-y divide-black/5">
            {(stats?.recent_orders?.length ?? 0) === 0 ? (
              <div className="p-6 text-center">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest">No orders yet</p>
              </div>
            ) : (
              stats?.recent_orders?.map((order: Order) => (
                <div key={order.id} className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest">{order.id.slice(0, 8)}</p>
                    <p className="text-[9px] text-gray-400 uppercase tracking-widest mt-1">{order.customer_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-serif">${Number(order.total).toFixed(2)}</p>
                    <span className={`text-[8px] px-2 py-0.5 uppercase tracking-[0.2em] font-bold ${
                      order.status === 'delivered' || order.status === 'shipped'
                        ? 'bg-green-50 text-green-600'
                        : order.status === 'cancelled'
                        ? 'bg-red-50 text-red-600'
                        : 'bg-orange-50 text-orange-600'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-black/5 shadow-sm p-8 text-center">
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-300 mb-6 block">Revenue</span>
            <h3 className="text-3xl font-serif uppercase tracking-tight mb-2">
              ${((stats?.total_revenue ?? 0)).toLocaleString()}
            </h3>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest">
              Total Revenue (All Time)
            </p>
          </div>

          {stats?.orders_by_status && stats.orders_by_status.length > 0 && (
            <div className="bg-white border border-black/5 shadow-sm p-8">
              <h3 className="text-[11px] font-bold uppercase tracking-widest mb-6">Orders by Status</h3>
              <div className="space-y-3">
                {stats.orders_by_status.map((s) => (
                  <div key={s.status} className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-widest text-gray-500">{s.status}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-32 h-1.5 bg-gray-100">
                        <div
                          className="h-full bg-black transition-all"
                          style={{ width: `${(s.count / Math.max(...stats.orders_by_status.map(x => x.count))) * 100}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-bold w-6 text-right">{s.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border border-black/5 shadow-sm p-8">
        <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-300 mb-6 block">System</span>
        <h3 className="text-2xl font-serif uppercase tracking-tight mb-4">System Operational</h3>
        <p className="text-[10px] text-gray-400 uppercase tracking-widest leading-loose">
          All modules are running correctly. Database connected via Supabase.
        </p>
        <div className="w-px h-12 bg-black mx-auto mt-8"></div>
      </div>
    </div>
  );
}
