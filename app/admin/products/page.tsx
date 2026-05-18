'use client';

import { useEffect, useState } from 'react';
import type { Product } from '@/lib/types';
import { compressImage } from '@/lib/image-compress';

const SIZE_OPTIONS = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'FREE SIZE'];
const FABRIC_OPTIONS = ['Cotton', 'Linen', 'Silk', 'Wool', 'Denim', 'Polyester', 'Viscose', 'Cashmere', 'Leather', 'Canvas', 'Organic Cotton', 'Cotton Blend', 'Wool Blend', 'Silk Blend', 'Linen Blend'];
const CATEGORIES = ['Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Footwear', 'Accessories'];

const COLOR_MAP: Record<string, string> = {
  black: '#000000', white: '#ffffff', navy: '#000080', ivory: '#fffff0',
  charcoal: '#36454f', tan: '#d2b48c', natural: '#d4c9b0', cream: '#fffdd0',
  grey: '#808080', slate: '#708090', brown: '#8b4513', beige: '#f5f5dc',
  pink: '#ffc0cb', red: '#ff0000', blue: '#0000ff', green: '#008000',
  yellow: '#ffff00', purple: '#800080', orange: '#ffa500', silver: '#c0c0c0',
  gold: '#ffd700', nude: '#e8c7b3', olive: '#808000', maroon: '#800000',
  burgundy: '#800020', camel: '#c19a6b', blush: '#de5d83', midnight: '#191970',
};

interface ProductForm {
  name: string;
  price: string;
  category: string;
  description: string;
  fabric: string;
  uploadedImages: string[];
  colors: string[];
  sizes: string[];
  stock: string;
  low_stock_threshold: string;
  is_new_arrival: boolean;
  is_trending: boolean;
  is_essential: boolean;
}

