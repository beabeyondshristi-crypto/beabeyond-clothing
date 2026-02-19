'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { products } from '@/lib/data';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import CartDrawer from './CartDrawer';

export default function Navbar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const { setIsCartOpen, cartCount } = useCart();

  useEffect(() => {
    if (isSearchOpen || isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isSearchOpen, isMobileMenuOpen]);

  // Compute search results during render
  const searchResults = searchQuery.trim() === '' 
    ? [] 
    : products.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 6);

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
        <div className="fixed inset-0 bg-white z-[60] flex flex-col animate-in fade-in duration-300">
           <div className="flex justify-end p-6 md:p-12">
             <button onClick={() => setIsSearchOpen(false)} className="text-2xl font-light hover:rotate-90 transition-transform">✕</button>
           </div>
           
           <div className="flex flex-col items-center px-6 mt-4 w-full max-w-7xl mx-auto h-full overflow-hidden">
             <form onSubmit={handleSearchSubmit} className="w-full border-b border-black pb-4 mb-16">
               <input 
                 type="text" 
                 placeholder="SEARCH PRODUCTS..." 
                 className="w-full text-3xl md:text-6xl font-serif uppercase tracking-tight placeholder-gray-200 focus:outline-none"
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 autoFocus
               />
             </form>

             {/* Larger Live Results */}
             <div className="w-full overflow-y-auto pb-32">
                {searchResults.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                    {searchResults.map(product => (
                      <Link 
                        key={product.id} 
                        href={`/product/${product.id}`}
                        onClick={() => setIsSearchOpen(false)}
                        className="group flex flex-col"
                      >
                        <div className="relative aspect-[3/4] bg-gray-50 mb-4 overflow-hidden border border-transparent group-hover:border-black transition-colors">
                           <Image 
                             src={product.images[0]} 
                             alt={product.name} 
                             fill 
                             className="object-cover transition-transform duration-700 group-hover:scale-105"
                             unoptimized
                           />
                        </div>
                        <h4 className="text-xs font-normal uppercase tracking-widest">{product.name}</h4>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">${product.price}</p>
                      </Link>
                    ))}
                  </div>
                ) : searchQuery && (
                   <div className="flex flex-col items-center justify-center py-20 text-gray-300">
                      <p className="text-xl font-serif italic uppercase tracking-widest">No matching items found</p>
                   </div>
                )}
             </div>
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
           </div>
        </div>
      )}
    </>
  );
}