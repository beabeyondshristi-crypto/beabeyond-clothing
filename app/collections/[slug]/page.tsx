'use client';

import { useState, useEffect, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import { products, collections } from '@/lib/data';

export default function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  // Unwrap params using React.use()
  const { slug } = use(params);
  
  const collection = collections.find(c => c.slug === slug);
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [sortOption, setSortOption] = useState('newest');

  // Filter Logic
  useEffect(() => {
    let result = [...products];

    // Filter by Collection Rule
    switch (slug) {
      case 'new-arrivals':
        result = result.slice(0, 12); // Mock new arrivals
        break;
      case 'essentials':
        result = result.filter(p => p.price < 100);
        break;
      case 'accessories':
        result = result.filter(p => p.category === 'Accessories');
        break;
      default:
        // If it's a valid collection but has no specific logic defined, maybe show all or nothing?
        // For now, let's just show all to avoid empty pages if we add more collections later without logic.
        break; 
    }

    // Apply Sort
    switch (sortOption) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
      default:
        result.sort((a, b) => parseInt(b.id) - parseInt(a.id));
        break;
    }

    setFilteredProducts(result);
  }, [slug, sortOption]);

  if (!collection) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />

      {/* Collection Hero */}
      <section className="relative h-[60vh] md:h-[70vh] w-full bg-gray-100 flex items-center justify-center overflow-hidden border-b border-black">
        <Image
            src={collection.image}
            alt={collection.name}
            fill
            className="object-cover"
            priority
            unoptimized
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 text-center text-white p-6 animate-in fade-in zoom-in-95 duration-1000">
            <h1 className="text-6xl md:text-8xl font-serif font-normal uppercase tracking-tighter mb-6">
                {collection.name}
            </h1>
            <div className="w-24 h-px bg-white mx-auto mb-8" />
            <p className="text-xs md:text-sm font-light uppercase tracking-[0.3em] max-w-lg mx-auto leading-loose">
                Explore our curated selection of {collection.name.toLowerCase()}, designed for the modern minimalist.
            </p>
        </div>
      </section>

      <main className="flex-grow">
         {/* Introduction Text */}
         <section className="py-24 px-6 md:px-12 border-b border-black bg-white text-center">
            <div className="max-w-4xl mx-auto">
                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-400 mb-6 block">The Philosophy</span>
                <p className="text-2xl md:text-4xl font-serif leading-tight uppercase tracking-tight text-gray-900 mb-8">
                  "Defined by sharp silhouettes, uncompromising monochrome palettes, and a dedication to functional luxury."
                </p>
                <div className="w-px h-16 bg-black mx-auto"></div>
            </div>
         </section>

         {/* Toolbar */}
         <div className="flex justify-between items-center px-6 py-6 md:px-12 border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur-sm z-40">
            <div className="flex gap-4 text-[10px] uppercase tracking-widest text-gray-500">
                <Link href="/" className="hover:text-black">Home</Link>
                <span>/</span>
                <Link href="/collections" className="hover:text-black">Collections</Link>
                <span>/</span>
                <span className="text-black font-bold">{collection.name}</span>
            </div>

            <select 
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="text-[10px] font-bold uppercase tracking-[0.2em] outline-none bg-transparent cursor-pointer hover:opacity-50"
            >
                <option value="newest">Sort: Newest</option>
                <option value="price-asc">Sort: Price Low</option>
                <option value="price-desc">Sort: Price High</option>
            </select>
         </div>

         {/* Grid */}
         <section className="p-6 md:p-12 border-b border-black">
            {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
                    {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                <div className="min-h-[30vh] flex flex-col items-center justify-center text-center">
                    <p className="text-xl font-serif italic mb-4 text-gray-400">No items available in this collection.</p>
                </div>
            )}
         </section>

         {/* Featured Highlight Section */}
         <section className="grid grid-cols-1 lg:grid-cols-2 border-b border-black">
             <div className="relative h-[600px] lg:h-auto border-b lg:border-b-0 lg:border-r border-black order-2 lg:order-1">
                 <Image 
                     src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80" 
                     alt="Collection Highlight"
                     fill
                     className="object-cover"
                     unoptimized
                 />
             </div>
             <div className="flex flex-col justify-center p-12 md:p-24 bg-white order-1 lg:order-2">
                 <span className="text-[9px] font-bold uppercase tracking-[0.4em] mb-6 text-gray-400">Spotlight</span>
                 <h2 className="text-4xl md:text-5xl font-serif font-normal uppercase tracking-tighter leading-none mb-8">
                     The {collection.name}<br/>Edit.
                 </h2>
                 <p className="text-xs font-light uppercase tracking-widest leading-loose text-gray-500 mb-12 max-w-md">
                     Discover the key pieces that define this season's {collection.name.toLowerCase()}. 
                     Meticulously crafted for the modern wardrobe.
                 </p>
                 <Link 
                     href="/shop" 
                     className="inline-block border border-black px-12 py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-colors text-center w-max"
                 >
                     View Lookbook
                 </Link>
             </div>
         </section>

         {/* Newsletter Section */}
         <section className="py-24 px-6 md:px-12 bg-black text-white flex flex-col items-center justify-center text-center">
            <h2 className="text-3xl md:text-4xl font-normal uppercase tracking-tighter mb-6 font-serif">Join The Club</h2>
            <p className="text-gray-400 max-w-xs mb-10 font-light text-[11px] uppercase tracking-widest leading-relaxed">
                Sign up for exclusive access to new drops and member-only sales.
            </p>
            <form className="w-full max-w-sm flex flex-col gap-4">
                <input 
                    type="email" 
                    placeholder="ENTER YOUR EMAIL" 
                    className="bg-transparent border border-white/30 p-4 text-white placeholder-gray-600 text-[10px] font-bold uppercase tracking-[0.2em] focus:outline-none focus:border-white transition-colors"
                />
                <button 
                    type="submit" 
                    className="bg-white text-black py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-gray-200 transition-colors"
                >
                    Subscribe
                </button>
            </form>
         </section>
      </main>

      <footer className="py-12 px-6 md:px-12 bg-white border-t border-black text-center text-[9px] text-gray-400 uppercase tracking-[0.2em]">
          © {new Date().getFullYear()} Beabeyond Retail Group.
      </footer>
    </div>
  );
}
