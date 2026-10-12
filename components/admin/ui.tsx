'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Portal from '@/components/Portal';
import { compressImage } from '@/lib/image-compress';

// ─── Formatting ─────────────────────────────────────────

export const inr = (n: number, digits = 0) =>
  `₹${Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;

export const compact = (n: number) =>
  Math.abs(n) >= 100000 ? `${(n / 100000).toFixed(1)}L` : Math.abs(n) >= 1000 ? `${(n / 1000).toFixed(1)}K` : `${Math.round(n)}`;

export const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

export const dateTime = (iso: string) =>
  new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

// ─── Toasts ─────────────────────────────────────────────

type Toast = { id: number; message: string; tone: 'success' | 'error' };
const ToastContext = createContext<(message: string, tone?: Toast['tone']) => void>(() => {});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((message: string, tone: Toast['tone'] = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);
  return (
    <ToastContext.Provider value={push}>
      {children}
      <Portal>
        <div className="fixed bottom-6 right-6 z-[300] flex flex-col gap-2" aria-live="polite">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`animate-fade-up px-5 py-3 text-[10px] font-bold uppercase tracking-[0.2em] border ${
                t.tone === 'error' ? 'bg-white text-black border-black' : 'bg-black text-white border-black'
              }`}
            >
              {t.tone === 'error' ? '✕ ' : '✓ '}{t.message}
            </div>
          ))}
        </div>
      </Portal>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

// ─── API helper ─────────────────────────────────────────

export async function api<T = unknown>(url: string, init?: RequestInit & { json?: unknown }): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: init?.json !== undefined ? { 'Content-Type': 'application/json', ...init?.headers } : init?.headers,
    body: init?.json !== undefined ? JSON.stringify(init.json) : init?.body,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error || `Request failed (${res.status})`);
  return data as T;
}

// ─── Layout pieces ──────────────────────────────────────

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
      <div>
        {eyebrow && <span className="block text-[9px] font-bold uppercase tracking-[0.4em] text-gray-400 mb-3">{eyebrow}</span>}
        <h1 className="text-3xl md:text-4xl font-serif uppercase tracking-tighter leading-none">{title}</h1>
        {description && <p className="text-xs text-gray-500 mt-3 max-w-xl leading-relaxed">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </div>
  );
}

export function Card({ title, action, children, className = '', padded = true }: { title?: string; action?: React.ReactNode; children: React.ReactNode; className?: string; padded?: boolean }) {
  return (
    <section className={`bg-white border border-black/10 ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-4 px-5 h-12 border-b border-black/10">
          {title && <p className="text-[10px] font-bold uppercase tracking-[0.2em]">{title}</p>}
          {action}
        </div>
      )}
      <div className={padded ? 'p-5' : ''}>{children}</div>
    </section>
  );
}

export function Stat({ label, value, delta, hint }: { label: string; value: string; delta?: number | null; hint?: string }) {
  const up = (delta ?? 0) >= 0;
  return (
    <div className="bg-white border border-black/10 p-5">
      <p className="text-[10px] font-medium text-gray-500">{label}</p>
      <p className="text-2xl md:text-3xl font-semibold tracking-tight mt-3">{value}</p>
      <div className="flex items-center gap-2 mt-2 h-4">
        {delta !== undefined && delta !== null && Number.isFinite(delta) && (
          <span className={`text-[10px] font-semibold ${up ? 'text-black' : 'text-gray-500'}`}>
            {up ? '▲' : '▼'} {Math.abs(delta).toFixed(1)}%
          </span>
        )}
        {hint && <span className="text-[10px] text-gray-400 truncate hidden sm:inline">{hint}</span>}
      </div>
    </div>
  );
}

export const delta = (now: number, prev: number) => (prev > 0 ? ((now - prev) / prev) * 100 : now > 0 ? 100 : 0);

export function Badge({ children, tone = 'outline' }: { children: React.ReactNode; tone?: 'solid' | 'outline' | 'muted' }) {
  const styles = {
    solid: 'bg-black text-white border-black',
    outline: 'text-black border-black',
    muted: 'text-gray-400 border-gray-300',
  };
  return <span className={`inline-block border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.15em] whitespace-nowrap ${styles[tone]}`}>{children}</span>;
}

export function StatusBadge({ status }: { status: string }) {
  return <Badge tone={status === 'delivered' ? 'solid' : status === 'cancelled' ? 'muted' : 'outline'}>{status}</Badge>;
}

export function EmptyState({ title, text, action }: { title: string; text?: string; action?: React.ReactNode }) {
  return (
    <div className="py-16 text-center">
      <p className="text-xl font-serif uppercase tracking-tighter mb-2">{title}</p>
      {text && <p className="text-xs text-gray-500 mb-6">{text}</p>}
      {action}
    </div>
  );
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`bg-gray-100 animate-pulse ${className}`} />;
}

// ─── Controls ───────────────────────────────────────────

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger'; size?: 'sm' | 'md' };

