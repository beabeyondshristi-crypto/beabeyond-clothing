'use client';

import { useState } from 'react';
import { useAuth } from '../useAuth';

export default function AccountProfile() {
  const { customer, loading } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  if (loading) return <p className="text-[10px] uppercase tracking-widest text-gray-400">Loading...</p>;
  if (!customer) return null;

  const currentName = name || customer.name;
  const currentPhone = phone || customer.phone;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const res = await fetch('/api/customers/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: currentName, phone: currentPhone }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-serif uppercase tracking-tighter">Profile</h1>

      <form onSubmit={handleSave} className="max-w-md space-y-6">
        {error && <div className="bg-red-50 border border-red-200 p-4"><p className="text-[10px] text-red-600 font-bold uppercase tracking-widest">{error}</p></div>}
        {saved && <div className="bg-green-50 border border-green-200 p-4"><p className="text-[10px] text-green-700 font-bold uppercase tracking-widest">Profile updated</p></div>}

        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-widest font-bold text-gray-900">Email</label>
          <p className="text-sm text-gray-500 py-3 border-b border-gray-200">{customer.email}</p>
          <p className="text-[9px] text-gray-400 uppercase tracking-wider">Email cannot be changed</p>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-widest font-bold text-gray-900">Full Name</label>
          <input
            type="text"
            value={currentName}
            onChange={(e) => setName(e.target.value)}
            className="w-full border-b border-black py-3 text-sm focus:outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-widest font-bold text-gray-900">Phone</label>
          <input
            type="tel"
            value={currentPhone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border-b border-black py-3 text-sm focus:outline-none"
            placeholder="+1 (555) 000-0000"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-black text-white py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-gray-800 transition-colors disabled:bg-gray-400"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
