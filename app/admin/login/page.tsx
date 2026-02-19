'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For now, simulate successful login
    router.push('/admin');
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
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest font-bold text-gray-900">Email Address</label>
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
            className="w-full bg-black text-white py-5 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-gray-800 transition-colors mt-8"
          >
            Authorize
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
