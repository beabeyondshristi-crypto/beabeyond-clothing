'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { HomepageSection } from '@/lib/types';
import { api, Badge, Button, Card, Drawer, EmptyState, Field, ImageField, Input, PageHeader, Select, Skeleton, Textarea, Toggle, useToast } from '@/components/admin/ui';

type SectionType = HomepageSection['section_type'];

const PAGES: { key: string; name: string; url: string; types: SectionType[]; note: string }[] = [
  { key: 'home', name: 'Homepage', url: '/', types: ['hero_slide', 'editorial', 'category_spotlight', 'newsletter'], note: 'Hero slider, editorial story, category spotlights and newsletter.' },
  { key: 'new-arrivals', name: 'New Arrivals', url: '/new-arrivals', types: ['hero', 'content'], note: 'Full-screen hero and the concept text block.' },
  { key: 'bealuxe', name: 'Bealuxe', url: '/bealuxe', types: ['content'], note: 'The sticky story panel beside the product grid.' },
  { key: 'trending', name: 'Trending', url: '/trending', types: ['hero'], note: 'The black “Most Wanted” banner.' },
  { key: 'collections', name: 'Collections', url: '/collections', types: ['hero'], note: 'Title and intro above the collection grid.' },
  { key: 'about', name: 'About', url: '/about', types: ['hero', 'content'], note: 'Page intro and the philosophy block.' },
];

const TYPE_LABEL: Record<string, string> = {
  hero_slide: 'Hero Slide', editorial: 'Editorial', category_spotlight: 'Spotlight', newsletter: 'Newsletter',
  hero: 'Hero', content: 'Content Block', feature: 'Feature',
};

type FieldKey = 'badge' | 'title' | 'subtitle' | 'description' | 'image_url' | 'link_text' | 'link_url' | 'layout';
interface FieldDef { key: FieldKey; label: string; hint?: string; long?: boolean }

// Which inputs each section shows, with labels matching how the storefront uses them
function fieldsFor(page: string, type: SectionType): FieldDef[] {
  const link: FieldDef[] = [{ key: 'link_text', label: 'Button text' }, { key: 'link_url', label: 'Button link', hint: 'e.g. /shop or /collections/bealuxe' }];
  switch (type) {
    case 'hero_slide':
      return [{ key: 'badge', label: 'Collection label', hint: 'Small text above the title, e.g. Collection 01' }, { key: 'title', label: 'Title' }, { key: 'subtitle', label: 'Tagline', long: true }, { key: 'image_url', label: 'Image' }, { key: 'layout', label: 'Layout' }, ...link];
    case 'editorial':
      return [{ key: 'badge', label: 'Label' }, { key: 'title', label: 'Title' }, { key: 'subtitle', label: 'Text', long: true }, { key: 'description', label: 'Extra text', long: true }, { key: 'image_url', label: 'Image' }, ...link];
    case 'category_spotlight':
      return [{ key: 'title', label: 'Title' }, { key: 'image_url', label: 'Image' }, ...link];
    case 'newsletter':
      return [{ key: 'title', label: 'Title' }, { key: 'subtitle', label: 'Text', long: true }];
    case 'hero':
      if (page === 'trending' || page === 'about') return [{ key: 'description', label: 'Eyebrow label' }, { key: 'title', label: 'Title' }, { key: 'subtitle', label: 'Intro text', long: true }];
      if (page === 'collections') return [{ key: 'title', label: 'Title' }, { key: 'subtitle', label: 'Intro text', long: true }];
      return [{ key: 'badge', label: 'Label' }, { key: 'title', label: 'Title' }, { key: 'subtitle', label: 'Intro text', long: true }, { key: 'image_url', label: 'Image' }, { key: 'link_text', label: 'Button text' }];
    case 'content':
      return [{ key: 'badge', label: 'Label' }, { key: 'title', label: 'Title' }, { key: 'subtitle', label: 'Body text', long: true }, ...(page === 'new-arrivals' ? [] : [{ key: 'image_url' as const, label: 'Image' }]), ...link];
    default:
      return [{ key: 'title', label: 'Title' }, { key: 'subtitle', label: 'Text', long: true }, { key: 'image_url', label: 'Image' }, ...link];
  }
}

type Draft = Partial<HomepageSection> & { settings: Record<string, unknown> };

