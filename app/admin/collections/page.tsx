'use client';

import { useEffect, useState } from 'react';
import type { Collection } from '@/lib/types';

export default function AdminCollections() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', slug: '', image: '', description: '' });

  const fetchCollections = async () => {
    try {
      const res = await fetch('/api/admin/collections');
      const data = await res.json();
      if (Array.isArray(data)) setCollections(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCollections(); }, []);

  const openForm = (collection?: Collection) => {
    if (collection) {
      setForm({ name: collection.name, slug: collection.slug, image: collection.image || '', description: collection.description || '' });
      setEditingId(collection.id);
    } else {
      setForm({ name: '', slug: '', image: '', description: '' });
      setEditingId(null);
    }
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setForm({ name: '', slug: '', image: '', description: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await fetch(`/api/admin/collections/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
      } else {
        await fetch('/api/admin/collections', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
      }
      closeForm();
      fetchCollections();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this collection?')) return;
    try {
      await fetch(`/api/admin/collections/${id}`, { method: 'DELETE' });
      fetchCollections();
    } catch (e) {
      console.error(e);
    }
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
          <p className="text-xl font-serif mt-1">{collections.length} Collections</p>
        </div>
        <button
          onClick={() => openForm()}
          className="bg-black text-white px-8 py-3 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-gray-800 transition-colors"
        >
          New Collection
        </button>
      </div>

      {collections.length === 0 ? (
        <div className="bg-white border border-black/5 shadow-sm p-12 text-center">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest">No collections yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {collections.map((collection) => (
            <div key={collection.id} className="bg-white border border-black/5 shadow-sm group">
              <div className="relative aspect-[16/9] bg-gray-100 overflow-hidden">
                {collection.image && (
                  <img src={collection.image} alt={collection.name} className="object-cover w-full h-full grayscale group-hover:grayscale-0 transition-all duration-700" />
                )}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  <button
                    onClick={() => openForm(collection)}
                    className="bg-white text-black px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-100"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(collection.id)}
                    className="bg-red-500 text-white px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] mb-1">{collection.name}</h3>
                <p className="text-[9px] text-gray-400 uppercase tracking-widest">slug: /{collection.slug}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {isFormOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={closeForm} />
          <div className="relative w-full max-w-lg bg-white h-full shadow-2xl p-12">
            <div className="flex justify-between items-center mb-12">
              <h2 className="text-2xl font-serif uppercase tracking-tighter">
                {editingId ? 'Edit Collection' : 'New Collection'}
              </h2>
              <button onClick={closeForm} className="text-2xl font-light">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest font-bold">Collection Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border-b border-black py-3 text-sm focus:outline-none"
                  placeholder="E.G. SUMMER 2026"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest font-bold">URL Slug</label>
                <input
                  type="text"
                  required
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="w-full border-b border-black py-3 text-sm focus:outline-none"
                  placeholder="E.G. summer-2026"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest font-bold">Hero Image URL</label>
                <input
                  type="text"
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  className="w-full border-b border-black py-3 text-sm focus:outline-none"
                  placeholder="HTTPS://..."
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest font-bold">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full border-b border-black py-3 text-sm focus:outline-none min-h-[80px]"
                  placeholder="COLLECTION DESCRIPTION..."
                />
              </div>

              <div className="pt-12">
                <button type="submit" className="w-full bg-black text-white py-5 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-gray-800 transition-colors">
                  {editingId ? 'Update Collection' : 'Create Collection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
