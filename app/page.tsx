import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import HeroSlider from '@/components/HeroSlider';
import { products } from '@/lib/data';
import { createClient } from '@/lib/supabase/server';

export default async function Home() {
  const newArrivals = products.slice(0, 4);
  const trending = products.slice(4, 8);

  const supabase = await createClient();
  const { data: sections } = await supabase
    .from('homepage_sections')
    .select('*')
    .eq('is_visible', true)
    .order('sort_order', { ascending: true });

  const heroSlides = (sections || []).filter(s => s.section_type === 'hero_slide').map(s => ({
    id: s.id,
    title: s.title,
    subtitle: s.subtitle,
    image_url: s.image_url,
    link_url: s.link_url,
    link_text: s.link_text,
    settings: typeof s.settings === 'string' ? JSON.parse(s.settings) : (s.settings || {}),
  }));

  const editorialBlocks = (sections || []).filter(s => s.section_type === 'editorial');
  const categorySpotlights = (sections || []).filter(s => s.section_type === 'category_spotlight');
  const newsletter = (sections || []).find(s => s.section_type === 'newsletter');

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />

      <main className="flex-grow">
        <HeroSlider slides={heroSlides} />

        <section className="py-20 border-b border-black">
          <div className="px-6 md:px-12 flex justify-between items-baseline mb-12">
            <h2 className="text-2xl font-normal uppercase tracking-tighter font-serif">Just Dropped</h2>
            <Link href="/shop" className="text-[10px] font-bold border-b border-black pb-0.5 hover:opacity-50 transition-opacity uppercase tracking-widest">
              View All
            </Link>
          </div>

          <div className="px-6 md:px-12">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-12">
              {newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>

        {editorialBlocks.map((block) => (
          <section key={block.id} className="border-b border-black">
            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[500px]">
              <div className="lg:col-span-4 bg-black text-white p-12 md:p-16 flex flex-col justify-center items-start border-b lg:border-b-0 lg:border-r border-white/10">
                {block.settings?.badge && (
                  <span className="text-[9px] font-bold uppercase tracking-[0.4em] mb-6 text-gray-500">{block.settings.badge}</span>
                )}
                <h2 className="text-4xl md:text-5xl font-normal uppercase tracking-tighter leading-none mb-6 font-serif">
                  {block.title}
                </h2>
                {block.subtitle && (
                  <p className="text-[11px] text-gray-400 mb-10 leading-relaxed uppercase tracking-widest font-light max-w-xs">
                    {block.subtitle}
                  </p>
                )}
                {block.description && (
                  <p className="text-[11px] text-gray-400 mb-10 leading-relaxed uppercase tracking-widest font-light max-w-xs">
                    {block.description}
                  </p>
                )}
                {block.link_url && (
                  <Link href={block.link_url} className="text-white border-b border-white pb-0.5 text-[10px] font-bold uppercase tracking-[0.2em] hover:text-gray-300 hover:border-gray-300 transition-colors">
                    {block.link_text || 'Read More'}
                  </Link>
                )}
              </div>

              <div className="lg:col-span-8 relative min-h-[400px]">
                <Image
                  src={block.image_url}
                  alt={block.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            </div>
          </section>
        ))}

        <section className="py-24 px-6 md:px-12 border-b border-black">
          <div className="mb-16 text-center">
            <h2 className="text-2xl font-normal uppercase tracking-tighter font-serif mb-2">Trending Now</h2>
            <p className="text-gray-400 uppercase tracking-[0.2em] text-[9px] font-bold">Most coveted pieces this week</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
            {trending.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {categorySpotlights.length > 0 && (
          <section className="grid grid-cols-1 md:grid-cols-2 border-b border-black">
            {categorySpotlights.map((spot, i) => (
              <div key={spot.id} className={`relative h-[550px] group overflow-hidden ${i === 0 ? 'border-b md:border-b-0 md:border-r border-black' : ''}`}>
                <Image
                  src={spot.image_url}
                  alt={spot.title}
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-105"
                  unoptimized
                />
                <div className="absolute inset-0 flex flex-col justify-end p-10 bg-gradient-to-t from-black/40 to-transparent">
                  <h3 className="text-white text-3xl font-normal uppercase tracking-tighter mb-4 font-serif">{spot.title}</h3>
                  <Link href={spot.link_url || '/shop'} className="text-white text-[10px] font-bold uppercase tracking-[0.2em] border-b border-white inline-block w-max hover:opacity-80 pb-0.5">
                    {spot.link_text || 'Shop Now'}
                  </Link>
                </div>
              </div>
            ))}
          </section>
        )}

        {newsletter?.is_visible !== false && (
          <section className="py-24 px-6 md:px-12 bg-black text-white flex flex-col items-center justify-center text-center">
            <h2 className="text-3xl md:text-4xl font-normal uppercase tracking-tighter mb-6 font-serif">{newsletter?.title || 'Join The Club'}</h2>
            <p className="text-gray-400 max-w-xs mb-10 font-light text-[11px] uppercase tracking-widest leading-relaxed">
              {newsletter?.subtitle || 'Sign up for exclusive access to new drops and member-only sales.'}
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
        )}
      </main>

      <footer className="py-16 px-6 md:px-12 bg-white flex flex-col md:flex-row justify-between gap-12 border-t border-black">
        <div className="flex flex-col gap-6 max-w-xs">
          <div className="uppercase font-normal tracking-tighter text-2xl font-serif">Beabeyond</div>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest leading-loose">
            Minimalism, structure, and timeless design.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-12 md:gap-20 text-[10px] font-bold uppercase tracking-[0.15em]">
          <div className="flex flex-col gap-3">
            <span className="text-gray-300 mb-1">Shop</span>
            <Link href="#" className="hover:opacity-50 transition-opacity">New Arrivals</Link>
            <Link href="#" className="hover:underline">Clothing</Link>
            <Link href="#" className="hover:underline">Accessories</Link>
          </div>
          <div className="flex flex-col gap-3">
            <span className="text-gray-300 mb-1">Help</span>
            <Link href="#" className="hover:opacity-50 transition-opacity">Shipping</Link>
            <Link href="#" className="hover:opacity-50 transition-opacity">Returns</Link>
            <Link href="#" className="hover:opacity-50 transition-opacity">Contact</Link>
          </div>
          <div className="flex flex-col gap-3">
            <span className="text-gray-300 mb-1">Social</span>
            <Link href="#" className="hover:opacity-50 transition-opacity">Instagram</Link>
            <Link href="#" className="hover:opacity-50 transition-opacity">TikTok</Link>
          </div>
        </div>
      </footer>
      <div className="py-6 border-t border-gray-100 text-center text-[9px] text-gray-400 uppercase tracking-[0.2em]">
        © {new Date().getFullYear()} Beabeyond Retail Group.
      </div>
    </div>
  );
}
