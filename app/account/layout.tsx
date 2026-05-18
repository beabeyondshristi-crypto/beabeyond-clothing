'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!customer) return null;

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-black">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-serif uppercase tracking-tighter">
            Beabeyond
          </Link>
          <div className="flex items-center gap-6 text-[10px] uppercase tracking-widest">
            <span className="text-gray-400">{customer.email}</span>
            <button
              onClick={async () => {
                const supabase = createClient();
                await supabase.auth.signOut();
                router.push('/');
                router.refresh();
              }}
              className="hover:text-red-600 transition-colors font-bold"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 flex flex-col md:flex-row gap-12">
        <nav className="md:w-48 shrink-0">
          <ul className="flex md:flex-col gap-6">
            {accountLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`text-[10px] uppercase tracking-[0.2em] font-bold transition-colors ${
                    pathname === link.href ? 'text-black' : 'text-gray-400 hover:text-black'
                  }`}
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
