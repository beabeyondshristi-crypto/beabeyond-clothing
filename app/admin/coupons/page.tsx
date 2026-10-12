'use client';

import { useCallback, useEffect, useState } from 'react';
import type { CouponWithStats } from '@/lib/admin-db';
import { describeCoupon, normalizeCode, type Coupon } from '@/lib/coupons';
import { api, Badge, Button, Card, Drawer, EmptyState, Field, inr, Input, PageHeader, SearchInput, shortDate, Skeleton, Stat, Tabs, Textarea, Toggle, useToast } from '@/components/admin/ui';

type Filter = 'all' | 'active' | 'inactive';
type Draft = Partial<Coupon>;

const EMPTY: Draft = {
  code: '', description: '', discount_type: 'percent', discount_value: 10, min_order: 0, max_discount: null,
  starts_at: null, ends_at: null, usage_limit: null, once_per_customer: false, is_active: true,
};

// datetime-local <-> ISO helpers (inputs work in local time)
const toLocalInput = (iso: string | null | undefined) => {
  if (!iso) return '';
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};
const fromLocalInput = (v: string) => (v ? new Date(v).toISOString() : null);

function couponStatus(c: Coupon): { label: string; tone: 'solid' | 'outline' | 'muted' } {
  const now = Date.now();
  if (!c.is_active) return { label: 'Paused', tone: 'muted' };
  if (c.ends_at && new Date(c.ends_at).getTime() < now) return { label: 'Expired', tone: 'muted' };
  if (c.usage_limit !== null && c.used_count >= c.usage_limit) return { label: 'Used up', tone: 'muted' };
  if (c.starts_at && new Date(c.starts_at).getTime() > now) return { label: 'Scheduled', tone: 'outline' };
  return { label: 'Active', tone: 'solid' };
}

