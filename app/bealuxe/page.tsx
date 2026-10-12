import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { createClient } from '@/lib/supabase/server';
import type { HomepageSection, Product } from '@/lib/types';

export default async function Essentials() {
  const supabase = await createClient();

  const sectionsRes = await supabase.from('homepage_sections').select('*').eq('page', 'bealuxe').eq('is_visible', true).order('sort_order');
  const productsRes = await supabase.from('products').select('*').order('created_at', { ascending: false });

  const sections = (sectionsRes.data || []) as HomepageSection[];
  const allProducts = (productsRes.data || []) as Product[];
  const content = sections.find(s => s.section_type === 'content') || null;
  // Bealuxe pieces are flagged is_essential; fall back to the latest pieces if none are flagged
  const flagged = allProducts.filter((p) => p.is_essential);
  const essentialProducts = (flagged.length > 0 ? flagged : allProducts).slice(0, 8);

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />

      <main className="flex-grow">
        <div className="flex flex-col lg:flex-row">
          <div className="w-full lg:w-5/12 lg:sticky lg:top-16 lg:h-[calc(100svh-64px)] border-b lg:border-b-0 lg:border-r border-black flex flex-col justify-between bg-gray-50">
            <div className="px-6 py-14 md:p-16">
              <span className="text-[9px] font-bold uppercase tracking-[0.4em] mb-6 block text-gray-400 animate-fade-up">
                {(content?.settings as Record<string, string>)?.badge || 'The Core Collection'}
              </span>
              <h1 className="text-5xl md:text-7xl font-normal font-serif uppercase tracking-tighter leading-[0.85] mb-8 animate-fade-up" style={{ animationDelay: '150ms' }}>
                {content?.title || 'Wardrobe Foundation.'}
              </h1>
              <p className="text-[11px] font-light uppercase tracking-widest leading-loose text-gray-500 mb-10 max-w-sm animate-fade-up" style={{ animationDelay: '300ms' }}>
                {content?.subtitle || 'Trends fade, but essentials remain.'}
              </p>
              <div className="flex items-center gap-8 animate-fade-up" style={{ animationDelay: '450ms' }}>
                <Link href={content?.link_url || '/shop'} className="bg-black text-white border border-black px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-colors">
                  {content?.link_text || 'Shop All Categories'}
                </Link>
                <span className="text-[10px] text-gray-400 uppercase tracking-widest tabular-nums">
                  {String(essentialProducts.length).padStart(2, '0')} Pieces
                </span>
              </div>
            </div>

            <div className="hidden lg:block relative w-full flex-1 min-h-[220px] max-h-[360px] border-t border-black overflow-hidden grayscale hover:grayscale-0 transition-all duration-700">
              <Image
                src={content?.image_url || 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80'}
                alt="Bealuxe mood"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          </div>

          <div className="w-full lg:w-7/12">
            <div className="grid grid-cols-2 gap-px bg-black/10">
              {essentialProducts.map((product, i) => (
                <div key={product.id} className="bg-white p-4 md:p-10">
                  <span className="block text-[9px] text-gray-400 tabular-nums mb-3">{String(i + 1).padStart(2, '0')}</span>
                  <ProductCard product={product} />
                </div>
              ))}

              <div className="bg-black text-white px-6 py-16 md:p-16 flex flex-col justify-center items-center text-center col-span-2">
                <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-gray-500 mb-5">Finishing Touches</span>
                <h2 className="text-3xl md:text-4xl font-serif uppercase tracking-tighter mb-8">Complete The Look</h2>
                <Link href="/shop?category=Accessories" className="bg-white text-black px-10 py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-gray-200 transition-colors">
                  Shop Accessories
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
