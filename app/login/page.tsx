'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AuthShell from '@/components/AuthShell';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [redirect, setRedirect] = useState('/account');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const r = params.get('redirect');
    if (r) setRedirect(r);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;
      router.push(redirect);
      router.refresh();
    } catch (err) {
      const message = (err as { message?: string })?.message || 'Login failed';
      setError(message);
      setLoading(false);
    }
  };

  return (
    <AuthShell eyebrow="Welcome Back" title="Sign In" footer={
        <div className="flex items-center justify-between gap-4">
          <span className="text-[10px] uppercase tracking-widest text-gray-400">New to Beabeyond?</span>
          <Link href="/register" className="text-[10px] font-bold uppercase tracking-[0.2em] border-b border-black pb-0.5 hover:opacity-50 transition-opacity">
            Create Account →
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
            <label className="text-[10px] uppercase tracking-widest font-bold text-gray-900">Password</label>
            <input
              type="password"
              required
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
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
    </AuthShell>
  );
}
