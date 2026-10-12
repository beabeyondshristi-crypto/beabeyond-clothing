import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { createClient } from '@/lib/supabase/server';
import type { HomepageSection, Product } from '@/lib/types';
import { isLowStock } from '@/lib/stock';

export default async function Trending() {
  const supabase = await createClient();

  const sectionsRes = await supabase.from('homepage_sections').select('*').eq('page', 'trending').eq('is_visible', true).order('sort_order');
  const productsRes = await supabase.from('products').select('*').order('created_at', { ascending: false });

  const sections = (sectionsRes.data || []) as HomepageSection[];
  const hero = sections.find(s => s.section_type === 'hero') || null;
  // Products flagged as trending lead the list, the rest fill it out
  const allProducts = (productsRes.data || []) as Product[];
  const trendingProducts = [
    ...allProducts.filter((p) => p.is_trending),
    ...allProducts.filter((p) => !p.is_trending),
  ].slice(0, 9);
  const [top, ...rest] = trendingProducts;
  const podium = rest.slice(0, 2);
  const remaining = rest.slice(2);
  const lowStock = allProducts.filter(isLowStock);

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />

      <main className="flex-grow">
        <section className="border-b border-black py-20 md:py-28 bg-black text-white overflow-hidden">
          <div className="px-6 md:px-12 text-center">
            <span className="text-[9px] font-bold uppercase tracking-[0.4em] mb-6 block text-gray-500 animate-fade-up">{hero?.description || 'The Hot List'}</span>
            <h1 className="text-6xl md:text-9xl font-normal font-serif uppercase tracking-tighter leading-none animate-fade-up" style={{ animationDelay: '150ms' }}>
              {hero?.title || 'Most Wanted'}
            </h1>
            <p className="mt-8 text-[11px] md:text-xs font-light uppercase tracking-[0.25em] max-w-lg mx-auto text-gray-400 leading-loose animate-fade-up" style={{ animationDelay: '300ms' }}>
              {hero?.subtitle || 'The pieces everyone is talking about.'}
            </p>
          </div>
        </section>

        {top && (
          <section className="grid grid-cols-1 lg:grid-cols-12 border-b border-black">
            <div className="lg:col-span-4 px-6 py-14 md:p-16 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-black bg-gray-50">
              <span className="font-serif text-8xl md:text-9xl leading-none text-black/10 tabular-nums">01</span>
              <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-gray-400 mt-6 mb-3">Number One This Week</span>
              <h2 className="text-3xl md:text-4xl font-serif uppercase tracking-tighter leading-none mb-4">{top.name}</h2>
              <p className="text-[11px] text-gray-500 uppercase tracking-widest leading-loose mb-8 max-w-xs">{top.description}</p>
              <Link
                href={`/product/${top.id}`}
                className="w-max bg-black text-white border border-black px-10 py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-colors"
              >
                Shop Now — ₹{top.price}
              </Link>
            </div>
            <div className="lg:col-span-8 grid grid-cols-2 lg:grid-cols-3 gap-6 p-6 md:p-12">
              <div className="relative">
                <span className="absolute top-14 right-3 z-10 bg-black text-white px-2 py-1 text-[8px] font-bold uppercase tracking-[0.2em] pointer-events-none">Best Seller</span>
                <ProductCard product={top} />
              </div>
              {podium.map((product, i) => (
                <div key={product.id}>
                  <span className="block font-serif text-3xl leading-none mb-3 text-black/15 tabular-nums">{String(i + 2).padStart(2, '0')}</span>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="px-6 py-16 md:p-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-14">
            {remaining.slice(0, 2).map((product, i) => (
              <div key={product.id}>
                <span className="block font-serif text-3xl leading-none mb-3 text-black/15 tabular-nums">{String(i + 4).padStart(2, '0')}</span>
                <ProductCard product={product} />
              </div>
            ))}

            <div className="col-span-2 bg-black text-white p-10 md:p-14 flex flex-col justify-center min-h-[320px] reveal">
              <span className="font-serif text-6xl leading-none text-white/20 mb-4">&ldquo;</span>
              <p className="font-serif text-2xl md:text-3xl italic leading-snug">
                The silhouette of the season. Absolute perfection.
              </p>
              <span className="mt-6 text-[9px] font-bold uppercase tracking-[0.4em] text-gray-500">— Vogue</span>
            </div>

            {remaining.slice(2).map((product, i) => (
              <div key={product.id}>
                <span className="block font-serif text-3xl leading-none mb-3 text-black/15 tabular-nums">{String(i + 6).padStart(2, '0')}</span>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 border-t border-black">
          <div className="px-6 py-16 md:p-20 bg-gray-50 flex flex-col justify-center border-b md:border-b-0 md:border-r border-black reveal">
            <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-gray-400 mb-6">Selling Fast</span>
            <h2 className="text-3xl md:text-5xl font-serif uppercase tracking-tighter leading-none mb-6">Almost Gone</h2>
            <p className="text-[11px] text-gray-500 uppercase tracking-widest leading-loose mb-8">
              {lowStock.length > 0
                ? `Only a few left of ${lowStock.slice(0, 2).map((p) => p.name).join(' and ')}.`
                : 'Our most wanted pieces sell through quickly — don’t wait.'}
            </p>
            <Link
              href={lowStock[0] ? `/product/${lowStock[0].id}` : '/shop'}
              className="w-max text-[10px] font-bold uppercase tracking-[0.2em] border-b border-black pb-0.5 hover:opacity-50 transition-opacity"
            >
              Shop Before It&apos;s Gone →
            </Link>
          </div>
          <div className="px-6 py-16 md:p-20 flex flex-col justify-center reveal">
            <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-gray-400 mb-6">Fresh In</span>
            <h2 className="text-3xl md:text-5xl font-serif uppercase tracking-tighter leading-none mb-8">New Arrivals</h2>
            <Link
              href="/new-arrivals"
              className="w-max bg-black text-white border border-black px-10 py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-colors"
            >
              See What&apos;s New
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