export function Button({ variant = 'primary', size = 'md', className = '', ...props }: ButtonProps) {
  const variants = {
    primary: 'bg-black text-white border-black hover:bg-white hover:text-black',
    secondary: 'bg-white text-black border-black hover:bg-black hover:text-white',
    ghost: 'bg-transparent text-black border-transparent hover:border-black/20',
    danger: 'bg-white text-black border-black/20 hover:border-black hover:bg-black hover:text-white',
  };
  const sizes = { sm: 'h-8 px-3 text-[9px]', md: 'h-10 px-5 text-[10px]' };
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 border font-bold uppercase tracking-[0.15em] transition-colors disabled:opacity-40 disabled:pointer-events-none ${variants[variant]} ${sizes[size]} ${className}`}
    />
  );
}

export function Field({ label, hint, children, className = '' }: { label: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-[10px] font-bold uppercase tracking-[0.15em] mb-2">{label}</span>
      {children}
      {hint && <span className="block text-[10px] text-gray-400 mt-1.5">{hint}</span>}
    </label>
  );
}

const inputClass = 'w-full h-10 px-3 bg-white border border-black/15 text-sm focus:outline-none focus:border-black transition-colors placeholder:text-gray-300';

// A width class passed in (w-16, w-40…) replaces the default full width
const sized = (base: string, extra = '') => (/(^|\s)w-/.test(extra) ? base.replace('w-full ', '') : base) + ' ' + extra;

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={sized(inputClass, props.className)} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea rows={3} {...props} className={`${inputClass} h-auto py-2.5 resize-y leading-relaxed ${props.className || ''}`} />;
}

export function Select({ options, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { options: { value: string; label: string }[] }) {
  return (
    <select {...props} className={sized(inputClass, `cursor-pointer ${props.className || ''}`)}>
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className="inline-flex items-center gap-3 group">
      <span className={`relative w-9 h-5 border transition-colors ${checked ? 'bg-black border-black' : 'bg-white border-black/30'}`}>
        <span className={`absolute top-0.5 w-3.5 h-3.5 transition-all ${checked ? 'left-[18px] bg-white' : 'left-0.5 bg-black/40'}`} />
      </span>
      {label && <span className="text-[10px] font-bold uppercase tracking-[0.15em]">{label}</span>}
    </button>
  );
}

export function SearchInput({ value, onChange, placeholder = 'Search…' }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="relative">
      <svg viewBox="0 0 24 24" className="w-4 h-4 absolute left-3 top-3 text-gray-400" aria-hidden="true">
        <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.5" />
      </svg>
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="pl-9 w-full md:w-64" aria-label={placeholder} />
    </div>
  );
}

export function Tabs<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { value: T; label: string; count?: number }[] }) {
  return (
    <div className="flex flex-wrap border border-black/15 w-max max-w-full">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`h-9 px-4 text-[10px] font-bold uppercase tracking-[0.15em] transition-colors ${value === o.value ? 'bg-black text-white' : 'hover:bg-gray-50'}`}
        >
          {o.label}{o.count !== undefined && <span className="ml-1.5 opacity-60">{o.count}</span>}
        </button>
      ))}
    </div>
  );
}

// ─── Drawer ─────────────────────────────────────────────

export function Drawer({ open, onClose, title, subtitle, children, footer, width = 'max-w-xl' }: {
  open: boolean; onClose: () => void; title: string; subtitle?: string; children: React.ReactNode; footer?: React.ReactNode; width?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', onKey); };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <Portal>
      <div className="fixed inset-0 z-[200] flex justify-end">
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px] animate-fade-in" onClick={onClose} />
        <div role="dialog" aria-label={title} className={`relative w-full ${width} bg-white h-full border-l border-black flex flex-col animate-slide-in-right`}>
          <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-black">
            <div className="min-w-0">
              <h2 className="text-xl font-serif uppercase tracking-tighter truncate">{title}</h2>
              {subtitle && <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">{subtitle}</p>}
            </div>
            <button onClick={onClose} className="text-[10px] font-bold uppercase tracking-[0.2em] hover:opacity-50 shrink-0">Close ✕</button>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-6">{children}</div>
          {footer && <div className="px-6 py-4 border-t border-black flex items-center justify-end gap-3 bg-white">{footer}</div>}
        </div>
      </div>
    </Portal>
  );
}

// ─── Media & list editors ───────────────────────────────

async function uploadFiles(files: File[]): Promise<string[]> {
  const form = new FormData();
  for (const file of files) {
    const blob = file.type.startsWith('image/') && file.type !== 'image/gif' ? await compressImage(file) : file;
    form.append('images', new File([blob], file.name.replace(/\.\w+$/, '.webp'), { type: blob.type || file.type }));
  }
  const { urls } = await api<{ urls: string[] }>('/api/admin/upload', { method: 'POST', body: form });
  return urls;
}

export function ImageField({ value, onChange, label = 'Image' }: { value: string; onChange: (url: string) => void; label?: string }) {
  const toast = useToast();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    try {
      const [url] = await uploadFiles([files[0]]);
      onChange(url);
      toast('Image uploaded');
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Upload failed', 'error');
    } finally { setBusy(false); }
  };
  return (
    <div>
      <span className="block text-[10px] font-bold uppercase tracking-[0.15em] mb-2">{label}</span>
      <div className="flex gap-3">
        <div className="relative w-20 h-24 bg-gray-50 border border-black/10 shrink-0 overflow-hidden">
          {value ? <Image src={value} alt="" fill className="object-cover" unoptimized /> : <span className="absolute inset-0 flex items-center justify-center text-[9px] text-gray-300 uppercase">None</span>}
        </div>
        <div className="flex-1 space-y-2">
          <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder="https://… or upload" />
          <div className="flex gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => input.current?.click()} disabled={busy}>{busy ? 'Uploading…' : 'Upload'}</Button>
            {value && <Button type="button" variant="ghost" size="sm" onClick={() => onChange('')}>Remove</Button>}
          </div>
          <input ref={input} type="file" accept="image/*" hidden onChange={(e) => { onFiles(e.target.files); e.target.value = ''; }} />
        </div>
      </div>
    </div>
  );
}

export function ImageListField({ value, onChange }: { value: string[]; onChange: (urls: string[]) => void }) {
  const toast = useToast();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [url, setUrl] = useState('');
  const move = (i: number, dir: -1 | 1) => {
    const next = [...value];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    try {
      onChange([...value, ...(await uploadFiles(Array.from(files)))]);
      toast(`${files.length} image${files.length > 1 ? 's' : ''} uploaded`);
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Upload failed', 'error');
    } finally { setBusy(false); }
  };
  return (
    <div>
      <span className="block text-[10px] font-bold uppercase tracking-[0.15em] mb-2">Images <span className="text-gray-400 normal-case tracking-normal font-normal">— first is the cover, second shows on hover</span></span>
      <div className="grid grid-cols-4 gap-2 mb-3">
        {value.map((src, i) => (
          <div key={`${src}-${i}`} className="group relative aspect-[3/4] bg-gray-50 border border-black/10 overflow-hidden">
            <Image src={src} alt="" fill className="object-cover" unoptimized />
            {i === 0 && <span className="absolute top-1 left-1 bg-black text-white text-[8px] font-bold uppercase px-1.5 py-0.5">Cover</span>}
            <div className="absolute inset-x-0 bottom-0 flex bg-white/95 border-t border-black/10 opacity-0 group-hover:opacity-100 transition-opacity text-[10px]">
              <button type="button" onClick={() => move(i, -1)} className="flex-1 py-1 hover:bg-gray-100" aria-label="Move left">←</button>
              <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} className="flex-1 py-1 hover:bg-gray-100" aria-label="Remove">✕</button>
              <button type="button" onClick={() => move(i, 1)} className="flex-1 py-1 hover:bg-gray-100" aria-label="Move right">→</button>
            </div>
          </div>
        ))}
        <button type="button" onClick={() => input.current?.click()} disabled={busy} className="aspect-[3/4] border border-dashed border-black/30 hover:border-black flex items-center justify-center text-[9px] font-bold uppercase tracking-[0.15em] text-gray-500">
          {busy ? 'Uploading…' : '+ Upload'}
        </button>
      </div>
      <div className="flex gap-2">
        <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Or paste an image URL" />
        <Button type="button" variant="secondary" onClick={() => { if (url.trim()) { onChange([...value, url.trim()]); setUrl(''); } }}>Add</Button>
      </div>
      <input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => { onFiles(e.target.files); e.target.value = ''; }} />
    </div>
  );
}

// Chips editor for short lists (sizes, colours, care lines)
export function ListField({ label, value, onChange, placeholder, hint }: { label: string; value: string[]; onChange: (v: string[]) => void; placeholder?: string; hint?: string }) {
  const [draft, setDraft] = useState('');
  const add = () => {
    const items = draft.split(',').map((s) => s.trim()).filter(Boolean).filter((s) => !value.includes(s));
    if (items.length) onChange([...value, ...items]);
    setDraft('');
  };
  return (
    <div>
      <span className="block text-[10px] font-bold uppercase tracking-[0.15em] mb-2">{label}</span>
      <div className="flex flex-wrap gap-1.5 mb-2 min-h-[24px]">
        {value.map((item) => (
          <span key={item} className="inline-flex items-center gap-1.5 border border-black/20 pl-2 pr-1 py-0.5 text-[11px]">
            {item}
            <button type="button" onClick={() => onChange(value.filter((v) => v !== item))} className="text-gray-400 hover:text-black px-0.5" aria-label={`Remove ${item}`}>✕</button>
          </span>
        ))}
        {value.length === 0 && <span className="text-[11px] text-gray-300">None yet</span>}
      </div>
      <Input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
        onBlur={add}
        placeholder={placeholder || 'Type and press Enter'}
      />
      {hint && <span className="block text-[10px] text-gray-400 mt-1.5">{hint}</span>}
    </div>
  );
}
