'use client';

import Link from 'next/link';
import { useState, useEffect, useRef, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import type { Product } from '@/lib/types';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import CartDrawer from './CartDrawer';
import Portal from './Portal';
import { createClient } from '@/lib/supabase/client';

interface SearchSuggestions {
  categories: string[];
  colors: string[];
  collections: { name: string; slug: string }[];
  products: Product[];
}

export default function Navbar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestions>({ categories: [], colors: [], collections: [], products: [] });
  const searchTimer = useRef<number>(0);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { setIsCartOpen, cartCount } = useCart();

  useEffect(() => {
    if (!isSearchOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsSearchOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isSearchOpen]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUser(data.user);
    });
  }, []);

  useEffect(() => {
    if (isSearchOpen || isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isSearchOpen, isMobileMenuOpen]);

  const fetchSuggestions = useCallback(async (q: string) => {
    try {
      const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (data && Array.isArray(data.products)) setSuggestions(data);
    } catch {}
  }, []);

  useEffect(() => {
    if (isSearchOpen) fetchSuggestions('');
  }, [isSearchOpen, fetchSuggestions]);

  useEffect(() => {
    if (searchQuery.trim() === '' && isSearchOpen) {
      fetchSuggestions('');
      return;
    }
    window.clearTimeout(searchTimer.current);
    searchTimer.current = window.setTimeout(() => fetchSuggestions(searchQuery), 200);
    return () => window.clearTimeout(searchTimer.current);
  }, [searchQuery, isSearchOpen, fetchSuggestions]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navLinks = [
    { name: 'Shop All', href: '/shop' },
    { name: 'New Arrivals', href: '/new-arrivals' },
    { name: 'Bealuxe', href: '/bealuxe' },
    { name: 'Trending', href: '/trending' },
    { name: 'Collections', href: '/collections' },
  ];

  const isActive = (href: string) => pathname === href || (href !== '/' && pathname.startsWith(`${href}/`));

  return (
    <>
      <nav className="w-full h-16 border-b border-black px-6 md:px-12 flex justify-between items-center bg-white/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center gap-12 h-full">
          <Link href="/" className="text-2xl font-normal tracking-tighter uppercase font-serif z-50 relative">
            Beabeyond
          </Link>

          {/* Desktop Menu - Product Related Only */}
          <div className="hidden md:flex gap-8 h-full text-xs font-normal uppercase tracking-[0.1em] text-gray-900">
            {navLinks.map(link => (
              <Link
                key={link.name}
                href={link.href}
                aria-current={isActive(link.href) ? 'page' : undefined}
                className="group relative flex items-center h-full"
              >
                {link.name}
                <span className={`absolute left-0 right-0 bottom-[-1px] h-px bg-black origin-left transition-transform duration-300 ${isActive(link.href) ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-6 md:gap-8 text-xs font-normal uppercase tracking-[0.1em] text-gray-900">
          <button onClick={() => setIsSearchOpen(true)} className="hover:opacity-50 transition-opacity">
            Search
          </button>
          <Link href={user ? '/account' : '/login'} className="hidden md:inline hover:opacity-50 transition-opacity">
            {user ? 'Account' : 'Sign In'}
          </Link>
          <button
            onClick={() => setIsCartOpen(true)}
            className="hover:opacity-50 transition-opacity tabular-nums"
            aria-label={`Open cart, ${cartCount} items`}
          >
            Cart ({cartCount})
          </button>

          <button
            className="md:hidden z-50 w-6 h-6 flex flex-col justify-center gap-1.5"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileMenuOpen}
          >
            <span className={`block h-px w-full bg-black transition-transform duration-300 ${isMobileMenuOpen ? 'translate-y-[3.5px] rotate-45' : ''}`} />
            <span className={`block h-px w-full bg-black transition-transform duration-300 ${isMobileMenuOpen ? '-translate-y-[3.5px] -rotate-45' : ''}`} />
          </button>
        </div>
      </nav>

      {/* Cart Drawer Component */}
      <CartDrawer />

      {/* Search Overlay */}
      {isSearchOpen && (
        <Portal>
        <div className="fixed inset-0 bg-white z-[60] flex justify-center animate-fade-in overflow-y-auto">
           <div className="relative w-full max-w-3xl mx-auto px-6 pt-24 md:pt-32">
             <div className="flex justify-between items-center mb-8">
               <span className="text-[10px] uppercase tracking-[0.3em] text-gray-400 font-bold">Search</span>
               <button onClick={() => setIsSearchOpen(false)} className="text-[10px] font-bold uppercase tracking-[0.2em] hover:opacity-50 transition-opacity">Close ✕</button>
             </div>

             <form onSubmit={handleSearchSubmit} className="relative">
               <input 
                 type="text" 
                 placeholder="Search products..." 
                 className="w-full text-xl md:text-2xl border-b border-black pb-4 pr-10 focus:outline-none placeholder:text-gray-200 uppercase tracking-wider"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 autoFocus
               />
               {searchQuery && (
                 <button type="submit" className="absolute right-0 bottom-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black">
                   Go
                 </button>
               )}
             </form>

             {/* Suggestion Chips — always show when search is open */}
             {!searchQuery && (
               <div className="mt-6">
                 <p className="text-[10px] uppercase tracking-[0.3em] text-gray-300 mb-4 font-bold">Try searching</p>
                 <div className="flex flex-wrap gap-2">
                   {suggestions.categories.map(cat => (
                     <button
                       key={cat}
                       onClick={() => setSearchQuery(cat)}
                       className="border border-black/10 px-4 py-2 text-[10px] uppercase tracking-wider hover:border-black hover:bg-black hover:text-white transition-colors"
                     >
                       {cat}
                     </button>
                   ))}
                   {suggestions.colors.map(color => (
                     <button
                       key={color}
                       onClick={() => setSearchQuery(color)}
                       className="border border-black/10 px-4 py-2 text-[10px] uppercase tracking-wider hover:border-black hover:bg-black hover:text-white transition-colors"
                     >
                       {color}
                     </button>
                   ))}
                   {suggestions.collections.map(col => (
                     <button
                       key={col.slug}
                       onClick={() => setSearchQuery(col.name)}
                       className="border border-black/10 px-4 py-2 text-[10px] uppercase tracking-wider hover:border-black hover:bg-black hover:text-white transition-colors"
                     >
                       {col.name}
                     </button>
                   ))}
                 </div>
               </div>
             )}

             {/* Suggestions Dropdown — filtered results when typing */}
             {searchQuery && (
               <div className="mt-2 border border-black/5 shadow-sm max-h-[60vh] overflow-y-auto">
                 {suggestions.products.length === 0 &&
                  suggestions.categories.length === 0 &&
                  suggestions.colors.length === 0 &&
                  suggestions.collections.length === 0 ? (
                   <div className="py-12 text-center">
                     <p className="text-[10px] uppercase tracking-widest text-gray-300">No results for &quot;{searchQuery}&quot;</p>
                   </div>
                 ) : (
                   <div>
                     {/* Quick filter chips */}
                     {(suggestions.categories.length > 0 || suggestions.colors.length > 0 || suggestions.collections.length > 0) && (
                       <div className="px-4 py-3 border-b border-black/5">
                         <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-2">Quick filters</p>
                         <div className="flex flex-wrap gap-2">
                           {suggestions.categories.map(cat => (
                             <button
                               key={cat}
                               onClick={() => setSearchQuery(cat)}
                               className="border border-black/10 px-3 py-1.5 text-[10px] uppercase tracking-wider hover:border-black transition-colors"
                             >
                               {cat}
                             </button>
                           ))}
                           {suggestions.colors.map(color => (
                             <button
                               key={color}
                               onClick={() => setSearchQuery(color)}
                               className="border border-black/10 px-3 py-1.5 text-[10px] uppercase tracking-wider hover:border-black transition-colors"
                             >
                               {color}
                             </button>
                           ))}
                           {suggestions.collections.map(col => (
                             <button
                               key={col.slug}
                               onClick={() => setSearchQuery(col.name)}
                               className="border border-black/10 px-3 py-1.5 text-[10px] uppercase tracking-wider hover:border-black transition-colors"
                             >
                               {col.name}
                             </button>
                           ))}
                         </div>
                       </div>
                     )}

                     {/* Product results */}
                     {suggestions.products.length > 0 && (
                       <div className="py-2">
                         <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-1 px-4">Products</p>
                         {suggestions.products.slice(0, 5).map(product => (
                           <Link
                             key={product.id}
                             href={`/product/${product.id}`}
                             onClick={() => setIsSearchOpen(false)}
                             className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                           >
                             {product.images[0] && (
                               <div className="relative w-10 h-14 bg-gray-50 shrink-0 overflow-hidden">
                                 <Image src={product.images[0]} alt={product.name} fill className="object-cover" unoptimized />
                               </div>
                             )}
                             <div className="min-w-0 flex-1">
                               <p className="text-sm truncate">{product.name}</p>
                               <p className="text-[9px] text-gray-400 uppercase tracking-wider truncate">{product.category}</p>
                             </div>
                             <p className="text-sm font-medium shrink-0">₹{product.price}</p>
                           </Link>
                         ))}
                         <Link
                           href={`/shop?q=${encodeURIComponent(searchQuery)}`}
                           onClick={() => setIsSearchOpen(false)}
                           className="block text-center py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black hover:bg-gray-50 transition-colors mt-1"
                         >
                           View all results
                         </Link>
                       </div>
                     )}
                   </div>
                 )}
               </div>
             )}
           </div>
        </div>
        </Portal>
      )}

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <Portal>
        <div className="fixed inset-x-0 top-16 bottom-0 bg-white z-40 flex flex-col md:hidden animate-fade-in overflow-y-auto">
          <nav className="flex flex-col border-b border-black">
            {navLinks.map((link, i) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-baseline justify-between px-6 py-5 border-t border-black/10 first:border-t-0 animate-fade-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <span className={`text-3xl font-serif font-normal uppercase tracking-tighter ${isActive(link.href) ? 'text-black' : 'text-black/80'}`}>{link.name}</span>
                <span className="text-[9px] text-gray-400 tabular-nums">{String(i + 1).padStart(2, '0')}</span>
              </Link>
            ))}
          </nav>
          <div className="grid grid-cols-2 border-b border-black text-[10px] font-bold uppercase tracking-[0.2em]">
            <Link href={user ? '/account' : '/login'} onClick={() => setIsMobileMenuOpen(false)} className="px-6 py-5 border-r border-black">
              {user ? 'Account' : 'Sign In'}
            </Link>
            <button onClick={() => { setIsMobileMenuOpen(false); setIsCartOpen(true); }} className="px-6 py-5 text-left">
              Cart ({cartCount})
            </button>
          </div>
          <p className="mt-auto px-6 py-8 text-[9px] text-gray-400 uppercase tracking-[0.3em]">Free shipping over ₹200 · Easy returns</p>
        </div>
        </Portal>
      )}
    </>
  );
}