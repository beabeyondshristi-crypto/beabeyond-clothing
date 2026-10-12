'use client';

import { useState } from 'react';
import Link from 'next/link';
import AuthShell from '@/components/AuthShell';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, phone }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      setSuccess(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setError(message);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthShell eyebrow="Account Created" title="Check Your Email">
        <div>
          <p className="text-[11px] text-gray-500 uppercase tracking-widest leading-loose mb-10">
            We've sent a confirmation link to <strong>{email}</strong>. Please verify your email before signing in.
          </p>
          <Link
            href="/login"
            className="inline-block bg-black text-white px-12 py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-gray-800 transition-colors"
          >
            Go to Sign In
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell eyebrow="New Here" title="Create Account" image="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1400&q=80" quote="Members get early access to every new drop." footer={
        <div className="flex items-center justify-between gap-4">
          <span className="text-[10px] uppercase tracking-widest text-gray-400">Have an account?</span>
          <Link href="/login" className="text-[10px] font-bold uppercase tracking-[0.2em] border-b border-black pb-0.5 hover:opacity-50 transition-opacity">
            Sign In →
          </Link>
        </div>
      }>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 p-4">
              <p className="text-[10px] uppercase tracking-widest text-red-600 font-bold">{error}</p>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest font-bold text-gray-900">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border-b border-black/30 focus:border-black py-4 text-sm focus:outline-none placeholder:text-gray-300 transition-colors"
              placeholder="JANE DOE"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest font-bold text-gray-900">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-b border-black/30 focus:border-black py-4 text-sm focus:outline-none placeholder:text-gray-300 transition-colors"
              placeholder="YOU@EXAMPLE.COM"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest font-bold text-gray-900">Phone (optional)</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border-b border-black/30 focus:border-black py-4 text-sm focus:outline-none placeholder:text-gray-300 transition-colors"
              placeholder="+91 98765 43210"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest font-bold text-gray-900">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-b border-black/30 focus:border-black py-4 text-sm focus:outline-none placeholder:text-gray-300 transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white border border-black py-5 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-colors mt-8 disabled:bg-gray-400 disabled:border-gray-400 disabled:text-white"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
    </AuthShell>
  );
}
