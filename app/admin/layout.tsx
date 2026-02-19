'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  if (isLoginPage) {
    return <div className="min-h-screen bg-white">{children}</div>;
  }

  const navLinks = [
    { name: 'Dashboard', href: '/admin' },
    { name: 'Products', href: '/admin/products' },
    { name: 'Collections', href: '/admin/collections' },
    { name: 'Orders', href: '/admin/orders' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-black text-white flex flex-col fixed inset-y-0">
        <div className="p-8 border-b border-white/10">
          <Link href="/" className="text-xl font-serif uppercase tracking-tighter">
            Beabeyond
          </Link>
          <p className="text-[9px] uppercase tracking-widest text-gray-500 mt-2">Admin Portal</p>
        </div>
        
        <nav className="flex-grow p-6 space-y-2">
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

        <div className="p-6 border-t border-white/10">
          <Link 
            href="/admin/login" 
            className="text-[10px] uppercase tracking-[0.2em] text-gray-500 hover:text-white transition-colors"
          >
            Logout
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow ml-64 min-h-screen">
        <header className="h-16 bg-white border-b border-black/5 flex items-center justify-between px-8 sticky top-0 z-10">
          <h1 className="text-sm font-bold uppercase tracking-[0.2em]">
            {navLinks.find(l => l.href === pathname)?.name || 'Admin'}
          </h1>
          <div className="flex items-center gap-4">
             <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-[10px] font-bold">
                AD
             </div>
          </div>
        </header>
        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
