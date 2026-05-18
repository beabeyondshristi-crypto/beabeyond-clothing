import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import { createClient } from '@/lib/supabase/server';
import type { HomepageSection } from '@/lib/types';

export default async function NewArrivals() {
  const supabase = await createClient();

  const sectionsRes = await supabase.from('homepage_sections').select('*').eq('page', 'new-arrivals').eq('is_visible', true).order('sort_order');
  const productsRes = await supabase.from('products').select('*').order('created_at', { ascending: false }).limit(6);

  const sections = (sectionsRes.data || []) as HomepageSection[];
  const newProducts = productsRes.data || [];
  const hero = sections.find(s => s.section_type === 'hero') || null;
  const content = sections.find(s => s.section_type === 'content') || null;

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />

      <main className="flex-grow">
        <section className="relative h-[60vh] md:h-[80vh] w-full border-b border-black overflow-hidden">
           <Image
             src={hero?.image_url || 'https://images.unsplash.com/photo-1570653321427-0e4d0c40bb84?auto=format&fit=crop&w=2000&q=80'}
             alt={hero?.title || 'New Arrivals'}
             fill
             className="object-cover object-center"
             priority
             unoptimized
           />
           <div className="absolute inset-0 bg-black/20" />
           <div className="absolute bottom-0 left-0 p-8 md:p-16 text-white max-w-2xl animate-in slide-in-from-bottom-8 duration-1000">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] mb-4 block">{(hero?.settings as Record<string, string>)?.badge || 'Collection 01'}</span>
              <h1 className="text-5xl md:text-8xl font-normal font-serif uppercase tracking-tighter leading-none mb-6">
                 {hero?.title || 'New Horizons'}
              </h1>
              <p className="text-xs md:text-sm font-light uppercase tracking-widest leading-relaxed border-l border-white pl-6">
                 {hero?.subtitle || 'Embrace the season with structured silhouettes.'}
              </p>
           </div>
        </section>

        <section className="py-20 px-8 md:px-24 border-b border-black bg-white flex flex-col md:flex-row gap-12 items-start">
           <div className="w-full md:w-1/3">
              <h2 className="text-2xl font-serif uppercase tracking-tighter">{content?.title || 'The Concept'}</h2>
           </div>
           <div className="w-full md:w-2/3">
              <p className="text-sm md:text-base font-light leading-relaxed text-gray-600 mb-8">
                 {content?.subtitle || 'This season, we explore the duality of soft and hard.'}
              </p>
              <Link href={content?.link_url || '/shop'} className="text-[10px] font-bold uppercase tracking-[0.2em] border-b border-black pb-1 hover:opacity-50">
                 {content?.link_text || 'View Lookbook'}
              </Link>
           </div>
        </section>

        <section className="py-12 px-6 md:px-12">
           <div className="flex justify-between items-end mb-12">
              <span className="text-[10px] text-gray-400 uppercase tracking-widest">{newProducts.length} Pieces</span>
              <div className="flex gap-4 text-[10px] font-bold uppercase tracking-[0.2em]">
                 <button className="text-black border-b border-black">Grid</button>
                 <button className="text-gray-400 hover:text-black transition-colors">List</button>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
              {newProducts.map((product, index) => (
                 <div key={product.id} className={`${index % 2 === 1 ? 'md:translate-y-12' : ''}`}>
                    <ProductCard product={product} />
                 </div>
              ))}
           </div>
        </section>

        <section className="py-32 border-t border-black flex flex-col items-center justify-center text-center bg-gray-50">
           <h2 className="text-4xl md:text-6xl font-serif uppercase tracking-tighter mb-8">Stay Updated</h2>
           <Link
             href="/collections"
             className="bg-black text-white px-12 py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-gray-800 transition-colors"
           >
             Explore Collections
           </Link>
        </section>
      </main>

      <footer className="py-12 px-6 md:px-12 bg-white border-t border-black text-center text-[9px] text-gray-400 uppercase tracking-[0.2em]">
          &copy; {new Date().getFullYear()} Beabeyond Retail Group.
      </footer>
    </div>
  );
}
