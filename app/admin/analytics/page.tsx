'use client';

import { useEffect, useState } from 'react';
import type { DashboardStats } from '@/lib/types';

export default function AdminAnalytics() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then((r) => r.json())
      .then((d) => setStats(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-white border border-black/5 shadow-sm p-12 text-center">
        <p className="text-[10px] uppercase tracking-widest text-gray-400">Failed to load analytics</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-8 border border-black/5 shadow-sm">
          <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-2 font-bold">Total Revenue</p>
          <p className="text-3xl font-serif">₹{stats.total_revenue.toLocaleString()}</p>
        </div>
        <div className="bg-white p-8 border border-black/5 shadow-sm">
          <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-2 font-bold">Total Orders</p>
          <p className="text-3xl font-serif">{stats.total_orders}</p>
        </div>
        <div className="bg-white p-8 border border-black/5 shadow-sm">
          <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-2 font-bold">Products</p>
          <p className="text-3xl font-serif">{stats.total_products}</p>
        </div>
        <div className="bg-white p-8 border border-black/5 shadow-sm">
          <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-2 font-bold">Pending Orders</p>
          <p className="text-3xl font-serif">{stats.pending_orders}</p>
        </div>
      </div>

      {/* Revenue by Month */}
      {stats.revenue_by_month.length > 0 && (
        <div className="bg-white border border-black/5 shadow-sm p-8">
          <h2 className="text-[11px] font-bold uppercase tracking-widest mb-8">Revenue by Month</h2>
          <div className="space-y-3">
            {stats.revenue_by_month.map((m) => {
              const maxRevenue = Math.max(...stats.revenue_by_month.map(x => x.revenue));
              return (
                <div key={m.month} className="flex items-center gap-6">
                  <span className="text-[10px] uppercase tracking-widest text-gray-500 w-20 flex-shrink-0">{m.month}</span>
                  <div className="flex-grow h-8 bg-gray-50 relative">
                    <div
                      className="absolute inset-y-0 left-0 bg-black transition-all"
                      style={{ width: `${(m.revenue / maxRevenue) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-serif w-24 text-right">₹{m.revenue.toFixed(0)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Orders by Status */}
      {stats.orders_by_status.length > 0 && (
        <div className="bg-white border border-black/5 shadow-sm p-8">
          <h2 className="text-[11px] font-bold uppercase tracking-widest mb-6">Orders by Status</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {stats.orders_by_status.map((s) => (
              <div key={s.status} className="p-6 bg-gray-50 text-center">
                <p className="text-2xl font-serif mb-2">{s.count}</p>
                <p className="text-[9px] uppercase tracking-widest text-gray-500 font-bold">{s.status}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Products */}
      {stats.top_products.length > 0 && (
        <div className="bg-white border border-black/5 shadow-sm p-8">
          <h2 className="text-[11px] font-bold uppercase tracking-widest mb-8">Top Products by Revenue</h2>
          <div className="space-y-6">
            {stats.top_products.map((p, i) => (
              <div key={p.name} className="flex items-center justify-between pb-4 border-b border-black/5 last:border-0">
                <div className="flex items-center gap-6">
                  <span className="text-[10px] font-bold text-gray-300 w-4">{i + 1}</span>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest">{p.name}</p>
                    <p className="text-[9px] text-gray-400 uppercase tracking-widest mt-0.5">{p.sold} units sold</p>
                  </div>
                </div>
                <p className="text-sm font-serif">₹{p.revenue.toFixed(0)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Low Stock Warning */}
      {(stats.low_stock_count ?? 0) > 0 && (
        <div className="bg-orange-50 border border-orange-200 shadow-sm p-8 text-center">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-orange-600 mb-2">Low Stock Alert</h2>
          <p className="text-2xl font-serif text-orange-700">{stats.low_stock_count}</p>
          <p className="text-[9px] uppercase tracking-widest text-orange-500 mt-1">Products need restocking</p>
        </div>
      )}
    </div>
  );
}
