'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const supabase = createClient();

      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;

      // Verify session was stored before redirecting
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session) throw new Error('Session not created after login');

      window.location.href = '/admin';
    } catch (err) {
      let message = err instanceof Error ? err.message : 'Login failed';
      // Check if Supabase is reachable
      if (message.includes('fetch') || message.includes('network') || message.includes('Failed to fetch')) {
        message = `Cannot reach Supabase at ${process.env.NEXT_PUBLIC_SUPABASE_URL}. Make sure your Supabase instance is running.`;
      }
      setError(message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white">
      <div className="w-full max-w-sm">
        <div className="text-center mb-12">
          <Link href="/" className="text-4xl font-serif uppercase tracking-tighter mb-4 inline-block">
            Beabeyond
          </Link>
          <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400">Restricted Access</p>
        </div>

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
              className="w-full border-b border-black py-4 text-sm focus:outline-none placeholder:text-gray-200"
              placeholder="ADMIN@BEABEYOND.COM"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest font-bold text-gray-900">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-b border-black py-4 text-sm focus:outline-none placeholder:text-gray-200"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-5 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-gray-800 transition-colors mt-8 disabled:bg-gray-400"
          >
            {loading ? 'Authorizing...' : 'Authorize'}
          </button>
        </form>

        <div className="mt-12 text-center">
          <Link href="/" className="text-[9px] uppercase tracking-widest text-gray-400 hover:text-black transition-colors">
            Return to Public Site
          </Link>
        </div>
      </div>
    </div>
  );
}
