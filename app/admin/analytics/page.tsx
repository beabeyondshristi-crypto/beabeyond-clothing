'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Analytics, ProductMetric } from '@/lib/admin-db';
import { api, Button, Card, compact, delta, EmptyState, inr, PageHeader, shortDate, Skeleton, Stat, Tabs } from '@/components/admin/ui';
import { ColumnChart, Funnel, RankBars, TrendChart } from '@/components/admin/charts';

type Range = '7' | '30' | '90';
type SortKey = 'revenue' | 'units' | 'views' | 'likes' | 'carts' | 'conversion';

function ProductList({ items, metric, format }: { items: ProductMetric[]; metric: SortKey; format: (n: number) => string }) {
  const max = Math.max(...items.map((i) => i[metric]), 0) || 1;
  if (!items.length || max === 0) return <p className="text-xs text-gray-400 py-6 text-center">No data for this period</p>;
  return (
    <ol className="space-y-3">
      {items.map((p, i) => (
        <li key={p.id} className="flex items-center gap-3">
          <span className="w-4 text-[10px] text-gray-400 tabular-nums">{i + 1}</span>
          <div className="relative w-9 h-11 bg-gray-50 shrink-0 overflow-hidden">
            {p.image && <Image src={p.image} alt="" fill className="object-cover" unoptimized />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between gap-2 mb-1.5">
              <Link href={`/product/${p.id}`} target="_blank" className="text-[11px] font-medium truncate hover:underline">{p.name}</Link>
              <span className="text-[11px] font-semibold tabular-nums shrink-0">{format(p[metric])}</span>
            </div>
            <div className="h-1.5 bg-gray-100"><div className="h-1.5 bg-black" style={{ width: `${(p[metric] / max) * 100}%` }} /></div>
          </div>
        </li>
      ))}
    </ol>
  );
}

export default function AnalyticsPage() {
  const [range, setRange] = useState<Range>('30');
  const [data, setData] = useState<Analytics | null>(null);
  const [error, setError] = useState('');
  const [sort, setSort] = useState<SortKey>('revenue');
  const [showTrendTable, setShowTrendTable] = useState(false);

  useEffect(() => {
    api<Analytics>(`/api/admin/analytics?range=${range}`).then(setData).catch((e) => setError(e.message));
  }, [range]);

  const by = (key: SortKey) => (data ? [...data.products].sort((a, b) => b[key] - a[key]) : []);
  const tableRows = by(sort);

  const exportCsv = () => {
    if (!data) return;
    const header = ['Product', 'Category', 'Price', 'Units', 'Revenue', 'Views', 'Likes', 'Add to cart', 'Conversion %', 'Stock'];
    const rows = data.products.map((p) => [p.name, p.category, p.price, p.units, p.revenue.toFixed(2), p.views, p.likes, p.carts, p.conversion.toFixed(2), p.stock]);
    const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = Object.assign(document.createElement('a'), { href: url, download: `beabeyond-products-${range}d.csv` });
    a.click();
    URL.revokeObjectURL(url);
  };

  if (error) return <Card><EmptyState title="Couldn’t load analytics" text={error} /></Card>;
  const k = data?.kpis;
  const label = `vs prior ${range} days`;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Overview"
        title="Analytics"
        description="Sales, product interest and customer behaviour. Every figure compares with the previous period of the same length."
        actions={
          <>
            <Tabs<Range> value={range} onChange={(r) => { setData(null); setRange(r); }} options={[{ value: '7', label: '7 days' }, { value: '30', label: '30 days' }, { value: '90', label: '90 days' }]} />
            <Button variant="secondary" onClick={exportCsv} disabled={!data}>Export CSV</Button>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {k ? (
          <>
            <Stat label="Revenue" value={inr(k.revenue)} delta={delta(k.revenue, k.revenuePrev)} hint={label} />
            <Stat label="Orders" value={String(k.orders)} delta={delta(k.orders, k.ordersPrev)} hint={label} />
            <Stat label="Average order value" value={inr(k.aov)} delta={delta(k.aov, k.aovPrev)} hint={label} />
            <Stat label="Units sold" value={String(k.units)} delta={delta(k.units, k.unitsPrev)} hint={label} />
            <Stat label="Product views" value={compact(k.views)} delta={delta(k.views, k.viewsPrev)} hint={label} />
            <Stat label="Likes" value={compact(k.likes)} delta={delta(k.likes, k.likesPrev)} hint={label} />
            <Stat label="Conversion rate" value={`${k.conversion.toFixed(2)}%`} delta={delta(k.conversion, k.conversionPrev)} hint="orders ÷ views" />
            <Stat label="Discounts given" value={inr(data?.discounts.total || 0)} hint={`${data?.discounts.orders || 0} orders used a coupon`} />
          </>
        ) : Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-[118px]" />)}
      </div>

      <Card
        title="Revenue Trend"
        action={<button onClick={() => setShowTrendTable((v) => !v)} className="text-[10px] font-bold uppercase tracking-[0.15em] hover:opacity-50">{showTrendTable ? 'Show Chart' : 'Show Table'}</button>}
      >
        {!data ? <Skeleton className="h-[260px]" /> : showTrendTable ? (
          <div className="max-h-[260px] overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-white"><tr className="text-[9px] uppercase tracking-[0.2em] text-gray-400 border-b border-black/10"><th className="py-2 font-bold">Date</th><th className="py-2 font-bold text-right">Revenue</th><th className="py-2 font-bold text-right">Orders</th><th className="py-2 font-bold text-right">Views</th></tr></thead>
              <tbody>
                {[...data.daily].reverse().map((d) => (
                  <tr key={d.date} className="border-b border-black/5"><td className="py-2">{shortDate(d.date)}</td><td className="py-2 text-right tabular-nums">{inr(d.revenue)}</td><td className="py-2 text-right tabular-nums">{d.orders}</td><td className="py-2 text-right tabular-nums">{d.views}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <TrendChart height={260} ariaLabel={`Daily revenue, last ${range} days`} data={data.daily.map((d) => ({ label: shortDate(d.date), value: d.revenue }))} format={(n) => inr(n)} />
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Orders per Day">
          {data ? <ColumnChart ariaLabel="Orders per day" data={data.daily.map((d) => ({ label: shortDate(d.date), value: d.orders }))} format={(n) => `${Math.round(n)}`} /> : <Skeleton className="h-[200px]" />}
        </Card>
        <Card title="Product Views per Day">
          {data ? <ColumnChart ariaLabel="Product views per day" data={data.daily.map((d) => ({ label: shortDate(d.date), value: d.views }))} format={(n) => compact(n)} /> : <Skeleton className="h-[200px]" />}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Conversion Funnel">
          {data ? (
            <Funnel steps={[
              { label: 'Product views', value: data.funnel.views },
              { label: 'Added to cart', value: data.funnel.carts },
              { label: 'Orders placed', value: data.funnel.orders },
            ]} />
          ) : <Skeleton className="h-40" />}
        </Card>
        <Card title="Revenue by Category">
          {data ? <RankBars items={data.byCategory.map((c) => ({ label: c.category, value: c.revenue, sub: `${c.units} units` }))} format={(n) => inr(n)} /> : <Skeleton className="h-40" />}
        </Card>
        <Card title="Orders by Status">
          {data ? <RankBars items={data.byStatus.map((s) => ({ label: s.status.charAt(0).toUpperCase() + s.status.slice(1), value: s.count }))} format={(n) => `${n}`} /> : <Skeleton className="h-40" />}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Top Selling · Units">
          {data ? <ProductList items={by('units').slice(0, 5)} metric="units" format={(n) => `${n}`} /> : <Skeleton className="h-64" />}
        </Card>
        <Card title="Most Viewed">
          {data ? <ProductList items={by('views').slice(0, 5)} metric="views" format={(n) => compact(n)} /> : <Skeleton className="h-64" />}
        </Card>
        <Card title="Most Liked">
          {data ? <ProductList items={by('likes').slice(0, 5)} metric="likes" format={(n) => `${n}`} /> : <Skeleton className="h-64" />}
        </Card>
      </div>

      <Card title="Product Performance" padded={false} action={<span className="text-[10px] text-gray-400">Click a column to sort</span>}>
        {data ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[760px]">
              <thead>
                <tr className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400 border-b border-black/10">
                  <th className="px-5 py-3 font-bold">Product</th>
                  {([['units', 'Units'], ['revenue', 'Revenue'], ['views', 'Views'], ['likes', 'Likes'], ['carts', 'Add to cart'], ['conversion', 'Conv.']] as [SortKey, string][]).map(([key, text]) => (
                    <th key={key} className="px-5 py-3 font-bold text-right">
                      <button onClick={() => setSort(key)} className={`uppercase tracking-[0.2em] ${sort === key ? 'text-black' : 'hover:text-black'}`}>{text}{sort === key && ' ↓'}</button>
                    </th>
                  ))}
                  <th className="px-5 py-3 font-bold text-right">Stock</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((p) => (
                  <tr key={p.id} className="border-b border-black/5 last:border-0 hover:bg-gray-50 text-xs">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-8 h-10 bg-gray-50 shrink-0 overflow-hidden">{p.image && <Image src={p.image} alt="" fill className="object-cover" unoptimized />}</div>
                        <div className="min-w-0"><p className="font-medium truncate">{p.name}</p><p className="text-[10px] text-gray-400">{p.category} · {inr(p.price)}</p></div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums">{p.units}</td>
                    <td className="px-5 py-3 text-right tabular-nums font-semibold">{inr(p.revenue)}</td>
                    <td className="px-5 py-3 text-right tabular-nums">{p.views.toLocaleString('en-IN')}</td>
                    <td className="px-5 py-3 text-right tabular-nums">{p.likes}</td>
                    <td className="px-5 py-3 text-right tabular-nums">{p.carts}</td>
                    <td className="px-5 py-3 text-right tabular-nums">{p.conversion.toFixed(2)}%</td>
                    <td className={`px-5 py-3 text-right tabular-nums ${p.stock <= 5 ? 'font-bold' : 'text-gray-500'}`}>{p.stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <div className="p-5"><Skeleton className="h-64" /></div>}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Top Customers" padded={false}>
          {data && data.topCustomers.length ? (
            <ul>
              {data.topCustomers.map((c, i) => (
                <li key={c.email} className="flex items-center gap-4 px-5 py-3 border-b border-black/5 last:border-0">
                  <span className="w-4 text-[10px] text-gray-400 tabular-nums">{i + 1}</span>
                  <div className="w-8 h-8 bg-black text-white flex items-center justify-center text-[10px] font-bold uppercase shrink-0">{c.name?.charAt(0)}</div>
                  <div className="flex-1 min-w-0"><p className="text-xs font-medium truncate">{c.name}</p><p className="text-[10px] text-gray-400 truncate">{c.email}</p></div>
                  <div className="text-right"><p className="text-xs font-semibold tabular-nums">{inr(c.spent)}</p><p className="text-[10px] text-gray-400">{c.orders} order{c.orders === 1 ? '' : 's'}</p></div>
                </li>
              ))}
            </ul>
          ) : data ? <p className="text-xs text-gray-400 p-6 text-center">No orders in this period</p> : <div className="p-5"><Skeleton className="h-48" /></div>}
        </Card>
        <Card title="Stock Watch" padded={false} action={<Link href="/admin/inventory" className="text-[10px] font-bold uppercase tracking-[0.15em] hover:opacity-50">Inventory →</Link>}>
          {data && data.lowStock.length ? (
            <ul>
              {data.lowStock.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-4 px-5 py-3 border-b border-black/5 last:border-0">
                  <span className="text-xs truncate">{p.name}</span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] tabular-nums">{p.soldOut ? `Sold out · ${p.stock} held` : `${p.available} sellable · alert at ${p.threshold}`}</span>
                </li>
              ))}
            </ul>
          ) : data ? <p className="text-xs text-gray-400 p-6 text-center">All products are above their stock threshold</p> : <div className="p-5"><Skeleton className="h-48" /></div>}
        </Card>
      </div>
    </div>
  );
}
