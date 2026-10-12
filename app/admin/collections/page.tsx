'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Collection, Product } from '@/lib/types';
import { api, Button, Drawer, EmptyState, Field, ImageField, inr, Input, PageHeader, SearchInput, Skeleton, Textarea, useToast, Card } from '@/components/admin/ui';

const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

type Draft = Partial<Collection> & { productIds: string[]; originalIds: string[]; slugTouched?: boolean };

export default function CollectionsPage() {
  const toast = useToast();
  const [collections, setCollections] = useState<(Collection & { count: number })[] | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [productSearch, setProductSearch] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const [cols, prods] = await Promise.all([api<Collection[]>('/api/admin/collections'), api<Product[]>('/api/admin/products')]);
    const withCounts = await Promise.all(cols.map(async (c) => ({
      ...c, count: (await api<Product[]>(`/api/admin/collections/${c.id}/products`).catch(() => [])).length,
    })));
    setCollections(withCounts);
    setProducts(prods);
  }, []);

  useEffect(() => { load().catch((e) => toast(e.message, 'error')); }, [load, toast]);

  const open = async (c?: Collection) => {
    setProductSearch('');
    if (!c) { setDraft({ name: '', slug: '', description: '', image: '', productIds: [], originalIds: [] }); return; }
    const members = await api<Product[]>(`/api/admin/collections/${c.id}/products`).catch(() => []);
    const ids = members.map((p) => p.id);
    setDraft({ ...c, productIds: ids, originalIds: ids, slugTouched: true });
  };

  const save = async () => {
    if (!draft) return;
    if (!draft.name?.trim() || !draft.slug?.trim()) { toast('Name and URL slug are required', 'error'); return; }
    setSaving(true);
    try {
      const body = { name: draft.name, slug: slugify(draft.slug), description: draft.description, image: draft.image };
      const saved = draft.id
        ? await api<Collection>(`/api/admin/collections/${draft.id}`, { method: 'PUT', json: body })
        : await api<Collection>('/api/admin/collections', { method: 'POST', json: body });
      const id = saved.id || draft.id!;
      const added = draft.productIds.filter((p) => !draft.originalIds.includes(p));
      const removed = draft.originalIds.filter((p) => !draft.productIds.includes(p));
      await Promise.all([
        ...added.map((pid) => api(`/api/admin/collections/${id}/products`, { method: 'POST', json: { product_id: pid } })),
        ...removed.map((pid) => api(`/api/admin/collections/${id}/products?product_id=${pid}`, { method: 'DELETE' })),
      ]);
      toast(draft.id ? 'Collection saved' : 'Collection created');
      setDraft(null);
      await load();
    } catch (e) { toast(e instanceof Error ? e.message : 'Save failed', 'error'); }
    finally { setSaving(false); }
  };

  const remove = async () => {
    if (!draft?.id || !confirm(`Delete the “${draft.name}” collection? Products stay in the catalogue.`)) return;
    try {
      await api(`/api/admin/collections/${draft.id}`, { method: 'DELETE' });
      toast('Collection deleted');
      setDraft(null);
      await load();
    } catch (e) { toast(e instanceof Error ? e.message : 'Delete failed', 'error'); }
  };

  const toggleProduct = (id: string) => draft && setDraft({
    ...draft, productIds: draft.productIds.includes(id) ? draft.productIds.filter((p) => p !== id) : [...draft.productIds, id],
  });

  return (
    <div>
      <PageHeader
        eyebrow="Store"
        title="Collections"
        description="Curated edits shown on /collections. Each has its own page with the products you pick."
        actions={<Button onClick={() => open()}>+ New Collection</Button>}
      />

      {!collections ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-72" />)}</div>
      ) : collections.length === 0 ? (
        <Card><EmptyState title="No collections yet" action={<Button onClick={() => open()}>+ New Collection</Button>} /></Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {collections.map((c) => (
            <button key={c.id} onClick={() => open(c)} className="group text-left bg-white border border-black/10 hover:border-black transition-colors">
              <div className="relative aspect-[16/10] bg-gray-50 overflow-hidden">
                {c.image && <Image src={c.image} alt="" fill className="object-cover transition-transform duration-700 group-hover:scale-105" unoptimized />}
                <span className="absolute top-3 left-3 bg-white px-2 py-1 text-[9px] font-bold uppercase tracking-[0.15em]">{c.count} products</span>
              </div>
              <div className="p-4">
                <p className="text-sm font-semibold">{c.name}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">/collections/{c.slug}</p>
                {c.description && <p className="text-[11px] text-gray-500 mt-2 line-clamp-2">{c.description}</p>}
              </div>
            </button>
          ))}
        </div>
      )}

      <Drawer
        open={!!draft}
        onClose={() => setDraft(null)}
        width="max-w-2xl"
        title={draft?.id ? draft.name || 'Edit Collection' : 'New Collection'}
        subtitle={draft ? `${draft.productIds.length} products selected` : ''}
        footer={
          <>
            {draft?.id && <Button variant="danger" className="mr-auto" onClick={remove}>Delete</Button>}
            {draft?.id && <Link href={`/collections/${draft.slug}`} target="_blank"><Button variant="ghost">View ↗</Button></Link>}
            <Button variant="ghost" onClick={() => setDraft(null)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
          </>
        }
      >
        {draft && (
          <div className="space-y-6">
            <Field label="Name">
              <Input value={draft.name || ''} onChange={(e) => setDraft({ ...draft, name: e.target.value, slug: draft.slugTouched ? draft.slug : slugify(e.target.value) })} />
            </Field>
            <Field label="URL slug" hint={`Page address: /collections/${draft.slug || '…'}`}>
              <Input value={draft.slug || ''} onChange={(e) => setDraft({ ...draft, slug: slugify(e.target.value), slugTouched: true })} />
            </Field>
            <Field label="Description"><Textarea value={draft.description || ''} onChange={(e) => setDraft({ ...draft, description: e.target.value })} /></Field>
            <ImageField label="Cover image" value={draft.image || ''} onChange={(v) => setDraft({ ...draft, image: v })} />

            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.15em]">Products in this collection</span>
                <SearchInput value={productSearch} onChange={setProductSearch} placeholder="Filter products" />
              </div>
              <ul className="border border-black/10 divide-y divide-black/5 max-h-80 overflow-y-auto">
                {products
                  .filter((p) => !productSearch || p.name.toLowerCase().includes(productSearch.toLowerCase()))
                  .sort((a, b) => Number(draft.productIds.includes(b.id)) - Number(draft.productIds.includes(a.id)))
                  .map((p) => {
                    const checked = draft.productIds.includes(p.id);
                    return (
                      <li key={p.id}>
                        <label className={`flex items-center gap-3 px-3 py-2 cursor-pointer ${checked ? 'bg-gray-50' : 'hover:bg-gray-50'}`}>
                          <input type="checkbox" checked={checked} onChange={() => toggleProduct(p.id)} className="w-4 h-4 accent-black" />
                          <div className="relative w-8 h-10 bg-gray-100 shrink-0 overflow-hidden">{p.images?.[0] && <Image src={p.images[0]} alt="" fill className="object-cover" unoptimized />}</div>
                          <span className="flex-1 text-xs truncate">{p.name}</span>
                          <span className="text-[10px] text-gray-400">{p.category} · {inr(p.price)}</span>
                        </label>
                      </li>
                    );
                  })}
              </ul>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
