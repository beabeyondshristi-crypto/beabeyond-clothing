'use client';

import { useState, useEffect, useMemo, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Newsletter from '@/components/Newsletter';
import ProductCard from '@/components/ProductCard';
import ProductGridSkeleton from '@/components/ProductGridSkeleton';
import type { Product, Collection } from '@/lib/data';

export default function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);

  const [collection, setCollection] = useState<Collection | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [sortOption, setSortOption] = useState('newest');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [colRes, prodRes] = await Promise.all([
          fetch(`/api/collections/${slug}`),
          fetch(`/api/collections/${slug}/products`),
        ]);
        const colData = await colRes.json();
        const prodData = await prodRes.json();

        if (!colData || colData.error) {
          setCollection(null);
          return;
        }

        setCollection(colData);
        setProducts(Array.isArray(prodData) ? prodData : []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  const sorted = useMemo(() => {
    const list = [...products];
    switch (sortOption) {
      case 'price-asc': return list.sort((a, b) => a.price - b.price);
      case 'price-desc': return list.sort((a, b) => b.price - a.price);
      default: return list.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
    }
  }, [products, sortOption]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col font-sans">
        <Navbar />
        <div className="h-[50vh] md:h-[60vh] bg-gray-100 animate-pulse border-b border-black" />
        <div className="p-6 md:p-12">
          <ProductGridSkeleton count={4} className="grid-cols-2 lg:grid-cols-4" />
        </div>
      </div>
    );
  }

  if (!collection) {
    notFound();
  }

  const spotlightImage = products.find((p) => p.images?.[1])?.images[1] || collection.image;

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />

      <section className="relative h-[60vh] md:h-[70vh] w-full bg-gray-100 flex items-end overflow-hidden border-b border-black">
        {collection.image && (
          <Image
            src={collection.image}
            alt={collection.name}
            fill
            className="object-cover animate-hero-zoom"
            priority
            unoptimized
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="relative z-10 w-full px-6 md:px-12 pb-12 md:pb-16 text-white flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-3xl">
            <span className="block text-[9px] font-bold uppercase tracking-[0.4em] text-white/70 mb-5 animate-fade-up">The Collection</span>
            <h1 className="text-6xl md:text-8xl font-serif font-normal uppercase tracking-tighter leading-[0.85] animate-fade-up" style={{ animationDelay: '150ms' }}>
              {collection.name}
            </h1>
          </div>
          <p className="text-[11px] font-light uppercase tracking-[0.25em] max-w-sm leading-loose border-l border-white pl-6 animate-fade-up" style={{ animationDelay: '300ms' }}>
            {collection.description || `Explore our curated selection of ${collection.name.toLowerCase()}, designed for the modern minimalist.`}
          </p>
        </div>
      </section>

      <main className="flex-grow">
        <div className="flex justify-between items-center gap-4 px-6 h-14 md:px-12 border-b border-black sticky top-16 bg-white/95 backdrop-blur-sm z-30">
          <nav aria-label="Breadcrumb" className="flex gap-2 text-[9px] uppercase tracking-[0.25em] text-gray-400 min-w-0">
            <Link href="/" className="hover:text-black hidden sm:inline">Home</Link>
            <span className="hidden sm:inline">/</span>
            <Link href="/collections" className="hover:text-black">Collections</Link>
            <span>/</span>
            <span className="text-black font-bold truncate">{collection.name}</span>
          </nav>

          <div className="flex items-center gap-6 shrink-0">
            <span className="hidden md:inline text-[10px] text-gray-400 uppercase tracking-widest">{products.length} Pieces</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              aria-label="Sort products"
              className="text-[10px] font-bold uppercase tracking-[0.2em] outline-none bg-transparent cursor-pointer hover:opacity-50"
            >
              <option value="newest">Sort: Newest</option>
              <option value="price-asc">Sort: Price Low</option>
              <option value="price-desc">Sort: Price High</option>
            </select>
          </div>
        </div>

        <section className="p-6 md:p-12 border-b border-black">
          {sorted.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
              {sorted.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="min-h-[30vh] flex flex-col items-center justify-center text-center">
              <p className="text-2xl font-serif uppercase tracking-tighter mb-4">Coming Soon</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-8">No pieces in this collection yet.</p>
              <Link href="/shop" className="text-[10px] font-bold uppercase tracking-[0.2em] border-b border-black pb-0.5 hover:opacity-50">
                Shop All
              </Link>
            </div>
          )}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 border-b border-black">
          <div className="relative h-[480px] lg:h-auto lg:min-h-[600px] border-b lg:border-b-0 lg:border-r border-black order-2 lg:order-1 overflow-hidden group">
            {spotlightImage && (
              <Image
                src={spotlightImage}
                alt={`${collection.name} spotlight`}
                fill
                className="object-cover transition-transform duration-[2000ms] group-hover:scale-105"
                unoptimized
              />
            )}
          </div>
          <div className="flex flex-col justify-center px-6 py-16 md:p-24 bg-white order-1 lg:order-2 reveal">
            <span className="text-[9px] font-bold uppercase tracking-[0.4em] mb-6 text-gray-400">Spotlight</span>
            <h2 className="text-4xl md:text-5xl font-serif font-normal uppercase tracking-tighter leading-none mb-8">
              The {collection.name}<br />Edit.
            </h2>
            <p className="text-[11px] font-light uppercase tracking-widest leading-loose text-gray-500 mb-12 max-w-md">
              Discover the key pieces that define this season&apos;s {collection.name.toLowerCase()}.
              Meticulously crafted for the modern wardrobe.
            </p>
            <Link
              href="/shop"
              className="inline-block bg-black text-white border border-black px-12 py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-colors text-center w-max"
            >
              Shop All
            </Link>
          </div>
        </section>

        <Newsletter />
      </main>

      <Footer />
    </div>
  );
}
