'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { Product } from '@/lib/types';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import CartDrawer from './CartDrawer';
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
  const { setIsCartOpen, cartCount } = useCart();

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
      document.body.style.overflow = 'auto';
    }
  }, [isSearchOpen, isMobileMenuOpen]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSuggestions({ categories: [], colors: [], collections: [], products: [] });
      return;
    }
    window.clearTimeout(searchTimer.current);
    searchTimer.current = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        if (data && Array.isArray(data.products)) setSuggestions(data);
      } catch (e) {
        console.error('Search failed', e);
      }
    }, 300);
    return () => window.clearTimeout(searchTimer.current);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      router.push(`/shop?q=${searchQuery}`);
    }
  };

  const navLinks = [
    { name: 'Shop All', href: '/shop' },
    { name: 'New Arrivals', href: '/new-arrivals' },
    { name: 'Essentials', href: '/essentials' },
    { name: 'Trending', href: '/trending' },
    { name: 'Collections', href: '/collections' },
  ];

  return (
    <>
      <nav className="w-full border-b border-black py-4 px-6 md:px-12 flex justify-between items-center bg-white sticky top-0 z-50">
        <div className="flex items-center gap-12">
          <Link href="/" className="text-2xl font-normal tracking-tighter uppercase font-serif z-50 relative">
            Beabeyond
          </Link>
          
          {/* Desktop Menu - Product Related Only */}
          <div className="hidden md:flex gap-8 text-xs font-normal uppercase tracking-[0.1em] text-gray-900">
            {navLinks.map(link => (
              <Link key={link.name} href={link.href} className="hover:text-gray-500 transition-colors">
                {link.name}
              </Link>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-6 md:gap-8 text-xs font-normal uppercase tracking-[0.1em] text-gray-900">
          <button onClick={() => setIsSearchOpen(true)} className="hover:text-gray-500 transition-colors">
            Search
          </button>
          <Link href={user ? '/account' : '/login'} className="hidden md:inline hover:text-gray-500 transition-colors">
            {user ? 'Account' : 'Sign In'}
          </Link>
          <button 
            onClick={() => setIsCartOpen(true)}
            className="hover:text-gray-500 transition-colors"
          >
            Cart ({cartCount})
          </button>
          
          <button 
            className="md:hidden z-50 text-xl leading-none"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {/* Cart Drawer Component */}
      <CartDrawer />

      {/* Search Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-white z-[60] flex justify-center animate-in fade-in duration-200">
           <div className="relative w-full max-w-3xl mx-auto px-6 pt-24 md:pt-32">
             <div className="flex justify-between items-center mb-8">
               <span className="text-[10px] uppercase tracking-[0.3em] text-gray-300 font-bold">Search</span>
               <button onClick={() => setIsSearchOpen(false)} className="text-lg font-light hover:opacity-50 transition-opacity">✕</button>
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

             {/* Suggestions Dropdown */}
             {searchQuery && (
               <div className="mt-2 border border-black/5 shadow-sm max-h-[65vh] overflow-y-auto">
                 {suggestions.products.length === 0 &&
                  suggestions.categories.length === 0 &&
                  suggestions.colors.length === 0 &&
                  suggestions.collections.length === 0 ? (
                   <div className="py-12 text-center">
                     <p className="text-[10px] uppercase tracking-widest text-gray-300">No results for &quot;{searchQuery}&quot;</p>
                   </div>
                 ) : (
                   <div className="divide-y divide-black/5">

                     {/* Categories */}
                     {suggestions.categories.length > 0 && (
                       <div className="px-4 py-3">
                         <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-2">Categories</p>
                         <div className="flex flex-wrap gap-2">
                           {suggestions.categories.map(cat => (
                             <Link
                               key={cat}
                               href={`/shop?category=${encodeURIComponent(cat)}`}
                               onClick={() => setIsSearchOpen(false)}
                               className="border border-black/10 px-3 py-1.5 text-[10px] uppercase tracking-wider hover:border-black hover:bg-black hover:text-white transition-colors"
                             >
                               {cat}
                             </Link>
                           ))}
                         </div>
                       </div>
                     )}

                     {/* Colors */}
                     {suggestions.colors.length > 0 && (
                       <div className="px-4 py-3">
                         <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-2">Colors</p>
                         <div className="flex flex-wrap gap-2">
                           {suggestions.colors.map(color => (
                             <Link
                               key={color}
                               href={`/shop?q=${encodeURIComponent(color)}`}
                               onClick={() => setIsSearchOpen(false)}
                               className="border border-black/10 px-3 py-1.5 text-[10px] uppercase tracking-wider hover:border-black transition-colors"
                             >
                               {color}
                             </Link>
                           ))}
                         </div>
                       </div>
                     )}

                     {/* Collections */}
                     {suggestions.collections.length > 0 && (
                       <div className="px-4 py-3">
                         <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-2">Collections</p>
                         <div className="flex flex-wrap gap-2">
                           {suggestions.collections.map(col => (
                             <Link
                               key={col.slug}
                               href={`/collections/${col.slug}`}
                               onClick={() => setIsSearchOpen(false)}
                               className="border border-black/10 px-3 py-1.5 text-[10px] uppercase tracking-wider hover:border-black transition-colors"
                             >
                               {col.name}
                             </Link>
                           ))}
                         </div>
                       </div>
                     )}

                     {/* Products */}
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
      )}

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-white z-40 flex flex-col justify-center items-center md:hidden animate-in slide-in-from-right duration-300">
           <div className="flex flex-col gap-10 text-3xl font-serif font-normal uppercase tracking-tighter text-center">
              {navLinks.map(link => (
                <Link key={link.name} href={link.href} onClick={() => setIsMobileMenuOpen(false)}>
                  {link.name}
                </Link>
              ))}
              <Link href={user ? '/account' : '/login'} onClick={() => setIsMobileMenuOpen(false)} className="text-base font-sans tracking-[0.2em]">
                {user ? 'Account' : 'Sign In'}
              </Link>
           </div>
        </div>
      )}
    </>
  );
}