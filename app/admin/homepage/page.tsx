'use client';

import { useEffect, useState } from 'react';
import type { HomepageSection } from '@/lib/types';
import { compressImage } from '@/lib/image-compress';

const SECTION_TYPES: { value: HomepageSection['section_type']; label: string }[] = [
  { value: 'hero_slide', label: 'Hero Slide' },
  { value: 'editorial', label: 'Editorial Block' },
  { value: 'category_spotlight', label: 'Category Spotlight' },
  { value: 'newsletter', label: 'Newsletter Signup' },
];

const LAYOUT_OPTIONS = [
  { value: 'split', label: 'Split Screen' },
  { value: 'fullscreen-center', label: 'Fullscreen Center' },
  { value: 'fullscreen-left', label: 'Fullscreen Left' },
];

const defaultForm = {
  section_type: 'hero_slide' as HomepageSection['section_type'],
  title: '',
  subtitle: '',
  description: '',
  image_url: '',
  image_url_2: '',
  link_url: '',
  link_text: '',
  sort_order: 0,
  is_visible: true,
  settings: {} as Record<string, string | boolean | number>,
};

export default function AdminHomepage() {
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [formError, setFormError] = useState('');
  const [uploading, setUploading] = useState<'image_url' | 'image_url_2' | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'image_url' | 'image_url_2') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(target);
    try {
      const file = files[0];
      const compressed = await compressImage(file, 1600, 0.8);
      const webpFile = new File([compressed], file.name.replace(/\.[^.]+$/, '.webp'), { type: 'image/webp' });
      const data = new FormData();
      data.append('images', webpFile);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: data });
      const result = await res.json();
      if (result.urls?.[0]) {
        setForm({ ...form, [target]: result.urls[0] });
      }
    } catch (e) {
      console.error('Upload failed', e);
    } finally {
      setUploading(null);
      e.target.value = '';
    }
  };

  const fetchSections = async () => {
    try {
      const res = await fetch('/api/admin/homepage-sections');
      const data = await res.json();
      if (Array.isArray(data)) setSections(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSections(); }, []);

  const openForm = (section?: HomepageSection) => {
    if (section) {
      setForm({
        section_type: section.section_type,
        title: section.title,
        subtitle: section.subtitle,
        description: section.description,
        image_url: section.image_url,
        image_url_2: section.image_url_2,
        link_url: section.link_url,
        link_text: section.link_text,
        sort_order: section.sort_order,
        is_visible: section.is_visible,
        settings: (section.settings || {}) as Record<string, string | boolean | number>,
      });
      setEditingId(section.id);
    } else {
      setForm({ ...defaultForm, sort_order: sections.length + 1 });
      setEditingId(null);
    }
    setFormError('');
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setForm(defaultForm);
    setFormError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const body = { ...form };

    try {
      const res = editingId
        ? await fetch(`/api/admin/homepage-sections/${editingId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        : await fetch('/api/admin/homepage-sections', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server error (${res.status})`);
      }

      closeForm();
      fetchSections();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Failed to save section');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this section?')) return;
    try {
      await fetch(`/api/admin/homepage-sections/${id}`, { method: 'DELETE' });
      fetchSections();
    } catch (e) {
      console.error(e);
    }
  };

  const sectionTypeLabel = (type: string) => SECTION_TYPES.find(t => t.value === type)?.label || type;

  const previewSlide = (section: HomepageSection) => {
    if (section.section_type !== 'hero_slide') return null;
    const layout = (section.settings?.layout as string) || 'split';
    return (
      <div className="relative aspect-[2/1] bg-gray-100 overflow-hidden rounded-sm">
        {section.image_url && (
          <img src={section.image_url} alt={section.title} className="object-cover w-full h-full" />
        )}
        <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-0.5 text-[8px] uppercase tracking-widest rounded">
          {layout}
        </div>
      </div>
    );
  };

  const previewBlock = (section: HomepageSection) => {
    if (section.section_type === 'category_spotlight') {
      return (
        <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden rounded-sm">
          {section.image_url && (
            <img src={section.image_url} alt={section.title} className="object-cover w-full h-full" />
          )}
        </div>
      );
    }
    if (section.section_type === 'editorial') {
      return (
        <div className="relative aspect-[2/1] bg-gray-100 overflow-hidden rounded-sm">
          {section.image_url && (
            <img src={section.image_url} alt={section.title} className="object-cover w-full h-full" />
          )}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-white p-6 border border-black/5 shadow-sm">
        <div>
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Storefront</h2>
          <p className="text-xl font-serif mt-1">{sections.length} Sections</p>
        </div>
        <button
          onClick={() => openForm()}
          className="bg-black text-white px-8 py-3 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-gray-800 transition-colors"
        >
          Add Section
        </button>
      </div>

      {sections.length === 0 ? (
        <div className="bg-white border border-black/5 shadow-sm p-12 text-center">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest">No sections yet</p>
        </div>
      ) : (
        <div className="bg-white border border-black/5 shadow-sm divide-y divide-black/5">
          {sections.map((section, idx) => (
            <div key={section.id} className="flex items-center gap-6 p-6 hover:bg-gray-50 transition-colors">
              <span className="text-[10px] text-gray-400 font-mono w-8">{idx + 1}</span>

              <div className="w-48 flex-shrink-0">
                {section.section_type === 'hero_slide' ? previewSlide(section) : previewBlock(section)}
              </div>

              <div className="flex-grow min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                    {sectionTypeLabel(section.section_type)}
                  </span>
                  {!section.is_visible && (
                    <span className="text-[9px] font-bold uppercase tracking-widest text-red-400 bg-red-50 px-2 py-0.5 rounded">
                      Hidden
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-bold truncate">{section.title || 'Untitled'}</h3>
                {section.subtitle && (
                  <p className="text-[10px] text-gray-500 truncate">{section.subtitle}</p>
                )}
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => openForm(section)}
                  className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest border border-black/10 hover:bg-black hover:text-white transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(section.id)}
                  className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest bg-red-500 text-white hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isFormOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={closeForm} />
          <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl overflow-y-auto">
            <div className="p-12">
              <div className="flex justify-between items-center mb-12">
                <h2 className="text-2xl font-serif uppercase tracking-tighter">
                  {editingId ? 'Edit Section' : 'New Section'}
                </h2>
                <button onClick={closeForm} className="text-2xl font-light">✕</button>
              </div>

              {formError && (
                <div className="mb-8 p-4 bg-red-50 border border-red-200">
                  <p className="text-[10px] text-red-600 uppercase tracking-widest font-bold">{formError}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold">Section Type</label>
                  <select
                    value={form.section_type}
                    onChange={(e) => setForm({ ...form, section_type: e.target.value as HomepageSection['section_type'] })}
                    className="w-full border-b border-black py-3 text-sm focus:outline-none bg-white"
                    disabled={!!editingId}
                  >
                    {SECTION_TYPES.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold">Title</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full border-b border-black py-3 text-sm focus:outline-none"
                    placeholder="E.G. SPRING 2026"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold">Subtitle</label>
                  <input
                    type="text"
                    value={form.subtitle}
                    onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                    className="w-full border-b border-black py-3 text-sm focus:outline-none"
                    placeholder="A short description line..."
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full border-b border-black py-3 text-sm focus:outline-none min-h-[60px]"
                    placeholder="Longer description text..."
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-widest font-bold">Primary Image</label>
                  <div className="flex items-start gap-3">
                    <label className={`w-24 h-28 border-2 border-dashed border-black/10 flex flex-col items-center justify-center cursor-pointer hover:border-black/40 transition-colors flex-shrink-0 ${uploading === 'image_url' ? 'opacity-50 pointer-events-none' : ''}`}>
                      <span className="text-[18px] text-gray-300 font-light">{uploading === 'image_url' ? '...' : '+'}</span>
                      <span className="text-[7px] uppercase tracking-widest text-gray-300 mt-1">{uploading === 'image_url' ? 'Uploading' : 'Upload'}</span>
                      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'image_url')} disabled={!!uploading} className="hidden" />
                    </label>
                    {form.image_url && (
                      <div className="relative w-24 h-28 bg-gray-100 border border-black/10 group flex-shrink-0">
                        <img src={form.image_url} alt="" className="object-cover w-full h-full" />
                        <button type="button" onClick={() => setForm({ ...form, image_url: '' })} className="absolute top-0 right-0 bg-black/70 text-white w-5 h-5 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                      </div>
                    )}
                    <input type="text" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className="flex-grow border-b border-black py-3 text-sm focus:outline-none" placeholder="OR paste URL..." />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-widest font-bold">Secondary Image</label>
                  <div className="flex items-start gap-3">
                    <label className={`w-24 h-28 border-2 border-dashed border-black/10 flex flex-col items-center justify-center cursor-pointer hover:border-black/40 transition-colors flex-shrink-0 ${uploading === 'image_url_2' ? 'opacity-50 pointer-events-none' : ''}`}>
                      <span className="text-[18px] text-gray-300 font-light">{uploading === 'image_url_2' ? '...' : '+'}</span>
                      <span className="text-[7px] uppercase tracking-widest text-gray-300 mt-1">{uploading === 'image_url_2' ? 'Uploading' : 'Upload'}</span>
                      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'image_url_2')} disabled={!!uploading} className="hidden" />
                    </label>
                    {form.image_url_2 && (
                      <div className="relative w-24 h-28 bg-gray-100 border border-black/10 group flex-shrink-0">
                        <img src={form.image_url_2} alt="" className="object-cover w-full h-full" />
                        <button type="button" onClick={() => setForm({ ...form, image_url_2: '' })} className="absolute top-0 right-0 bg-black/70 text-white w-5 h-5 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
                      </div>
                    )}
                    <input type="text" value={form.image_url_2} onChange={(e) => setForm({ ...form, image_url_2: e.target.value })} className="flex-grow border-b border-black py-3 text-sm focus:outline-none" placeholder="OR paste URL..." />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold">Link URL</label>
                  <input
                    type="text"
                    value={form.link_url}
                    onChange={(e) => setForm({ ...form, link_url: e.target.value })}
                    className="w-full border-b border-black py-3 text-sm focus:outline-none"
                    placeholder="/SHOP OR HTTPS://..."
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold">Link Text</label>
                  <input
                    type="text"
                    value={form.link_text}
                    onChange={(e) => setForm({ ...form, link_text: e.target.value })}
                    className="w-full border-b border-black py-3 text-sm focus:outline-none"
                    placeholder="E.G. SHOP COLLECTION"
                  />
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest font-bold">Sort Order</label>
                    <input
                      type="number"
                      value={form.sort_order}
                      onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                      className="w-full border-b border-black py-3 text-sm focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest font-bold">Visible</label>
                    <label className="flex items-center gap-3 mt-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.is_visible}
                        onChange={(e) => setForm({ ...form, is_visible: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">{form.is_visible ? 'Visible on homepage' : 'Hidden'}</span>
                    </label>
                  </div>
                </div>

                {form.section_type === 'hero_slide' && (
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest font-bold">Layout</label>
                    <select
                      value={String(form.settings?.layout || 'split')}
                      onChange={(e) => setForm({ ...form, settings: { ...form.settings, layout: e.target.value } })}
                      className="w-full border-b border-black py-3 text-sm focus:outline-none bg-white"
                    >
                      {LAYOUT_OPTIONS.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="pt-12">
                  <button type="submit" className="w-full bg-black text-white py-5 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-gray-800 transition-colors">
                    {editingId ? 'Update Section' : 'Create Section'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