export default function ContentPages() {
  const toast = useToast();
  const [page, setPage] = useState(PAGES[0].key);
  const [sections, setSections] = useState<HomepageSection[] | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const current = PAGES.find((p) => p.key === page)!;

  const load = useCallback(async () => {
    const all = await api<HomepageSection[]>('/api/admin/homepage-sections');
    setCounts(all.reduce<Record<string, number>>((acc, s) => { acc[s.page || 'home'] = (acc[s.page || 'home'] || 0) + 1; return acc; }, {}));
    setSections(all.filter((s) => (s.page || 'home') === page).sort((a, b) => a.sort_order - b.sort_order));
  }, [page]);

  useEffect(() => {
    load().catch((e) => toast(e.message, 'error'));
  }, [load, toast]);

  const update = async (id: string, patch: Partial<HomepageSection>, message?: string) => {
    await api(`/api/admin/homepage-sections/${id}`, { method: 'PUT', json: patch });
    if (message) toast(message);
    await load();
  };

  const move = async (index: number, dir: -1 | 1) => {
    if (!sections) return;
    const a = sections[index];
    const b = sections[index + dir];
    if (!b) return;
    try {
      // Re-number so equal sort_orders can't get stuck
      await Promise.all(sections.map((s, i) => {
        const order = s.id === a.id ? index + dir + 1 : s.id === b.id ? index + 1 : i + 1;
        return order !== s.sort_order ? api(`/api/admin/homepage-sections/${s.id}`, { method: 'PUT', json: { sort_order: order } }) : null;
      }));
      await load();
    } catch (e) { toast(e instanceof Error ? e.message : 'Reorder failed', 'error'); }
  };

  const remove = async (s: HomepageSection) => {
    if (!confirm(`Delete “${s.title || TYPE_LABEL[s.section_type]}”? This can’t be undone.`)) return;
    try {
      await api(`/api/admin/homepage-sections/${s.id}`, { method: 'DELETE' });
      toast('Section deleted');
      await load();
    } catch (e) { toast(e instanceof Error ? e.message : 'Delete failed', 'error'); }
  };

  const openNew = (type: SectionType) => setDraft({
    page, section_type: type, title: '', subtitle: '', description: '', image_url: '', image_url_2: '', link_url: '', link_text: '',
    is_visible: true, sort_order: (sections?.length || 0) + 1, settings: type === 'hero_slide' ? { layout: 'split', theme: 'light' } : {},
  });

  const save = async () => {
    if (!draft) return;
    setSaving(true);
    try {
      if (draft.id) await api(`/api/admin/homepage-sections/${draft.id}`, { method: 'PUT', json: draft });
      else await api('/api/admin/homepage-sections', { method: 'POST', json: draft });
      toast(draft.id ? 'Section saved — live on the site' : 'Section added');
      setDraft(null);
      await load();
    } catch (e) { toast(e instanceof Error ? e.message : 'Save failed', 'error'); }
    finally { setSaving(false); }
  };

  const setField = (key: FieldKey, value: string) => {
    if (!draft) return;
    if (key === 'badge') setDraft({ ...draft, settings: { ...draft.settings, badge: value } });
    else if (key === 'layout') setDraft({ ...draft, settings: { ...draft.settings, layout: value, theme: value === 'split' ? 'light' : 'dark' } });
    else setDraft({ ...draft, [key]: value });
  };
  const getField = (key: FieldKey) => {
    if (!draft) return '';
    if (key === 'badge') return String(draft.settings?.badge || '');
    if (key === 'layout') return String(draft.settings?.layout || 'split');
    return String(draft[key] || '');
  };

  return (
    <div>
      <PageHeader
        eyebrow="Content"
        title="Pages"
        description="Edit the words, images and buttons on every storefront page. Changes go live as soon as you save."
        actions={<Link href={current.url} target="_blank"><Button variant="secondary">View {current.name} ↗</Button></Link>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
        <nav className="bg-white border border-black/10 h-max">
          {PAGES.map((p) => (
            <button
              key={p.key}
              onClick={() => { setPage(p.key); setSections(null); }}
              className={`w-full flex items-center justify-between px-4 py-3 text-left border-b border-black/5 last:border-0 transition-colors ${page === p.key ? 'bg-black text-white' : 'hover:bg-gray-50'}`}
            >
              <span className="text-[11px] font-bold uppercase tracking-[0.15em]">{p.name}</span>
              <span className={`text-[10px] tabular-nums ${page === p.key ? 'text-white/60' : 'text-gray-400'}`}>{counts[p.key] || 0}</span>
            </button>
          ))}
        </nav>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-black/10 px-5 py-4">
            <div>
              <p className="text-sm font-semibold">{current.name}</p>
              <p className="text-[11px] text-gray-500">{current.note}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {current.types.map((t) => (
                <Button key={t} size="sm" variant="secondary" onClick={() => openNew(t)}>+ {TYPE_LABEL[t]}</Button>
              ))}
            </div>
          </div>

          {!sections ? (
            [0, 1, 2].map((i) => <Skeleton key={i} className="h-28" />)
          ) : sections.length === 0 ? (
            <Card><EmptyState title="No sections yet" text="This page is using its built-in default content. Add a section to customise it." /></Card>
          ) : (
            sections.map((s, i) => (
              <div key={s.id} className={`bg-white border flex items-stretch transition-colors ${s.is_visible ? 'border-black/10' : 'border-dashed border-black/20'}`}>
                <div className="relative w-24 sm:w-32 shrink-0 bg-gray-50 border-r border-black/10">
                  {s.image_url ? (
                    <Image src={s.image_url} alt="" fill className={`object-cover ${s.is_visible ? '' : 'opacity-40 grayscale'}`} unoptimized />
                  ) : (
                    <span className="absolute inset-0 flex items-center justify-center text-[9px] uppercase tracking-widest text-gray-300">Text only</span>
                  )}
                </div>
                <div className="flex-1 min-w-0 p-4 flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge tone="outline">{TYPE_LABEL[s.section_type] || s.section_type}</Badge>
                      {!s.is_visible && <Badge tone="muted">Hidden</Badge>}
                      <span className="text-[10px] text-gray-300 tabular-nums">#{i + 1}</span>
                    </div>
                    <p className={`text-sm font-semibold truncate ${s.is_visible ? '' : 'text-gray-400'}`}>{s.title || <span className="text-gray-300">Untitled</span>}</p>
                    {s.subtitle && <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">{s.subtitle}</p>}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button size="sm" onClick={() => setDraft({ ...s, settings: { ...(s.settings || {}) } })}>Edit</Button>
                    <Toggle checked={s.is_visible} onChange={(v) => update(s.id, { is_visible: v }, v ? 'Section shown' : 'Section hidden').catch((e) => toast(e.message, 'error'))} label={s.is_visible ? 'Visible' : 'Hidden'} />
                    <div className="flex ml-auto">
                      <button onClick={() => move(i, -1)} disabled={i === 0} className="w-8 h-8 border border-black/15 hover:border-black disabled:opacity-30 text-xs" aria-label="Move up">↑</button>
                      <button onClick={() => move(i, 1)} disabled={i === sections.length - 1} className="w-8 h-8 border border-l-0 border-black/15 hover:border-black disabled:opacity-30 text-xs" aria-label="Move down">↓</button>
                      <button onClick={() => remove(s)} className="ml-2 h-8 px-3 border border-black/15 hover:border-black text-[9px] font-bold uppercase tracking-[0.15em]">Delete</button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Drawer
        open={!!draft}
        onClose={() => setDraft(null)}
        title={draft?.id ? `Edit ${TYPE_LABEL[draft.section_type || ''] || 'Section'}` : `New ${TYPE_LABEL[draft?.section_type || ''] || 'Section'}`}
        subtitle={`${current.name} page`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setDraft(null)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save & Publish'}</Button>
          </>
        }
      >
        {draft && (
          <div className="space-y-6">
            {/* Live preview */}
            <div className={`relative h-40 overflow-hidden border border-black/10 ${draft.image_url ? 'bg-black' : 'bg-gray-50'}`}>
              {draft.image_url && <Image src={draft.image_url} alt="" fill className="object-cover opacity-70" unoptimized />}
              <div className={`absolute inset-0 p-5 flex flex-col justify-end ${draft.image_url ? 'text-white' : 'text-black'}`}>
                {(getField('badge') || draft.description) && <span className="text-[8px] font-bold uppercase tracking-[0.3em] opacity-70 mb-1">{getField('badge') || draft.description}</span>}
                <span className="font-serif text-2xl uppercase tracking-tighter leading-none">{draft.title || 'Title'}</span>
                {draft.subtitle && <span className="text-[9px] uppercase tracking-widest opacity-80 mt-2 line-clamp-2">{draft.subtitle}</span>}
                {draft.link_text && <span className="mt-3 w-max border border-current px-3 py-1 text-[8px] font-bold uppercase tracking-[0.2em]">{draft.link_text}</span>}
              </div>
              <span className="absolute top-2 right-2 text-[8px] font-bold uppercase tracking-[0.2em] bg-white text-black px-1.5 py-0.5">Preview</span>
            </div>

            {fieldsFor(page, draft.section_type as SectionType).map((f) =>
              f.key === 'image_url' ? (
                <ImageField key={f.key} label={f.label} value={getField('image_url')} onChange={(v) => setField('image_url', v)} />
              ) : f.key === 'layout' ? (
                <Field key={f.key} label={f.label}>
                  <Select value={getField('layout')} onChange={(e) => setField('layout', e.target.value)} options={[
                    { value: 'split', label: 'Split — text left, image right' },
                    { value: 'fullscreen-center', label: 'Full image — centred text' },
                    { value: 'fullscreen-left', label: 'Full image — text bottom left' },
                  ]} />
                </Field>
              ) : (
                <Field key={f.key} label={f.label} hint={f.hint}>
                  {f.long ? <Textarea value={getField(f.key)} onChange={(e) => setField(f.key, e.target.value)} /> : <Input value={getField(f.key)} onChange={(e) => setField(f.key, e.target.value)} />}
                </Field>
              ),
            )}

            <div className="pt-2 border-t border-black/10">
              <Toggle checked={!!draft.is_visible} onChange={(v) => setDraft({ ...draft, is_visible: v })} label="Visible on site" />
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
