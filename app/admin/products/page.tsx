'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/types';
import { isSoldOut, isLowStock as lowStockRule } from '@/lib/stock';
import {
  api, Badge, Button, Card, Drawer, EmptyState, Field, ImageListField, inr, Input, ListField, PageHeader, SearchInput, Select, Skeleton, Tabs, Textarea, Toggle, useToast,
} from '@/components/admin/ui';

type Filter = 'all' | 'low' | 'new' | 'trending' | 'bealuxe';

const EMPTY: Partial<Product> = {
  name: '', price: 0, category: '', description: '', fabric: '', images: [], highlights: [], care: [],
  colors: ['Black'], sizes: ['XS', 'S', 'M', 'L', 'XL'], stock: 0, low_stock_threshold: 5, out_of_stock_threshold: 0,
  is_new_arrival: true, is_trending: false, is_essential: false,
};

export default function ProductsPage() {
  const toast = useToast();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [draft, setDraft] = useState<Partial<Product> | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => setProducts(await api<Product[]>('/api/admin/products')), []);

  useEffect(() => {
    load().catch((e) => toast(e.message, 'error'));
    if (new URLSearchParams(window.location.search).get('new')) setDraft({ ...EMPTY });
  }, [load, toast]);

  const categories = useMemo(() => Array.from(new Set((products || []).map((p) => p.category))).sort(), [products]);
  const isLow = (p: Product) => isSoldOut(p) || lowStockRule(p);
  const counts = {
    all: products?.length || 0,
    low: products?.filter(isLow).length || 0,
    new: products?.filter((p) => p.is_new_arrival).length || 0,
    trending: products?.filter((p) => p.is_trending).length || 0,
    bealuxe: products?.filter((p) => p.is_essential).length || 0,
  };

  const visible = (products || []).filter((p) => {
    if (search && !`${p.name} ${p.category} ${p.fabric}`.toLowerCase().includes(search.toLowerCase())) return false;
    if (category && p.category !== category) return false;
    if (filter === 'low') return isLow(p);
    if (filter === 'new') return p.is_new_arrival;
    if (filter === 'trending') return p.is_trending;
    if (filter === 'bealuxe') return p.is_essential;
    return true;
  });

  const save = async () => {
    if (!draft) return;
    if (!draft.name?.trim() || !draft.category?.trim() || !(Number(draft.price) > 0)) {
      toast('Name, category and a price above ₹0 are required', 'error');
      return;
    }
    setSaving(true);
    try {
      const body = { ...draft, price: Number(draft.price), stock: Number(draft.stock), low_stock_threshold: Number(draft.low_stock_threshold) };
      if (draft.id) await api(`/api/admin/products/${draft.id}`, { method: 'PUT', json: body });
      else await api('/api/admin/products', { method: 'POST', json: body });
      toast(draft.id ? 'Product saved' : 'Product created');
      setDraft(null);
      await load();
    } catch (e) { toast(e instanceof Error ? e.message : 'Save failed', 'error'); }
    finally { setSaving(false); }
  };

  const remove = async (p: Partial<Product>) => {
    if (!p.id || !confirm(`Delete “${p.name}”? It will disappear from the store immediately.`)) return;
    try {
      await api(`/api/admin/products/${p.id}`, { method: 'DELETE' });
      toast('Product deleted');
      setDraft(null);
      await load();
    } catch (e) { toast(e instanceof Error ? e.message : 'Delete failed', 'error'); }
  };

  const duplicate = (p: Product) => {
    const { id: _id, created_at: _c, updated_at: _u, ...rest } = p; // eslint-disable-line @typescript-eslint/no-unused-vars
    setDraft({ ...rest, name: `${p.name} (Copy)` });
  };

  const set = <K extends keyof Product>(key: K, value: Product[K]) => draft && setDraft({ ...draft, [key]: value });

  return (
    <div>
      <PageHeader
        eyebrow="Store"
        title="Products"
        description="Your catalogue. Images, sizes, stock and where each piece appears on the site."
        actions={<Button onClick={() => setDraft({ ...EMPTY })}>+ Add Product</Button>}
      />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4">
        <Tabs<Filter> value={filter} onChange={setFilter} options={[
          { value: 'all', label: 'All', count: counts.all },
          { value: 'low', label: 'Low Stock', count: counts.low },
          { value: 'new', label: 'New', count: counts.new },
          { value: 'trending', label: 'Trending', count: counts.trending },
          { value: 'bealuxe', label: 'Bealuxe', count: counts.bealuxe },
        ]} />
        <div className="flex gap-2">
          <Select value={category} onChange={(e) => setCategory(e.target.value)} className="w-40" options={[{ value: '', label: 'All categories' }, ...categories.map((c) => ({ value: c, label: c }))]} />
          <SearchInput value={search} onChange={setSearch} placeholder="Search products" />
        </div>
      </div>

      <Card padded={false}>
        {!products ? (
          <div className="p-5 space-y-3">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-14" />)}</div>
        ) : visible.length === 0 ? (
          <EmptyState title="No products found" text="Try another filter, or add your first product." action={<Button onClick={() => setDraft({ ...EMPTY })}>+ Add Product</Button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[720px]">
              <thead>
                <tr className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400 border-b border-black/10">
                  <th className="px-5 py-3 font-bold">Product</th><th className="px-5 py-3 font-bold">Category</th>
                  <th className="px-5 py-3 font-bold text-right">Price</th><th className="px-5 py-3 font-bold text-right">Stock</th>
                  <th className="px-5 py-3 font-bold">Shown In</th><th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {visible.map((p) => (
                  <tr key={p.id} className="border-b border-black/5 last:border-0 hover:bg-gray-50 cursor-pointer" onClick={() => setDraft({ ...p })}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-12 bg-gray-50 shrink-0 overflow-hidden">{p.images?.[0] && <Image src={p.images[0]} alt="" fill className="object-cover" unoptimized />}</div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold truncate">{p.name}</p>
                          <p className="text-[10px] text-gray-400 truncate">{p.colors?.join(', ')} · {p.sizes?.length} sizes</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-xs">{p.category}</td>
                    <td className="px-5 py-3 text-xs text-right tabular-nums font-semibold">{inr(p.price)}</td>
                    <td className="px-5 py-3 text-right">
                      <span className={`text-xs tabular-nums ${isSoldOut(p) ? 'font-bold' : isLow(p) ? 'font-semibold' : ''}`}>{p.stock}</span>
                      {isSoldOut(p) ? <span className="block text-[9px] font-bold uppercase tracking-[0.15em]">Sold out</span> : isLow(p) && <span className="block text-[9px] uppercase tracking-[0.15em] text-gray-500">Low</span>}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-1">
                        {p.is_new_arrival && <Badge>New</Badge>}
                        {p.is_trending && <Badge>Trending</Badge>}
                        {p.is_essential && <Badge>Bealuxe</Badge>}
                        {!p.is_new_arrival && !p.is_trending && !p.is_essential && <span className="text-[10px] text-gray-300">Shop only</span>}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => duplicate(p)} className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-400 hover:text-black mr-4">Duplicate</button>
                      <button onClick={() => setDraft({ ...p })} className="text-[9px] font-bold uppercase tracking-[0.15em] hover:opacity-50">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Drawer
        open={!!draft}
        onClose={() => setDraft(null)}
        width="max-w-2xl"
        title={draft?.id ? draft.name || 'Edit Product' : 'New Product'}
        subtitle={draft?.id ? `Updated ${draft.updated_at ? new Date(draft.updated_at).toLocaleDateString('en-IN') : ''}` : 'Add to catalogue'}
        footer={
          <>
            {draft?.id && <Button variant="danger" className="mr-auto" onClick={() => remove(draft)}>Delete</Button>}
            {draft?.id && <Link href={`/product/${draft.id}`} target="_blank"><Button variant="ghost">View ↗</Button></Link>}
            <Button variant="ghost" onClick={() => setDraft(null)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? 'Saving…' : draft?.id ? 'Save Changes' : 'Create Product'}</Button>
          </>
        }
      >
        {draft && (
          <div className="space-y-8">
            <section className="space-y-4">
              <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-gray-400">Basics</p>
              <Field label="Name"><Input value={draft.name || ''} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Structured Cotton Shirt" /></Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Price (₹)"><Input type="number" min={0} value={draft.price ?? ''} onChange={(e) => set('price', Number(e.target.value))} /></Field>
                <Field label="Category" hint="Pick or type a new one">
                  <Input list="categories" value={draft.category || ''} onChange={(e) => set('category', e.target.value)} placeholder="Tops" />
                  <datalist id="categories">{categories.map((c) => <option key={c} value={c} />)}</datalist>
                </Field>
              </div>
              <Field label="Description" hint="Each sentence becomes a bullet on the product page"><Textarea rows={4} value={draft.description || ''} onChange={(e) => set('description', e.target.value)} /></Field>
            </section>

            <section className="space-y-4">
              <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-gray-400">Media</p>
              <ImageListField value={draft.images || []} onChange={(v) => set('images', v)} />
            </section>

            <section className="space-y-4">
              <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-gray-400">Variants</p>
              <ListField label="Sizes" value={draft.sizes || []} onChange={(v) => set('sizes', v)} placeholder="XS, S, M — comma or Enter" />
              <ListField label="Colours" value={draft.colors || []} onChange={(v) => set('colors', v)} placeholder="Black, Ivory…" hint="Known names (Black, White, Ivory, Navy, Tan, Grey…) get a matching swatch" />
            </section>

            <section className="space-y-4">
              <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-gray-400">Details</p>
              <Field label="Fabric"><Input value={draft.fabric || ''} onChange={(e) => set('fabric', e.target.value)} placeholder="100% Cotton" /></Field>
              <ListField label="Highlights" value={draft.highlights || []} onChange={(v) => set('highlights', v)} placeholder="Add a highlight and press Enter" />
              <ListField label="Care" value={draft.care || []} onChange={(v) => set('care', v)} placeholder="Machine wash cold…" />
            </section>

            <section className="space-y-4">
              <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-gray-400">Inventory</p>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Stock"><Input type="number" min={0} value={draft.stock ?? 0} onChange={(e) => set('stock', Number(e.target.value))} /></Field>
                <Field label="Low-stock alert at" hint="Shows “Few left” when sellable units are at or below this"><Input type="number" min={0} value={draft.low_stock_threshold ?? 5} onChange={(e) => set('low_stock_threshold', Number(e.target.value))} /></Field>
              </div>
              <Field label="Mark sold out at" hint={`Product shows “Sold out” once stock is at or below this. 0 = sell every unit. Sellable now: ${Math.max(0, (draft.stock ?? 0) - (draft.out_of_stock_threshold ?? 0))}`}>
                <Input type="number" min={0} value={draft.out_of_stock_threshold ?? 0} onChange={(e) => set('out_of_stock_threshold', Number(e.target.value))} />
              </Field>
            </section>

            <section className="space-y-4">
              <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-gray-400">Merchandising</p>
              <div className="flex flex-col gap-4 border border-black/10 p-4">
                <Toggle checked={!!draft.is_new_arrival} onChange={(v) => set('is_new_arrival', v)} label="New arrival — “New” tag" />
                <Toggle checked={!!draft.is_trending} onChange={(v) => set('is_trending', v)} label="Trending — leads the Trending page" />
                <Toggle checked={!!draft.is_essential} onChange={(v) => set('is_essential', v)} label="Bealuxe — shown on the Bealuxe page" />
              </div>
            </section>
          </div>
        )}
      </Drawer>
    </div>
  );
}
