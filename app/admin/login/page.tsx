'use client';

import { useState } from 'react';
import Link from 'next/link';
import AuthShell from '@/components/AuthShell';
import { createClient } from '@/lib/supabase/client';
import { USE_MOCK_DATA } from '@/lib/supabase/mock';
import { MOCK_ADMIN } from '@/lib/supabase/mock-data';

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

      const redirect = new URLSearchParams(window.location.search).get('redirect');
      window.location.href = redirect?.startsWith('/admin') ? redirect : '/admin';
    } catch (err) {
      let message = (err as { message?: string })?.message || 'Login failed';
      // Check if Supabase is reachable
      if (message.includes('fetch') || message.includes('network') || message.includes('Failed to fetch')) {
        message = `Cannot reach Supabase at ${process.env.NEXT_PUBLIC_SUPABASE_URL}. Make sure your Supabase instance is running.`;
      }
      setError(message);
      setLoading(false);
    }
  };

  return (
    <AuthShell eyebrow="Restricted Access" title="Admin" image="https://images.unsplash.com/photo-1570653321586-3bb42aaee967?auto=format&fit=crop&w=1400&q=80" quote="Beabeyond studio — store management." footer={
        <div className="space-y-4">
          <Link href="/" className="text-[9px] uppercase tracking-widest text-gray-400 hover:text-black transition-colors">
            Return to Public Site
          </Link>
        </div>
      }>
        {/* Demo credentials are a development convenience — never shown on a production build */}
        {(USE_MOCK_DATA || process.env.NODE_ENV !== 'production') && MOCK_ADMIN.password && (
          <div className="border border-black p-5 mb-10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-3">Demo Credentials</p>
                <p className="text-[11px] font-mono">{MOCK_ADMIN.email}</p>
                <p className="text-[11px] font-mono">{MOCK_ADMIN.password}</p>
              </div>
              <button
                type="button"
                onClick={() => { setEmail(MOCK_ADMIN.email); setPassword(MOCK_ADMIN.password); setError(''); }}
                className="shrink-0 bg-black text-white border border-black px-4 py-2.5 text-[9px] font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-colors"
              >
                Fill In
              </button>
            </div>
          </div>
        )}

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
              className="w-full border-b border-black/30 focus:border-black py-4 text-sm focus:outline-none placeholder:text-gray-300 transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white border border-black py-5 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-colors mt-8 disabled:bg-gray-400 disabled:border-gray-400 disabled:text-white"
          >
            {loading ? 'Authorizing...' : 'Authorize'}
          </button>
        </form>
    </AuthShell>
  );
}