const defaultForm: ProductForm = {
  name: '',
  price: '',
  category: 'Tops',
  description: '',
  fabric: '',
  uploadedImages: [],
  colors: [],
  sizes: [],
  stock: '0',
  low_stock_threshold: '5',
  is_new_arrival: false,
  is_trending: false,
  is_essential: false,
};

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(defaultForm);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const fetchProducts = async () => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (categoryFilter) params.set('category', categoryFilter);
    setLoadError('');
    try {
      const res = await fetch(`/api/admin/products?${params}`);
      const data = await res.json();
      if (Array.isArray(data)) setProducts(data);
      else setLoadError(data?.error || 'Failed to load products');
    } catch (e) {
      setLoadError('Network error — is the server running?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, [search, categoryFilter]);

  const openForm = (product?: Product) => {
    if (product) {
      setForm({
        name: product.name,
        price: String(product.price),
        category: product.category,
        description: product.description || '',
        fabric: product.fabric || '',
        uploadedImages: product.images || [],
        colors: product.colors || [],
        sizes: product.sizes || [],
        stock: String(product.stock ?? 0),
        low_stock_threshold: String(product.low_stock_threshold ?? 5),
        is_new_arrival: product.is_new_arrival,
        is_trending: product.is_trending,
        is_essential: product.is_essential,
      });
      setEditingId(product.id);
    } else {
      setForm(defaultForm);
      setEditingId(null);
    }
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setForm(defaultForm);
  };

  const [formError, setFormError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const body = {
      name: form.name,
      price: parseFloat(form.price),
      category: form.category,
      description: form.description,
      fabric: form.fabric,
      images: form.uploadedImages,
      colors: form.colors,
      sizes: form.sizes,
      stock: parseInt(form.stock) || 0,
      low_stock_threshold: parseInt(form.low_stock_threshold) || 5,
      is_new_arrival: form.is_new_arrival,
      is_trending: form.is_trending,
      is_essential: form.is_essential,
    };

    try {
      const res = editingId
        ? await fetch(`/api/admin/products/${editingId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        : await fetch('/api/admin/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server error (${res.status})`);
      }

      closeForm();
      fetchProducts();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to save product';
      if (msg.includes('relation') || msg.includes('does not exist')) {
        setFormError('Database tables not found. Run the SQL migration in Supabase first.');
      } else {
        setFormError(msg);
      }
    }
  };

  const [uploading, setUploading] = useState(false);
  const [colorInput, setColorInput] = useState('');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const data = new FormData();
      for (const file of Array.from(files)) {
        const compressed = await compressImage(file, 1200, 0.7);
        const webpFile = new File([compressed], file.name.replace(/\.[^.]+$/, '.webp'), { type: 'image/webp' });
        data.append('images', webpFile);
      }
      const res = await fetch('/api/admin/upload', { method: 'POST', body: data });
      const result = await res.json();
      if (result.urls) {
        setForm({ ...form, uploadedImages: [...form.uploadedImages, ...result.urls] });
      }
    } catch (e) {
      console.error('Upload failed', e);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    setForm({
      ...form,
      uploadedImages: form.uploadedImages.filter((_, i) => i !== index),
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    try {
      await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      fetchProducts();
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

  if (loadError) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 p-6">
          <p className="text-[10px] uppercase tracking-widest text-red-600 font-bold">{loadError}</p>
          <p className="text-[9px] text-red-500 mt-2">
            Make sure you ran the SQL migration in Supabase Studio.
          </p>
        </div>
        <button onClick={fetchProducts} className="text-[10px] uppercase tracking-widest font-bold underline">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-white p-6 border border-black/5 shadow-sm sticky top-20 z-10">
        <div>
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Inventory</h2>
          <p className="text-xl font-serif mt-1">{products.length} Items</p>
        </div>
        <div className="flex gap-4 items-center">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="SEARCH..."
            className="border-b border-black py-2 text-[10px] uppercase tracking-widest focus:outline-none w-40"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border-b border-black py-2 text-[10px] uppercase tracking-widest focus:outline-none bg-transparent"
          >
            <option value="">All Categories</option>
            <option>Tops</option>
            <option>Bottoms</option>
            <option>Outerwear</option>
            <option>Footwear</option>
            <option>Accessories</option>
            <option>Dresses</option>
          </select>
          <button
            onClick={() => openForm()}
            className="bg-black text-white px-8 py-3 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-gray-800 transition-colors"
          >
            Add New Product
          </button>
        </div>
      </div>

      <div className="bg-white border border-black/5 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-black/5">
            <tr>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-gray-400">Product</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-gray-400">Category</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-gray-400">Price</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-gray-400">Stock</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-gray-400">Colors</th>
              <th className="px-6 py-4 text-right text-[10px] uppercase tracking-widest font-bold text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {products.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest">No products found</p>
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-16 bg-gray-100 relative overflow-hidden flex-shrink-0">
                        {product.images?.[0] && (
                          <img src={product.images[0]} alt="" className="object-cover w-full h-full grayscale group-hover:grayscale-0 transition-all" />
                        )}
                      </div>
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-widest">{product.name}</p>
                        <p className="text-[9px] text-gray-400 uppercase tracking-widest mt-1">ID: #{product.id.slice(0, 8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] uppercase tracking-widest text-gray-500">{product.category}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-serif">${Number(product.price).toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold ${(product.stock ?? 0) <= (product.low_stock_threshold ?? 5) ? 'text-red-500' : 'text-gray-700'}`}>
                      {product.stock ?? 0}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1 flex-wrap max-w-[150px]">
                      {(product.colors || []).map(c => (
                        <span key={c} className="text-[8px] border border-black/10 px-1.5 py-0.5 uppercase tracking-widest">{c}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-4">
                      <button
                        onClick={() => openForm(product)}
                        className="text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-black transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-red-500 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={closeForm} />
          <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl overflow-y-auto p-12">
            <div className="flex justify-between items-center mb-12">
              <h2 className="text-2xl font-serif uppercase tracking-tighter">
                {editingId ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button onClick={closeForm} className="text-2xl font-light">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 pb-20">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold">Product Name</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full border-b border-black py-3 text-sm focus:outline-none"
                    placeholder="E.G. SILK BLOUSE"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full border-b border-black py-3 text-sm focus:outline-none"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full border-b border-black py-3 text-sm focus:outline-none bg-transparent"
                  >
                    <option>Tops</option>
                    <option>Bottoms</option>
                    <option>Outerwear</option>
                    <option>Footwear</option>
                    <option>Dresses</option>
                    <option>Accessories</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold">Fabric</label>
                  <select
                    value={form.fabric}
                    onChange={(e) => setForm({ ...form, fabric: e.target.value })}
                    className="w-full border-b border-black py-3 text-sm focus:outline-none bg-transparent"
                  >
                    <option value="">SELECT FABRIC</option>
                    {FABRIC_OPTIONS.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest font-bold">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full border-b border-black py-3 text-sm focus:outline-none min-h-[100px]"
                  placeholder="PRODUCT DETAILS..."
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-widest font-bold">Product Images</label>
                <div className="flex flex-wrap gap-3 mb-3">
                  {form.uploadedImages.map((url, i) => (
                    <div key={i} className="relative w-20 h-24 bg-gray-100 border border-black/10 group">
                      <img src={url} alt="" className="object-cover w-full h-full" />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-0 right-0 bg-black/70 text-white w-5 h-5 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <label className="w-20 h-24 border-2 border-dashed border-black/10 flex flex-col items-center justify-center cursor-pointer hover:border-black/40 transition-colors">
                    <span className="text-[18px] text-gray-300 font-light">{uploading ? '...' : '+'}</span>
                    <span className="text-[7px] uppercase tracking-widest text-gray-300 mt-1">{uploading ? 'Uploading' : 'Add'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-widest font-bold">Colors</label>
                  <div className="flex flex-wrap gap-2 min-h-[42px] p-3 border border-black/10 bg-white">
                    {form.colors.map((c, i) => (
                      <span key={i} className="flex items-center gap-1.5 bg-gray-100 border border-black/10 px-2.5 py-1.5">
                        <span
                          className="w-3 h-3 rounded-full border border-black/20"
                          style={{ backgroundColor: COLOR_MAP[c.toLowerCase()] || c.toLowerCase() }}
                        />
                        <span className="text-[10px] uppercase tracking-widest font-medium">{c}</span>
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, colors: form.colors.filter((_, j) => j !== i) })}
                          className="text-gray-400 hover:text-black ml-0.5 text-[10px]"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      value={colorInput}
                      onChange={(e) => setColorInput(e.target.value.toUpperCase())}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const val = colorInput.trim();
                          if (val && !form.colors.includes(val)) {
                            setForm({ ...form, colors: [...form.colors, val] });
                          }
                          setColorInput('');
                        }
                      }}
                      className="flex-1 min-w-[80px] border-none text-[11px] uppercase tracking-widest focus:outline-none placeholder:text-gray-200"
                      placeholder="TYPE + ENTER"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-widest font-bold">Sizes</label>
                  <div className="flex flex-wrap gap-2">
                    {SIZE_OPTIONS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => {
                          if (form.sizes.includes(s)) {
                            setForm({ ...form, sizes: form.sizes.filter(x => x !== s) });
                          } else {
                            setForm({ ...form, sizes: [...form.sizes, s] });
                          }
                        }}
                        className={`px-3 py-2 text-[10px] uppercase tracking-widest font-bold border transition-colors ${
                          form.sizes.includes(s)
                            ? 'bg-black text-white border-black'
                            : 'bg-white text-gray-400 border-black/10 hover:border-black/40'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold">Stock Quantity</label>
                  <input
                    type="number"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    className="w-full border-b border-black py-3 text-sm focus:outline-none"
                    placeholder="0"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold">Low Stock Threshold</label>
                  <input
                    type="number"
                    value={form.low_stock_threshold}
                    onChange={(e) => setForm({ ...form, low_stock_threshold: e.target.value })}
                    className="w-full border-b border-black py-3 text-sm focus:outline-none"
                    placeholder="5"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-black/5">
                <span className="text-[10px] font-bold uppercase tracking-widest block mb-6">Storefront Placement</span>
                <div className="flex flex-wrap gap-12">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={form.is_new_arrival}
                      onChange={(e) => setForm({ ...form, is_new_arrival: e.target.checked })}
                      className="w-4 h-4 accent-black"
                    />
                    <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400 group-hover:text-black transition-colors">New Arrival</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={form.is_trending}
                      onChange={(e) => setForm({ ...form, is_trending: e.target.checked })}
                      className="w-4 h-4 accent-black"
                    />
                    <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400 group-hover:text-black transition-colors">Trending</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={form.is_essential}
                      onChange={(e) => setForm({ ...form, is_essential: e.target.checked })}
                      className="w-4 h-4 accent-black"
                    />
                    <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400 group-hover:text-black transition-colors">Essential</span>
                  </label>
                </div>
              </div>

              {formError && (
                <div className="bg-red-50 border border-red-200 p-4">
                  <p className="text-[10px] uppercase tracking-widest text-red-600 font-bold">{formError}</p>
                </div>
              )}

              <div className="pt-12">
                <button
                  type="submit"
                  className="w-full bg-black text-white py-5 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-gray-800 transition-colors"
                >
                  {editingId ? 'Update Product' : 'Create Product Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
