'use client';

import { useEffect, useState } from 'react';
import type { Address } from '@/lib/types';

export default function AccountAddresses() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);
  const [form, setForm] = useState({
    label: '', line1: '', line2: '', city: '', state: '', postal_code: '', country: 'US', is_default: false,
  });

  const fetchAddresses = async () => {
    try {
      const res = await fetch('/api/customers/me/addresses');
      const data = await res.json();
      if (Array.isArray(data)) setAddresses(data);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchAddresses(); }, []);

  const openForm = (address?: Address) => {
    if (address) {
      setForm({
        label: address.label, line1: address.line1, line2: address.line2,
        city: address.city, state: address.state, postal_code: address.postal_code,
        country: address.country, is_default: address.is_default,
      });
      setEditing(address);
    } else {
      setForm({ label: 'Home', line1: '', line2: '', city: '', state: '', postal_code: '', country: 'US', is_default: false });
      setEditing(null);
    }
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this address?')) return;
    try {
      await fetch(`/api/customers/me/addresses/${id}`, { method: 'DELETE' });
      fetchAddresses();
    } catch {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editing
        ? `/api/customers/me/addresses/${editing.id}`
        : '/api/customers/me/addresses';
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if (res.ok) { setIsFormOpen(false); fetchAddresses(); }
    } catch {}
  };

  if (loading) return <p className="text-[10px] uppercase tracking-widest text-gray-400">Loading addresses...</p>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-serif uppercase tracking-tighter">Addresses ({addresses.length})</h1>
        <button onClick={() => openForm()} className="bg-black text-white px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-gray-800 transition-colors">
          Add Address
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="border border-black/10 p-12 text-center">
          <p className="text-[10px] uppercase tracking-widest text-gray-400">No addresses saved yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((addr) => (
            <div key={addr.id} className="border border-black/10 p-6 relative">
              {addr.is_default && <span className="absolute top-4 right-4 text-[9px] font-bold uppercase tracking-widest text-gray-400">Default</span>}
              <p className="text-xs font-bold uppercase tracking-widest mb-2">{addr.label}</p>
              <p className="text-sm">{addr.line1}</p>
              {addr.line2 && <p className="text-sm">{addr.line2}</p>}
              <p className="text-sm">{addr.city}, {addr.state} {addr.postal_code}</p>
              <p className="text-sm">{addr.country}</p>
              <div className="flex gap-4 mt-4">
                <button onClick={() => openForm(addr)} className="text-[10px] uppercase tracking-widest text-gray-500 hover:text-black underline underline-offset-4">Edit</button>
                <button onClick={() => handleDelete(addr.id)} className="text-[10px] uppercase tracking-widest text-red-500 hover:text-red-700 underline underline-offset-4">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isFormOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsFormOpen(false)} />
          <div className="relative w-full max-w-lg bg-white h-full shadow-2xl p-12 overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-serif uppercase tracking-tighter">{editing ? 'Edit Address' : 'New Address'}</h2>
              <button onClick={() => setIsFormOpen(false)} className="text-2xl font-light">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest font-bold">Label</label>
                <input type="text" required value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} className="w-full border-b border-black py-3 text-sm focus:outline-none" placeholder="Home / Work" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest font-bold">Address Line 1</label>
                <input type="text" required value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} className="w-full border-b border-black py-3 text-sm focus:outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest font-bold">Address Line 2 (optional)</label>
                <input type="text" value={form.line2} onChange={(e) => setForm({ ...form, line2: e.target.value })} className="w-full border-b border-black py-3 text-sm focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold">City</label>
                  <input type="text" required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="w-full border-b border-black py-3 text-sm focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold">State</label>
                  <input type="text" required value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="w-full border-b border-black py-3 text-sm focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold">Postal Code</label>
                  <input type="text" required value={form.postal_code} onChange={(e) => setForm({ ...form, postal_code: e.target.value })} className="w-full border-b border-black py-3 text-sm focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest font-bold">Country</label>
                  <input type="text" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="w-full border-b border-black py-3 text-sm focus:outline-none" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="is_default" checked={form.is_default} onChange={(e) => setForm({ ...form, is_default: e.target.checked })} className="w-4 h-4" />
                <label htmlFor="is_default" className="text-[10px] uppercase tracking-widest">Set as default address</label>
              </div>

              <div className="pt-6">
                <button type="submit" className="w-full bg-black text-white py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-gray-800 transition-colors">
                  {editing ? 'Update Address' : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
