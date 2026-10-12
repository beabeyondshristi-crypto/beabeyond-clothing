'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import type { Product } from '@/lib/types';
import { availableStock, isLowStock, isSoldOut, soldOutAt } from '@/lib/stock';
import { api, Button, Card, EmptyState, inr, Input, PageHeader, SearchInput, Skeleton, Stat, Tabs, useToast } from '@/components/admin/ui';

type Filter = 'all' | 'low' | 'out';

export default function InventoryPage() {
  const toast = useToast();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const [thresholds, setThresholds] = useState<Record<string, string>>({});
  const [bulk, setBulk] = useState('0');
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => setProducts(await api<Product[]>('/api/admin/products')), []);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('filter') === 'low') setFilter('low');
    load().catch((e) => toast(e.message, 'error'));
  }, [load, toast]);

  const needsRestock = (p: Product) => isSoldOut(p) || isLowStock(p);
  const list = (products || []).filter((p) => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === 'low') return needsRestock(p);
    if (filter === 'out') return isSoldOut(p);
    return true;
  }).sort((a, b) => availableStock(a) - availableStock(b));

  const adjust = async (p: Product, change: number, reason: string) => {
    if (!change) return;
    if (p.stock + change < 0) { toast('Stock can’t go below zero', 'error'); return; }
    setBusy(p.id);
    try {
      await api('/api/admin/inventory', { method: 'POST', json: { product_id: p.id, change, reason } });
      setProducts((prev) => prev?.map((x) => (x.id === p.id ? { ...x, stock: x.stock + change } : x)) || null);
      setAmounts((a) => ({ ...a, [p.id]: '' }));
      toast(`${p.name}: ${change > 0 ? '+' : ''}${change} → ${p.stock + change}`);
    } catch (e) { toast(e instanceof Error ? e.message : 'Update failed', 'error'); }
    finally { setBusy(null); }
  };

  const saveThreshold = async (p: Product) => {
    const raw = thresholds[p.id];
    if (raw === undefined) return;
    const value = Math.max(0, Math.floor(Number(raw) || 0));
    setThresholds((t) => { const next = { ...t }; delete next[p.id]; return next; });
    if (value === soldOutAt(p)) return;
    try {
      await api(`/api/admin/products/${p.id}`, { method: 'PUT', json: { out_of_stock_threshold: value } });
      setProducts((prev) => prev?.map((x) => (x.id === p.id ? { ...x, out_of_stock_threshold: value } : x)) || null);
      toast(`${p.name}: sold out at ${value}`);
    } catch (e) { toast(e instanceof Error ? e.message : 'Update failed', 'error'); }
  };

  const applyBulk = async () => {
    const value = Math.max(0, Math.floor(Number(bulk) || 0));
    if (!confirm(`Mark every product sold out when its stock is at or below ${value}?`)) return;
    try {
      const { updated } = await api<{ updated: number }>('/api/admin/inventory', { method: 'PUT', json: { threshold: value } });
      setProducts((prev) => prev?.map((x) => ({ ...x, out_of_stock_threshold: value })) || null);
      toast(`Sold-out level set to ${value} for ${updated} products`);
    } catch (e) { toast(e instanceof Error ? e.message : 'Update failed', 'error'); }
  };

  const sellable = (products || []).reduce((n, p) => n + availableStock(p), 0);
  const held = (products || []).reduce((n, p) => n + Math.min(p.stock, soldOutAt(p)), 0);
  const value = (products || []).reduce((n, p) => n + p.stock * p.price, 0);

  return (
    <div>
      <PageHeader
        eyebrow="Store"
        title="Inventory"
        description="Stock goes down automatically with every order and comes back if an order is cancelled. Choose how low stock can go before a product shows as sold out."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {products ? (
          <>
            <Stat label="Sellable units" value={sellable.toLocaleString('en-IN')} hint={held ? `${held} held back` : undefined} />
            <Stat label="Stock value (retail)" value={inr(value)} />
            <Stat label="Low stock" value={String(products.filter(isLowStock).length)} hint="at or below alert level" />
            <Stat label="Sold out" value={String(products.filter(isSoldOut).length)} />
          </>
        ) : [0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-[118px]" />)}
      </div>

      <Card className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold">Sold-out level</p>
            <p className="text-[11px] text-gray-500 mt-1 max-w-xl">
              A product shows as <strong>Sold out</strong> (and can’t be bought) once its stock reaches this number. Use it to keep a few units back for exchanges or damages. 0 sells every unit.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 whitespace-nowrap">Sold out at ≤</span>
            <Input type="number" min={0} value={bulk} onChange={(e) => setBulk(e.target.value)} className="w-20" aria-label="Sold-out level for all products" />
            <Button variant="secondary" onClick={applyBulk}>Apply to All</Button>
          </div>
        </div>
      </Card>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4">
        <Tabs<Filter> value={filter} onChange={setFilter} options={[
          { value: 'all', label: 'All', count: products?.length },
          { value: 'low', label: 'Needs Restock', count: products?.filter(needsRestock).length },
          { value: 'out', label: 'Sold Out', count: products?.filter(isSoldOut).length },
        ]} />
        <SearchInput value={search} onChange={setSearch} placeholder="Search products" />
      </div>

      <Card padded={false}>
        {!products ? (
          <div className="p-5 space-y-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-14" />)}</div>
        ) : list.length === 0 ? (
          <EmptyState title="All stocked up" text="No products match this filter." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[900px]">
              <thead>
                <tr className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400 border-b border-black/10">
                  <th className="px-5 py-3 font-bold">Product</th><th className="px-5 py-3 font-bold">Status</th>
                  <th className="px-5 py-3 font-bold text-right">In Stock</th><th className="px-5 py-3 font-bold text-right">Sellable</th>
                  <th className="px-5 py-3 font-bold">Sold Out At</th><th className="px-5 py-3 font-bold">Quick Adjust</th><th className="px-5 py-3 font-bold">Custom</th>
                </tr>
              </thead>
              <tbody>
                {list.map((p) => {
                  const sellableUnits = availableStock(p);
                  const threshold = p.low_stock_threshold || 5;
                  const fill = Math.min(100, (sellableUnits / Math.max(threshold * 4, 1)) * 100);
                  const amount = Number(amounts[p.id] || 0);
                  return (
                    <tr key={p.id} className="border-b border-black/5 last:border-0 text-xs">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative w-9 h-11 bg-gray-50 shrink-0 overflow-hidden">{p.images?.[0] && <Image src={p.images[0]} alt="" fill className="object-cover" unoptimized />}</div>
                          <div className="min-w-0"><p className="font-semibold truncate">{p.name}</p><p className="text-[10px] text-gray-400">{p.category} · low alert at {threshold}</p></div>
                        </div>
                      </td>
                      <td className="px-5 py-3 w-36">
                        <div className="h-1.5 bg-gray-100"><div className={`h-1.5 ${isSoldOut(p) ? 'bg-gray-300' : 'bg-black'}`} style={{ width: `${fill}%` }} /></div>
                        <p className="text-[9px] font-bold uppercase tracking-[0.15em] mt-1.5 text-gray-500">{isSoldOut(p) ? 'Sold out' : isLowStock(p) ? 'Low' : 'Healthy'}</p>
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums text-gray-500">{p.stock}</td>
                      <td className="px-5 py-3 text-right text-base font-semibold tabular-nums">{sellableUnits}</td>
                      <td className="px-5 py-3">
                        <Input
                          type="number" min={0}
                          value={thresholds[p.id] ?? String(soldOutAt(p))}
                          onChange={(e) => setThresholds((t) => ({ ...t, [p.id]: e.target.value }))}
                          onBlur={() => saveThreshold(p)}
                          onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                          className="w-16 h-8"
                          aria-label={`Sold-out level for ${p.name}`}
                        />
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex">
                          {[-1, 1, 10].map((n, i) => (
                            <button key={n} disabled={busy === p.id || p.stock + n < 0} onClick={() => adjust(p, n, n > 0 ? 'Restock' : 'Manual correction')}
                              className={`w-10 h-8 border border-black/15 hover:border-black disabled:opacity-30 text-[11px] font-semibold ${i ? 'border-l-0' : ''}`}>
                              {n > 0 ? `+${n}` : n}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex gap-2">
                          <Input type="number" value={amounts[p.id] || ''} onChange={(e) => setAmounts((a) => ({ ...a, [p.id]: e.target.value }))} placeholder="±0" className="w-20 h-8" aria-label={`Adjust ${p.name}`} />
                          <Button size="sm" variant="secondary" disabled={!amount || busy === p.id} onClick={() => adjust(p, amount, amount > 0 ? 'Restock' : 'Stock correction')}>Apply</Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