const randomCode = () => `BB${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

export default function CouponsPage() {
  const toast = useToast();
  const [coupons, setCoupons] = useState<CouponWithStats[] | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => setCoupons(await api<CouponWithStats[]>('/api/admin/coupons')), []);
  useEffect(() => { load().catch((e) => toast(e.message, 'error')); }, [load, toast]);

  const isLive = (c: Coupon) => couponStatus(c).label === 'Active';
  const list = (coupons || []).filter((c) => {
    if (search && !`${c.code} ${c.description}`.toLowerCase().includes(search.toLowerCase())) return false;
    if (filter === 'active') return isLive(c);
    if (filter === 'inactive') return !isLive(c);
    return true;
  });

  const save = async () => {
    if (!draft) return;
    if (!draft.code?.trim()) { toast('Enter a coupon code', 'error'); return; }
    if (!(Number(draft.discount_value) > 0)) { toast('Discount must be above 0', 'error'); return; }
    if (draft.starts_at && draft.ends_at && new Date(draft.ends_at) <= new Date(draft.starts_at)) { toast('End date must be after the start date', 'error'); return; }
    setSaving(true);
    try {
      const body = { ...draft, code: normalizeCode(draft.code) };
      if (draft.id) await api(`/api/admin/coupons/${draft.id}`, { method: 'PUT', json: body });
      else await api('/api/admin/coupons', { method: 'POST', json: body });
      toast(draft.id ? 'Coupon saved' : `Coupon ${body.code} created`);
      setDraft(null);
      await load();
    } catch (e) { toast(e instanceof Error ? e.message : 'Save failed', 'error'); }
    finally { setSaving(false); }
  };

  const toggle = async (c: CouponWithStats, active: boolean) => {
    try {
      await api(`/api/admin/coupons/${c.id}`, { method: 'PUT', json: { is_active: active } });
      toast(`${c.code} ${active ? 'activated' : 'paused'}`);
      await load();
    } catch (e) { toast(e instanceof Error ? e.message : 'Update failed', 'error'); }
  };

  const remove = async () => {
    if (!draft?.id || !confirm(`Delete ${draft.code}? Past orders keep their discount, but the code stops working.`)) return;
    try {
      await api(`/api/admin/coupons/${draft.id}`, { method: 'DELETE' });
      toast('Coupon deleted');
      setDraft(null);
      await load();
    } catch (e) { toast(e instanceof Error ? e.message : 'Delete failed', 'error'); }
  };

  const copy = (code: string) => { navigator.clipboard?.writeText(code); toast(`${code} copied`); };

  const totals = (coupons || []).reduce((acc, c) => ({ uses: acc.uses + c.orders, given: acc.given + c.discount_given, revenue: acc.revenue + c.revenue }), { uses: 0, given: 0, revenue: 0 });
  const set = <K extends keyof Coupon>(key: K, value: Coupon[K]) => draft && setDraft({ ...draft, [key]: value });

  return (
    <div>
      <PageHeader
        eyebrow="Store"
        title="Coupons"
        description="Discount codes customers enter at checkout. Every rule is checked again on the server when the order is placed."
        actions={<Button onClick={() => setDraft({ ...EMPTY, code: randomCode() })}>+ New Coupon</Button>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {coupons ? (
          <>
            <Stat label="Live coupons" value={String(coupons.filter(isLive).length)} hint={`${coupons.length} total`} />
            <Stat label="Redemptions" value={String(totals.uses)} />
            <Stat label="Discount given" value={inr(totals.given)} />
            <Stat label="Revenue with coupons" value={inr(totals.revenue)} />
          </>
        ) : [0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-[118px]" />)}
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4">
        <Tabs<Filter> value={filter} onChange={setFilter} options={[
          { value: 'all', label: 'All', count: coupons?.length },
          { value: 'active', label: 'Live', count: coupons?.filter(isLive).length },
          { value: 'inactive', label: 'Not Live', count: coupons?.filter((c) => !isLive(c)).length },
        ]} />
        <SearchInput value={search} onChange={setSearch} placeholder="Search codes" />
      </div>

      <Card padded={false}>
        {!coupons ? (
          <div className="p-5 space-y-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-14" />)}</div>
        ) : list.length === 0 ? (
          <EmptyState title="No coupons yet" text="Create a code and share it with customers." action={<Button onClick={() => setDraft({ ...EMPTY, code: randomCode() })}>+ New Coupon</Button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[860px]">
              <thead>
                <tr className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400 border-b border-black/10">
                  <th className="px-5 py-3 font-bold">Code</th><th className="px-5 py-3 font-bold">Offer</th><th className="px-5 py-3 font-bold">Usage</th>
                  <th className="px-5 py-3 font-bold">Valid</th><th className="px-5 py-3 font-bold text-right">Discount Given</th><th className="px-5 py-3 font-bold">Status</th><th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {list.map((c) => {
                  const status = couponStatus(c);
                  return (
                    <tr key={c.id} className="border-b border-black/5 last:border-0 text-xs hover:bg-gray-50">
                      <td className="px-5 py-3">
                        <button onClick={() => copy(c.code)} className="font-mono font-semibold tracking-wider hover:underline" title="Copy code">{c.code}</button>
                        {c.description && <p className="text-[10px] text-gray-400 truncate max-w-[200px]">{c.description}</p>}
                      </td>
                      <td className="px-5 py-3">
                        <p>{describeCoupon(c)}</p>
                        {c.once_per_customer && <p className="text-[10px] text-gray-400">Once per customer</p>}
                      </td>
                      <td className="px-5 py-3 w-40">
                        <p className="tabular-nums">{c.used_count}{c.usage_limit !== null ? ` / ${c.usage_limit}` : ''} <span className="text-gray-400">uses</span></p>
                        {c.usage_limit !== null && (
                          <div className="h-1 bg-gray-100 mt-1.5"><div className="h-1 bg-black" style={{ width: `${Math.min(100, (c.used_count / Math.max(1, c.usage_limit)) * 100)}%` }} /></div>
                        )}
                      </td>
                      <td className="px-5 py-3 text-gray-500 whitespace-nowrap">
                        {c.starts_at || c.ends_at ? `${c.starts_at ? shortDate(c.starts_at) : 'Now'} – ${c.ends_at ? shortDate(c.ends_at) : 'No end'}` : 'Always'}
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums font-semibold">{inr(c.discount_given)}<p className="text-[10px] text-gray-400 font-normal">{c.orders} orders</p></td>
                      <td className="px-5 py-3"><Badge tone={status.tone}>{status.label}</Badge></td>
                      <td className="px-5 py-3 text-right whitespace-nowrap">
                        <span className="inline-flex items-center gap-4">
                          <Toggle checked={c.is_active} onChange={(v) => toggle(c, v)} />
                          <button onClick={() => setDraft({ ...c })} className="text-[9px] font-bold uppercase tracking-[0.15em] hover:opacity-50">Edit</button>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Drawer
        open={!!draft}
        onClose={() => setDraft(null)}
        title={draft?.id ? draft.code || 'Edit Coupon' : 'New Coupon'}
        subtitle={draft?.id ? `Used ${draft.used_count} times` : 'Create a discount code'}
        footer={
          <>
            {draft?.id && <Button variant="danger" className="mr-auto" onClick={remove}>Delete</Button>}
            <Button variant="ghost" onClick={() => setDraft(null)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? 'Saving…' : draft?.id ? 'Save Changes' : 'Create Coupon'}</Button>
          </>
        }
      >
        {draft && (
          <div className="space-y-6">
            <div className="bg-black text-white p-5">
              <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/50 mb-2">Customer sees</p>
              <p className="font-mono text-2xl tracking-widest">{normalizeCode(draft.code || '') || 'CODE'}</p>
              <p className="text-[11px] text-white/80 mt-2">{describeCoupon({ discount_type: draft.discount_type || 'percent', discount_value: Number(draft.discount_value) || 0, min_order: Number(draft.min_order) || 0, max_discount: draft.max_discount ?? null })}</p>
            </div>

            <Field label="Code" hint="Letters, numbers, - and _. Customers type this at checkout.">
              <div className="flex gap-2">
                <Input value={draft.code || ''} onChange={(e) => set('code', e.target.value.toUpperCase().replace(/\s+/g, ''))} className="font-mono tracking-wider" />
                <Button type="button" variant="secondary" onClick={() => set('code', randomCode())}>Generate</Button>
              </div>
            </Field>
            <Field label="Internal note"><Textarea rows={2} value={draft.description || ''} onChange={(e) => set('description', e.target.value)} placeholder="e.g. Instagram giveaway, Diwali sale" /></Field>

            <div>
              <span className="block text-[10px] font-bold uppercase tracking-[0.15em] mb-2">Discount</span>
              <Tabs<'percent' | 'fixed'> value={draft.discount_type || 'percent'} onChange={(v) => setDraft({ ...draft, discount_type: v, max_discount: v === 'fixed' ? null : draft.max_discount })} options={[{ value: 'percent', label: 'Percentage %' }, { value: 'fixed', label: 'Flat amount ₹' }]} />
              <div className="grid grid-cols-2 gap-4 mt-4">
                <Field label={draft.discount_type === 'percent' ? 'Percent off' : 'Amount off (₹)'}>
                  <Input type="number" min={1} max={draft.discount_type === 'percent' ? 100 : undefined} value={draft.discount_value ?? ''} onChange={(e) => set('discount_value', Number(e.target.value))} />
                </Field>
                {draft.discount_type === 'percent' && (
                  <Field label="Max discount (₹)" hint="Leave empty for no cap">
                    <Input type="number" min={0} value={draft.max_discount ?? ''} onChange={(e) => set('max_discount', e.target.value ? Number(e.target.value) : null)} />
                  </Field>
                )}
              </div>
            </div>

            <Field label="Minimum order (₹)" hint="Cart subtotal needed before the code works. 0 = any order.">
              <Input type="number" min={0} value={draft.min_order ?? 0} onChange={(e) => set('min_order', Number(e.target.value))} />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Starts" hint="Empty = immediately"><Input type="datetime-local" value={toLocalInput(draft.starts_at)} onChange={(e) => set('starts_at', fromLocalInput(e.target.value))} /></Field>
              <Field label="Ends" hint="Empty = never expires"><Input type="datetime-local" value={toLocalInput(draft.ends_at)} onChange={(e) => set('ends_at', fromLocalInput(e.target.value))} /></Field>
            </div>

            <Field label="Total uses allowed" hint="Across all customers. Empty = unlimited.">
              <Input type="number" min={1} value={draft.usage_limit ?? ''} onChange={(e) => set('usage_limit', e.target.value ? Number(e.target.value) : null)} />
            </Field>

            <div className="flex flex-col gap-4 border border-black/10 p-4">
              <Toggle checked={!!draft.once_per_customer} onChange={(v) => set('once_per_customer', v)} label="One use per customer" />
              <Toggle checked={!!draft.is_active} onChange={(v) => set('is_active', v)} label="Active" />
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
