'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { AdminUser } from '@/lib/types';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  const isLoginPage = pathname === '/admin/login';

  const checkAuth = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      // Also try the server API as fallback
      try {
        const res = await fetch('/api/admin/auth');
        const data = await res.json();
        if (data.authenticated) {
          setAdmin(data.user);
          setLoading(false);
          return;
        }
      } catch {}
      window.location.href = '/admin/login';
      return;
    }

    // Check admin role from API (optional — falls back to allowing all auth users)
    try {
      const res = await fetch('/api/admin/auth');
      const data = await res.json();
      if (data.authenticated) {
        setAdmin(data.user);
      } else {
        // Fallback: let authenticated user in
        setAdmin({ id: user.id, email: user.email || '', name: user.email?.split('@')[0] || 'Admin', role: 'superadmin' });
      }
    } catch {
      // API failed — let authenticated user in
      setAdmin({ id: user.id, email: user.email || '', name: user.email?.split('@')[0] || 'Admin', role: 'superadmin' });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isLoginPage) {
      setLoading(false);
      return;
    }
    checkAuth();
  }, [isLoginPage, checkAuth]);

  if (isLoginPage) {
    return <div className="min-h-screen bg-white">{children}</div>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!admin) return null;

  const navLinks = [
    { name: 'Dashboard', href: '/admin' },
    { name: 'Homepage', href: '/admin/homepage' },
    { name: 'Products', href: '/admin/products' },
    { name: 'Collections', href: '/admin/collections' },
    { name: 'Orders', href: '/admin/orders' },
    { name: 'Inventory', href: '/admin/inventory' },
    { name: 'Analytics', href: '/admin/analytics' },
  ];

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/admin/login';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      <aside className="w-64 bg-black text-white flex flex-col fixed inset-y-0 z-50">
        <div className="p-8 border-b border-white/10">
          <Link href="/admin" className="text-xl font-serif uppercase tracking-tighter">
            Beabeyond
          </Link>
          <p className="text-[9px] uppercase tracking-widest text-gray-500 mt-2">Admin Portal</p>
        </div>

        <nav className="flex-grow p-6 space-y-1 overflow-y-auto">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`block px-4 py-3 text-xs uppercase tracking-widest transition-colors ${
                  isActive
                    ? 'bg-white text-black font-bold'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-white/10 space-y-3">
          <p className="text-[9px] text-gray-500 uppercase tracking-widest truncate">{admin.email}</p>
          <button
            onClick={handleLogout}
            className="text-[10px] uppercase tracking-[0.2em] text-gray-500 hover:text-white transition-colors block w-full text-left"
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-grow ml-64 min-h-screen">
        <header className="h-16 bg-white border-b border-black/5 flex items-center justify-between px-8 sticky top-0 z-40">
          <h1 className="text-sm font-bold uppercase tracking-[0.2em]">
            {navLinks.find(l => l.href === pathname)?.name || 'Admin'}
          </h1>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-gray-100 flex items-center justify-center text-[10px] font-bold uppercase">
              {admin.name.charAt(0)}
            </div>
            {admin.role === 'superadmin' && (
              <span className="text-[8px] uppercase tracking-widest text-gray-400 border border-gray-200 px-2 py-1">
                Superadmin
              </span>
            )}
          </div>
        </header>
        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
