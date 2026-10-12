'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ToastProvider } from '@/components/admin/ui';
import type { AdminUser } from '@/lib/types';

const NAV = [
  {
    group: 'Overview',
    links: [
      { name: 'Dashboard', href: '/admin', hint: 'Today at a glance' },
      { name: 'Analytics', href: '/admin/analytics', hint: 'Sales, views & likes' },
    ],
  },
  {
    group: 'Content',
    links: [
      { name: 'Pages', href: '/admin/content', hint: 'Homepage & every route' },
      { name: 'Site Settings', href: '/admin/settings', hint: 'Banner, footer, contact' },
    ],
  },
  {
    group: 'Store',
    links: [
      { name: 'Products', href: '/admin/products', hint: 'Catalogue' },
      { name: 'Collections', href: '/admin/collections', hint: 'Curated edits' },
      { name: 'Orders', href: '/admin/orders', hint: 'Fulfilment' },
      { name: 'Inventory', href: '/admin/inventory', hint: 'Stock levels' },
      { name: 'Coupons', href: '/admin/coupons', hint: 'Discount codes' },
      { name: 'Customers', href: '/admin/customers', hint: 'Buyers' },
    ],
  },
];

const ALL_LINKS = NAV.flatMap((g) => g.links.map((l) => ({ ...l, group: g.group })));

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [state, setState] = useState<'loading' | 'ok' | 'forbidden'>('loading');
  const [menuOpen, setMenuOpen] = useState(false);

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (isLoginPage) return;
    fetch('/api/admin/auth')
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.authenticated) {
          setAdmin(data.user);
          setState('ok');
        } else if (res.status === 403) {
          setState('forbidden');
        } else {
          window.location.href = `/admin/login?redirect=${encodeURIComponent(pathname)}`;
        }
      })
      .catch(() => { window.location.href = '/admin/login'; });
    // Only re-check on entering the admin area, not on every route change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoginPage]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/admin/login';
  };

  if (isLoginPage) return <ToastProvider><div className="min-h-screen bg-white">{children}</div></ToastProvider>;

  if (state === 'loading') {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 animate-pulse">Loading studio…</p>
      </div>
    );
  }

  if (state === 'forbidden') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
        <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-gray-400 mb-4">Restricted</span>
        <h1 className="text-4xl font-serif uppercase tracking-tighter mb-4">No Admin Access</h1>
        <p className="text-xs text-gray-500 mb-8 max-w-sm">This account is not an administrator. Sign in with an admin account to continue.</p>
        <div className="flex gap-3">
          <button onClick={handleLogout} className="h-10 px-6 bg-black text-white text-[10px] font-bold uppercase tracking-[0.2em]">Switch Account</button>
          <Link href="/" className="h-10 px-6 border border-black flex items-center text-[10px] font-bold uppercase tracking-[0.2em]">Back to Store</Link>
        </div>
      </div>
    );
  }

  const isActive = (href: string) => (href === '/admin' ? pathname === href : pathname.startsWith(href));
  const current = ALL_LINKS.find((l) => isActive(l.href));

  const sidebar = (
    <>
      <div className="h-16 px-6 flex items-center justify-between border-b border-white/10">
        <Link href="/admin" className="text-xl font-serif uppercase tracking-tighter">Beabeyond</Link>
        <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-gray-500 border border-white/15 px-1.5 py-0.5">Studio</span>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-7">
        {NAV.map((group) => (
          <div key={group.group}>
            <p className="px-3 mb-2 text-[9px] font-bold uppercase tracking-[0.3em] text-gray-500">{group.group}</p>
            <ul className="space-y-0.5">
              {group.links.map((link) => {
                const active = isActive(link.href);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      aria-current={active ? 'page' : undefined}
                      className={`flex items-center justify-between px-3 py-2.5 text-[11px] uppercase tracking-[0.15em] transition-colors ${
                        active ? 'bg-white text-black font-bold' : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {link.name}
                      {active && <span className="w-1 h-1 bg-black" />}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10 space-y-3">
        <Link href="/" target="_blank" className="flex items-center justify-between px-3 py-2.5 text-[10px] font-bold uppercase tracking-[0.2em] border border-white/15 hover:bg-white hover:text-black transition-colors">
          View Store <span>↗</span>
        </Link>
        <div className="flex items-center gap-3 px-1">
          <div className="w-8 h-8 bg-white text-black flex items-center justify-center text-[11px] font-bold uppercase shrink-0">{admin?.name?.charAt(0) || 'A'}</div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold truncate">{admin?.name}</p>
            <p className="text-[9px] text-gray-500 truncate">{admin?.email}</p>
          </div>
          <button onClick={handleLogout} className="text-[9px] font-bold uppercase tracking-[0.15em] text-gray-500 hover:text-white" aria-label="Log out">Logout</button>
        </div>
      </div>
    </>
  );

  return (
    <ToastProvider>
      <div className="min-h-screen bg-[#fafafa] font-sans">
        <aside className="hidden lg:flex w-60 bg-black text-white flex-col fixed inset-y-0 left-0 z-40">{sidebar}</aside>

        {menuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-black/40" onClick={() => setMenuOpen(false)} />
            <aside className="relative w-64 bg-black text-white flex flex-col animate-fade-in">{sidebar}</aside>
          </div>
        )}

        <div className="lg:ml-60 min-h-screen flex flex-col">
          <header className="h-16 bg-white border-b border-black/10 flex items-center justify-between gap-4 px-5 md:px-8 sticky top-0 z-30">
            <div className="flex items-center gap-4 min-w-0">
              <button onClick={() => setMenuOpen(true)} className="lg:hidden w-6 h-6 flex flex-col justify-center gap-1.5" aria-label="Open menu">
                <span className="block h-px w-full bg-black" /><span className="block h-px w-full bg-black" />
              </button>
              <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] min-w-0">
                <span className="text-gray-400 hidden sm:inline">{current?.group || 'Studio'}</span>
                <span className="text-gray-300 hidden sm:inline">/</span>
                <span className="font-bold truncate">{current?.name || 'Admin'}</span>
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden md:inline text-[10px] text-gray-400">{current?.hint}</span>
              {admin?.role === 'superadmin' && <span className="text-[8px] font-bold uppercase tracking-widest border border-black/15 px-2 py-1">Superadmin</span>}
            </div>
          </header>
          <main className="flex-1 p-5 md:p-8">
            <div className="max-w-7xl mx-auto">{children}</div>
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
