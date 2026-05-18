'use client';

import { useState } from 'react';
import Link from 'next/link';
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
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white">
        <div className="w-full max-w-sm text-center">
          <div className="text-6xl mb-8">✓</div>
          <h1 className="text-2xl font-serif uppercase tracking-tighter mb-4">Check Your Email</h1>
          <p className="text-xs text-gray-500 uppercase tracking-widest leading-relaxed mb-8">
            We've sent a confirmation link to <strong>{email}</strong>. Please verify your email before signing in.
          </p>
          <Link
            href="/login"
            className="inline-block bg-black text-white px-12 py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-gray-800 transition-colors"
          >
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white">
      <div className="w-full max-w-sm">
        <div className="text-center mb-12">
          <Link href="/" className="text-4xl font-serif uppercase tracking-tighter mb-4 inline-block">
            Beabeyond
          </Link>
          <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400">Create Your Account</p>
        </div>

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
              className="w-full border-b border-black py-4 text-sm focus:outline-none placeholder:text-gray-200"
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
              className="w-full border-b border-black py-4 text-sm focus:outline-none placeholder:text-gray-200"
              placeholder="YOU@EXAMPLE.COM"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest font-bold text-gray-900">Phone (optional)</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border-b border-black py-4 text-sm focus:outline-none placeholder:text-gray-200"
              placeholder="+1 (555) 000-0000"
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
              className="w-full border-b border-black py-4 text-sm focus:outline-none placeholder:text-gray-200"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-5 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-gray-800 transition-colors mt-8 disabled:bg-gray-400"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-8 text-center space-y-4">
          <Link href="/login" className="block text-[10px] uppercase tracking-widest text-gray-600 hover:text-black underline underline-offset-4">
            Already have an account? Sign In
          </Link>
          <Link href="/" className="block text-[9px] uppercase tracking-widest text-gray-400 hover:text-black transition-colors">
            Return to Store
          </Link>
        </div>
      </div>
    </div>
  );
}
