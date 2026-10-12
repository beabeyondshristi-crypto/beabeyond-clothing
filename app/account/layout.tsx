'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import type { Customer } from '@/lib/types';

const accountLinks = [
  { name: 'Dashboard', href: '/account' },
  { name: 'Orders', href: '/account/orders' },
  { name: 'Profile', href: '/account/profile' },
  { name: 'Addresses', href: '/account/addresses' },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        router.push('/login');
        return;
      }
      const res = await fetch('/api/customers/me');
      const data = await res.json();
      if (data && data.id) setCustomer(data);
      setLoading(false);
    };
    checkAuth();
  }, [router]);

  const isActive = (href: string) => (href === '/account' ? pathname === href : pathname.startsWith(href));

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      <Navbar />

      {loading ? (
        <div className="flex-grow px-6 md:px-12 py-14">
          <div className="h-2 w-24 bg-gray-100 animate-pulse mb-6" />
          <div className="h-10 w-72 bg-gray-100 animate-pulse" />
        </div>
      ) : customer ? (
        <>
          <header className="border-b border-black px-6 md:px-12 pt-10 md:pt-14">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8">
              <div>
                <span className="block text-[9px] font-bold uppercase tracking-[0.4em] text-gray-400 mb-4">My Account</span>
                <h1 className="text-4xl md:text-6xl font-normal font-serif uppercase tracking-tighter leading-[0.9]">
                  Hello, {customer.name?.split(' ')[0] || 'There'}
                </h1>
              </div>
              <div className="flex items-center gap-6 text-[10px] uppercase tracking-widest">
                <span className="text-gray-400 truncate max-w-[200px]">{customer.email}</span>
                <button
                  onClick={async () => {
                    const supabase = createClient();
                    await supabase.auth.signOut();
                    router.push('/');
                    router.refresh();
                  }}
                  className="font-bold border-b border-black pb-0.5 hover:opacity-50 transition-opacity"
                >
                  Sign Out
                </button>
              </div>
            </div>

            <nav className="flex gap-8 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden -mb-px">
              {accountLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive(link.href) ? 'page' : undefined}
                  className={`shrink-0 pb-4 border-b text-[10px] uppercase tracking-[0.2em] font-bold transition-colors ${
                    isActive(link.href) ? 'text-black border-black' : 'text-gray-400 border-transparent hover:text-black'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </header>

          <main className="flex-grow px-6 md:px-12 py-12 md:py-16">
            <div className="max-w-5xl">{children}</div>
          </main>
        </>
      ) : (
        <div className="flex-grow" />
      )}

      <Footer />
    </div>
  );
}
