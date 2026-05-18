'use client';

import { useEffect, useState, useCallback } from 'react';
import type { Collection, Product } from '@/lib/types';

export default function AdminCollections() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', slug: '', image: '', description: '' });

  // Manage products state
  const [manageCollection, setManageCollection] = useState<Collection | null>(null);
  const [collectionProducts, setCollectionProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [searching, setSearching] = useState(false);

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

  const openManageProducts = async (collection: Collection) => {
    setManageCollection(collection);
    setSearchQuery('');
    setSearchResults([]);
    try {
      const res = await fetch(`/api/admin/collections/${collection.id}/products`);
      const data = await res.json();
      if (Array.isArray(data)) setCollectionProducts(data);
    } catch (e) {
      console.error(e);
    }
  };

  const closeManageProducts = () => {
    setManageCollection(null);
    setCollectionProducts([]);
  };

  const searchProducts = useCallback(async (q: string) => {
    if (!q.trim()) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const res = await fetch(`/api/products?search=${encodeURIComponent(q)}&limit=20`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setSearchResults(data.filter((p: Product) => !collectionProducts.some(cp => cp.id === p.id)));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSearching(false);
    }
  }, [collectionProducts]);

  useEffect(() => {
    const timer = setTimeout(() => searchProducts(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery, searchProducts]);

  const addProduct = async (productId: string) => {
    if (!manageCollection) return;
    try {
      const res = await fetch(`/api/admin/collections/${manageCollection.id}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId }),
      });
      if (!res.ok) throw new Error('Failed to add');
      setSearchResults(prev => prev.filter(p => p.id !== productId));
      const added = searchResults.find(p => p.id === productId) || await (await fetch(`/api/products/${productId}`)).json();
      setCollectionProducts(prev => [...prev, added]);
    } catch (e) {
      console.error(e);
    }
  };

  const removeProduct = async (productId: string) => {
    if (!manageCollection) return;
    try {
      const res = await fetch(`/api/admin/collections/${manageCollection.id}/products?product_id=${productId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to remove');
      setCollectionProducts(prev => prev.filter(p => p.id !== productId));
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
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => openForm(collection)}
                    className="bg-white text-black px-3 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-100"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => openManageProducts(collection)}
                    className="bg-white text-black px-3 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-100"
                  >
                    Products
                  </button>
                  <button
                    onClick={() => handleDelete(collection.id)}
                    className="bg-red-500 text-white px-3 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-red-600"
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

              {editingId && (
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      const col = collections.find(c => c.id === editingId);
                      if (col) openManageProducts(col);
                    }}
                    className="w-full border border-black py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-colors"
                  >
                    Manage Products in Collection
                  </button>
                </div>
              )}
              <div className="pt-12">
                <button type="submit" className="w-full bg-black text-white py-5 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-gray-800 transition-colors">
                  {editingId ? 'Update Collection' : 'Create Collection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {manageCollection && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={closeManageProducts} />
          <div className="relative w-full max-w-lg bg-white h-full shadow-2xl p-12 flex flex-col">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-serif uppercase tracking-tighter">{manageCollection.name}</h2>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Manage Products</p>
              </div>
              <button onClick={closeManageProducts} className="text-2xl font-light">✕</button>
            </div>

            <div className="mb-6">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border border-black/20 px-4 py-3 text-sm focus:outline-none focus:border-black"
                placeholder="Search products to add..."
              />
              {searching && <p className="text-[10px] text-gray-400 mt-1">Searching...</p>}
              {searchResults.length > 0 && (
                <div className="mt-2 border border-black/10 max-h-60 overflow-y-auto">
                  {searchResults.map((p) => (
                    <div key={p.id} className="flex justify-between items-center px-4 py-2 border-b border-black/5 hover:bg-gray-50">
                      <span className="text-sm truncate">{p.name}</span>
                      <button
                        onClick={() => addProduct(p.id)}
                        className="text-[10px] font-bold uppercase tracking-widest text-green-700 hover:text-green-900 shrink-0 ml-4"
                      >
                        + Add
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">Current Products ({collectionProducts.length})</h3>
              {collectionProducts.length === 0 ? (
                <p className="text-[10px] text-gray-300 uppercase tracking-widest">No products assigned yet</p>
              ) : (
                <div className="space-y-2">
                  {collectionProducts.map((p) => (
                    <div key={p.id} className="flex justify-between items-center px-4 py-2 bg-gray-50 border border-black/5">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm truncate">{p.name}</p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">{p.category} — ₹{p.price}</p>
                      </div>
                      <button
                        onClick={() => removeProduct(p.id)}
                        className="text-[10px] font-bold uppercase tracking-widest text-red-600 hover:text-red-800 shrink-0 ml-4"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
