'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;
      router.push('/account');
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
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
          <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400">Sign In to Your Account</p>
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
              className="w-full border-b border-black py-4 text-sm focus:outline-none placeholder:text-gray-200"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-5 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-gray-800 transition-colors mt-8 disabled:bg-gray-400"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 text-center space-y-4">
          <Link href="/register" className="block text-[10px] uppercase tracking-widest text-gray-600 hover:text-black underline underline-offset-4">
            Create an Account
          </Link>
          <Link href="/" className="block text-[9px] uppercase tracking-widest text-gray-400 hover:text-black transition-colors">
            Return to Store
          </Link>
        </div>
      </div>
    </div>
  );
}
