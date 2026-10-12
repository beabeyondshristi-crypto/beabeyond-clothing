'use client';

import { useEffect, useState } from 'react';
import { DEFAULT_SITE_SETTINGS, type SiteSettings } from '@/lib/site-settings';
import { api, Button, Card, Field, Input, PageHeader, Skeleton, Textarea, Toggle, useToast } from '@/components/admin/ui';

export default function SiteSettingsPage() {
  const toast = useToast();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [saved, setSaved] = useState<string>('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api<SiteSettings>('/api/admin/site-settings')
      .then((s) => { setSettings(s); setSaved(JSON.stringify(s)); })
      .catch((e) => toast(e.message, 'error'));
  }, [toast]);

  if (!settings) return <div className="space-y-4"><Skeleton className="h-20" /><Skeleton className="h-64" /><Skeleton className="h-64" /></div>;

  const dirty = JSON.stringify(settings) !== saved;
  const set = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => setSettings({ ...settings, [key]: value });

  const save = async () => {
    setSaving(true);
    try {
      const next = await api<SiteSettings>('/api/admin/site-settings', { method: 'PUT', json: settings });
      setSettings(next);
      setSaved(JSON.stringify(next));
      toast('Settings saved — live on the site');
    } catch (e) { toast(e instanceof Error ? e.message : 'Save failed', 'error'); }
    finally { setSaving(false); }
  };

  const items = settings.announcement.items;

  return (
    <div className="pb-20">
      <PageHeader
        eyebrow="Content"
        title="Site Settings"
        description="Store-wide content that appears on every page: the scrolling banner, service strip, footer and contact details."
        actions={
          <>
            <Button variant="ghost" onClick={() => setSettings(structuredClone(DEFAULT_SITE_SETTINGS))}>Reset to Defaults</Button>
            <Button onClick={save} disabled={!dirty || saving}>{saving ? 'Saving…' : dirty ? 'Save Changes' : 'Saved'}</Button>
          </>
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card title="Scrolling Banner" action={<Toggle checked={settings.announcement.enabled} onChange={(v) => set('announcement', { ...settings.announcement, enabled: v })} label={settings.announcement.enabled ? 'On' : 'Off'} />}>
          <p className="text-[11px] text-gray-500 mb-4">The black strip under the homepage hero. Messages scroll in this order.</p>
          <div className="space-y-2">
            {items.map((item, i) => (
              <div key={i} className="flex gap-2">
                <span className="w-6 h-10 flex items-center text-[10px] text-gray-400 tabular-nums">{i + 1}</span>
                <Input value={item} onChange={(e) => set('announcement', { ...settings.announcement, items: items.map((x, j) => (j === i ? e.target.value : x)) })} />
                <button onClick={() => set('announcement', { ...settings.announcement, items: items.filter((_, j) => j !== i) })} className="w-10 h-10 border border-black/15 hover:border-black text-xs shrink-0" aria-label="Remove message">✕</button>
              </div>
            ))}
          </div>
          <Button variant="secondary" size="sm" className="mt-3" onClick={() => set('announcement', { ...settings.announcement, items: [...items, ''] })}>+ Add Message</Button>
          {settings.announcement.enabled && items.filter(Boolean).length > 0 && (
            <div className="mt-5 bg-black text-white overflow-hidden h-9 flex items-center">
              <p className="whitespace-nowrap text-[9px] font-bold uppercase tracking-[0.3em] px-4">{items.filter(Boolean).join('   ·   ')}</p>
            </div>
          )}
        </Card>

        <Card title="Service Strip">
          <p className="text-[11px] text-gray-500 mb-4">The four promises shown above the homepage newsletter.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-black/10 border border-black/10">
            {settings.services.map((service, i) => (
              <div key={i} className="bg-white p-4 space-y-3">
                <span className="text-[9px] text-gray-400 tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                <Input value={service.title} placeholder="Title" onChange={(e) => set('services', settings.services.map((s, j) => (j === i ? { ...s, title: e.target.value } : s)))} />
                <Input value={service.text} placeholder="Description" onChange={(e) => set('services', settings.services.map((s, j) => (j === i ? { ...s, text: e.target.value } : s)))} />
              </div>
            ))}
          </div>
        </Card>

        <Card title="Footer">
          <div className="space-y-4">
            <Field label="Tagline"><Textarea value={settings.footer.tagline} onChange={(e) => set('footer', { ...settings.footer, tagline: e.target.value })} /></Field>
            <Field label="Instagram URL" hint="Leave empty to hide"><Input value={settings.footer.instagram} onChange={(e) => set('footer', { ...settings.footer, instagram: e.target.value })} /></Field>
            <Field label="TikTok URL"><Input value={settings.footer.tiktok} onChange={(e) => set('footer', { ...settings.footer, tiktok: e.target.value })} /></Field>
            <Field label="Pinterest URL"><Input value={settings.footer.pinterest} onChange={(e) => set('footer', { ...settings.footer, pinterest: e.target.value })} /></Field>
          </div>
        </Card>

        <Card title="Contact">
          <div className="space-y-4">
            <Field label="Support email" hint="Shown in the footer and on the About page"><Input type="email" value={settings.contact.email} onChange={(e) => set('contact', { ...settings.contact, email: e.target.value })} /></Field>
            <Field label="Phone"><Input value={settings.contact.phone} onChange={(e) => set('contact', { ...settings.contact, phone: e.target.value })} /></Field>
          </div>
        </Card>
      </div>

      {dirty && (
        <div className="fixed bottom-0 inset-x-0 lg:left-60 z-30 bg-black text-white px-5 md:px-8 h-14 flex items-center justify-between animate-fade-up">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]">You have unsaved changes</span>
          <div className="flex gap-2">
            <button onClick={() => setSettings(JSON.parse(saved))} className="h-9 px-4 text-[10px] font-bold uppercase tracking-[0.15em] border border-white/30 hover:border-white">Discard</button>
            <button onClick={save} disabled={saving} className="h-9 px-4 text-[10px] font-bold uppercase tracking-[0.15em] bg-white text-black">{saving ? 'Saving…' : 'Save'}</button>
          </div>
        </div>
      )}
    </div>
  );
}
