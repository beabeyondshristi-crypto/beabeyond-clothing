import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { createClient } from '@/lib/supabase/server';
import type { HomepageSection } from '@/lib/types';

export default async function NewArrivals() {
  const supabase = await createClient();

  const sectionsRes = await supabase.from('homepage_sections').select('*').eq('page', 'new-arrivals').eq('is_visible', true).order('sort_order');
  const productsRes = await supabase.from('products').select('*').order('created_at', { ascending: false }).limit(9);

  const sections = (sectionsRes.data || []) as HomepageSection[];
  const newProducts = productsRes.data || [];
  const hero = sections.find(s => s.section_type === 'hero') || null;
  const content = sections.find(s => s.section_type === 'content') || null;

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />

      <main className="flex-grow">
        <section className="relative h-[calc(100svh-64px)] min-h-[520px] max-h-[900px] w-full border-b border-black overflow-hidden">
          <Image
            src={hero?.image_url || 'https://images.unsplash.com/photo-1570653321427-0e4d0c40bb84?auto=format&fit=crop&w=2000&q=80'}
            alt={hero?.title || 'New Arrivals'}
            fill
            className="object-cover object-center animate-hero-zoom"
            priority
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 px-6 pb-12 md:p-16 text-white flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-2xl">
              <span className="text-[9px] font-bold uppercase tracking-[0.4em] mb-5 block text-white/70 animate-fade-up">
                {(hero?.settings as Record<string, string>)?.badge || 'Collection 01'} — Just In
              </span>
              <h1 className="text-6xl md:text-8xl font-normal font-serif uppercase tracking-tighter leading-[0.85] mb-6 animate-fade-up" style={{ animationDelay: '150ms' }}>
                {hero?.title || 'New Horizons'}
              </h1>
              <p className="text-[11px] md:text-xs font-light uppercase tracking-widest leading-loose border-l border-white pl-6 max-w-md animate-fade-up" style={{ animationDelay: '300ms' }}>
                {hero?.subtitle || 'Embrace the season with structured silhouettes.'}
              </p>
            </div>
            <a
              href="#pieces"
              className="w-max border border-white px-10 py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-colors animate-fade-up"
              style={{ animationDelay: '450ms' }}
            >
              {hero?.link_text || 'Shop Now'} ↓
            </a>
          </div>
        </section>

        <section className="px-6 py-20 md:px-12 md:py-28 border-b border-black bg-white grid grid-cols-1 md:grid-cols-12 gap-10">
          <div className="md:col-span-4 reveal">
            <span className="block text-[9px] font-bold uppercase tracking-[0.4em] text-gray-400 mb-4">
              {(content?.settings as Record<string, string>)?.badge || 'Collection 01'}
            </span>
            <h2 className="text-3xl md:text-4xl font-serif uppercase tracking-tighter leading-none">{content?.title || 'The Concept'}</h2>
          </div>
          <div className="md:col-span-7 md:col-start-6 reveal">
            <p className="text-lg md:text-2xl font-serif leading-snug text-gray-800 mb-10">
              {content?.subtitle || 'This season, we explore the duality of soft and hard.'}
            </p>
            <Link href={content?.link_url || '/shop'} className="text-[10px] font-bold uppercase tracking-[0.2em] border-b border-black pb-1 hover:opacity-50 transition-opacity">
              {content?.link_text || 'View Lookbook'}
            </Link>
          </div>
        </section>

        <section id="pieces" className="py-16 px-6 md:px-12 scroll-mt-16">
          <div className="flex justify-between items-end mb-12 border-b border-black pb-6 reveal">
            <div>
              <span className="block text-[9px] font-bold uppercase tracking-[0.4em] text-gray-400 mb-3">Just Landed</span>
              <h2 className="text-3xl md:text-4xl font-serif uppercase tracking-tighter leading-none">The Pieces</h2>
            </div>
            <div className="flex items-center gap-6">
              <span className="text-[10px] text-gray-400 uppercase tracking-widest tabular-nums">{String(newProducts.length).padStart(2, '0')} Pieces</span>
              <Link href="/shop" className="hidden sm:inline text-[10px] font-bold uppercase tracking-[0.2em] border-b border-black pb-0.5 hover:opacity-50 transition-opacity">
                Shop All
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 md:gap-x-8 gap-y-14 md:pb-12">
            {newProducts.map((product, index) => (
              <div key={product.id} className={index % 3 === 1 ? 'lg:translate-y-12' : ''}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 border-t border-black">
          <div className="px-6 py-20 md:p-20 bg-black text-white flex flex-col justify-center">
            <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-gray-500 mb-6">Keep Exploring</span>
            <h2 className="text-4xl md:text-6xl font-serif uppercase tracking-tighter leading-none mb-10">Stay Updated</h2>
            <Link
              href="/collections"
              className="w-max bg-white text-black px-12 py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-gray-200 transition-colors"
            >
              Explore Collections
            </Link>
          </div>
          <Link href="/trending" className="group px-6 py-20 md:p-20 flex flex-col justify-center border-t md:border-t-0 md:border-l border-black hover:bg-gray-50 transition-colors">
            <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-gray-400 mb-6">Most Wanted</span>
            <span className="text-4xl md:text-6xl font-serif uppercase tracking-tighter leading-none mb-10">Trending Now</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] border-b border-black pb-0.5 w-max group-hover:opacity-50 transition-opacity">
              Shop The Hot List →
            </span>
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
