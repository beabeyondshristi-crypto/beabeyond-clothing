import Link from 'next/link';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import { createClient } from '@/lib/supabase/server';
import type { HomepageSection } from '@/lib/types';

export default async function Trending() {
  const supabase = await createClient();

  const sectionsRes = await supabase.from('homepage_sections').select('*').eq('page', 'trending').eq('is_visible', true).order('sort_order');
  const productsRes = await supabase.from('products').select('*').order('created_at', { ascending: false }).limit(8);

  const sections = (sectionsRes.data || []) as HomepageSection[];
  const allProducts = productsRes.data || [];
  const hero = sections.find(s => s.section_type === 'hero') || null;
  const trendingProducts = allProducts.reverse();

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />

      <main className="flex-grow">
        <section className="border-b border-black py-12 md:py-20 bg-black text-white overflow-hidden">
           <div className="container mx-auto px-6 md:px-12 text-center">
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] mb-4 block text-gray-400">{hero?.description || 'The Hot List'}</span>
              <h1 className="text-6xl md:text-9xl font-normal font-serif uppercase tracking-tighter leading-none">
                 {hero?.title || 'Most Wanted'}
              </h1>
              <p className="mt-8 text-xs md:text-sm font-bold uppercase tracking-[0.2em] max-w-lg mx-auto text-gray-400">
                 {hero?.subtitle || 'The pieces everyone is talking about.'}
              </p>
           </div>
        </section>

        <section className="p-4 md:p-8">
           <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">

              <div className="break-inside-avoid bg-gray-100 p-8 md:p-12 flex flex-col items-center justify-center text-center aspect-[3/4]">
                 <span className="text-6xl md:text-8xl font-serif text-black/10">#1</span>
                 <h2 className="text-3xl font-serif uppercase tracking-tighter mb-4">Top Rated</h2>
                 <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-6">Structured Shirt</p>
                 <Link href="/product/1" className="bg-black text-white px-8 py-3 text-[10px] font-bold uppercase tracking-[0.2em]">Shop Now</Link>
              </div>

              {trendingProducts.length > 0 && (
                <div className="break-inside-avoid relative">
                   <div className="absolute top-4 left-4 z-10 bg-black text-white px-3 py-1 text-[9px] font-bold uppercase tracking-widest">
                      Best Seller
                   </div>
                   <ProductCard product={trendingProducts[0]} />
                </div>
              )}

              {trendingProducts.length > 1 && (
                <div className="break-inside-avoid">
                   <ProductCard product={trendingProducts[1]} />
                </div>
              )}

              <div className="break-inside-avoid bg-black text-white p-12 flex flex-col justify-center text-center">
                 <p className="font-serif text-2xl italic leading-relaxed">
                    &quot;The silhouette of the season. Absolute perfection.&quot;
                 </p>
                 <span className="mt-4 text-[9px] font-bold uppercase tracking-widest text-gray-500">— Vogue</span>
              </div>

              {trendingProducts.length > 2 && (
                <div className="break-inside-avoid relative">
                   <span className="absolute -top-4 -left-4 text-8xl font-serif text-black/5 z-0">02</span>
                   <ProductCard product={trendingProducts[2]} />
                </div>
              )}

              {trendingProducts.length > 3 && (
                <div className="break-inside-avoid">
                   <ProductCard product={trendingProducts[3]} />
                </div>
              )}

               <div className="break-inside-avoid bg-gray-100 p-8 flex flex-col items-center justify-center text-center aspect-square">
                 <h2 className="text-2xl font-serif uppercase tracking-tighter mb-2">Selling Fast</h2>
                 <p className="text-[10px] uppercase tracking-widest text-red-500 font-bold mb-4">Low Stock on Accessories</p>
                 <Link href="/shop?category=accessories" className="border-b border-black text-[10px] font-bold uppercase tracking-[0.2em]">View All</Link>
              </div>

               {trendingProducts.slice(4).map((product) => (
                  <div key={product.id} className="break-inside-avoid">
                      <ProductCard product={product} />
                  </div>
               ))}

           </div>
        </section>

      </main>

      <footer className="py-12 px-6 md:px-12 bg-white border-t border-black text-center text-[9px] text-gray-400 uppercase tracking-[0.2em]">
          &copy; {new Date().getFullYear()} Beabeyond Retail Group.
      </footer>
    </div>
  );
}
