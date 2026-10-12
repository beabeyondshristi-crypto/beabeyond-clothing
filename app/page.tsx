import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import HeroSlider from '@/components/HeroSlider';
import Footer from '@/components/Footer';
import Newsletter from '@/components/Newsletter';
import { createClient } from '@/lib/supabase/server';
import { getSiteSettings } from '@/lib/admin-db';

export default async function Home() {
  const supabase = await createClient();
  const settings = await getSiteSettings();

  const { data: allProducts } = await supabase.from('products').select('*').order('created_at', { ascending: false }).limit(8);
  const { data: catalogue } = await supabase.from('products').select('category, images').order('created_at', { ascending: false });
  const categories = Array.from(
    (catalogue || []).reduce((map, p) => {
      const entry = map.get(p.category) || { name: p.category, image: p.images?.[0] || '', count: 0 };
      entry.count += 1;
      if (!entry.image && p.images?.[0]) entry.image = p.images[0];
      return map.set(p.category, entry);
    }, new Map<string, { name: string; image: string; count: number }>()).values(),
  ).slice(0, 5);
  const newArrivals = (allProducts || []).slice(0, 4);
  const trending = (allProducts || []).slice(4, 8);
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

        {settings.announcement.enabled && settings.announcement.items.length > 0 && (
        <div className="bg-black text-white overflow-hidden border-b border-black" aria-label="Store highlights">
          <div className="flex w-max animate-marquee">
            {[0, 1].map((copy) => (
              <div key={copy} className="flex shrink-0" aria-hidden={copy === 1}>
                {settings.announcement.items.map((text) => (
                  <span key={text} className="flex items-center gap-10 pr-10 h-9 text-[9px] font-bold uppercase tracking-[0.3em] whitespace-nowrap">
                    {text}
                    <span className="w-1 h-1 bg-white/50" />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
        )}

        {categories.length > 0 && (
          <section className="py-20 border-b border-black">
            <div className="px-6 md:px-12 flex justify-between items-end mb-10 reveal">
              <div>
                <span className="block text-[9px] font-bold uppercase tracking-[0.4em] text-gray-400 mb-3">Shop By</span>
                <h2 className="text-3xl md:text-4xl font-normal uppercase tracking-tighter font-serif leading-none">Category</h2>
              </div>
              <Link href="/shop" className="text-[10px] font-bold border-b border-black pb-0.5 hover:opacity-50 transition-opacity uppercase tracking-widest">
                Shop All
              </Link>
            </div>

            <div className="px-6 md:px-12 flex md:grid md:grid-cols-5 gap-4 overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {categories.map((cat) => (
                <Link
                  key={cat.name}
                  href={`/shop?category=${encodeURIComponent(cat.name)}`}
                  className="group relative shrink-0 w-[62vw] sm:w-[40vw] md:w-auto snap-start reveal"
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-gray-50">
                    {cat.image && (
                      <Image
                        src={cat.image}
                        alt={cat.name}
                        fill
                        className="object-cover transition-transform duration-1000 group-hover:scale-105"
                        sizes="(max-width: 768px) 62vw, 20vw"
                        unoptimized
                      />
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
                  </div>
                  <div className="flex items-baseline justify-between mt-4 border-b border-black pb-3">
                    <span className="text-[11px] font-bold uppercase tracking-[0.2em]">{cat.name}</span>
                    <span className="text-[10px] text-gray-400 tabular-nums group-hover:text-black transition-colors">
                      {String(cat.count).padStart(2, '0')} →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="py-20 border-b border-black">
          <div className="px-6 md:px-12 flex justify-between items-end mb-12 reveal">
            <div>
              <span className="block text-[9px] font-bold uppercase tracking-[0.4em] text-gray-400 mb-3">This Week</span>
              <h2 className="text-3xl md:text-4xl font-normal uppercase tracking-tighter font-serif leading-none">Just Dropped</h2>
            </div>
            <Link href="/new-arrivals" className="text-[10px] font-bold border-b border-black pb-0.5 hover:opacity-50 transition-opacity uppercase tracking-widest">
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
            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[500px] lg:min-h-[600px]">
              <div className="lg:col-span-4 bg-black text-white p-12 md:p-16 flex flex-col justify-center items-start reveal border-b lg:border-b-0 lg:border-r border-white/10">
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

              <div className="lg:col-span-8 relative min-h-[400px] lg:min-h-[600px] overflow-hidden group">
                <Image
                  src={block.image_url}
                  alt={block.title}
                  fill
                  className="object-cover transition-transform duration-[2000ms] group-hover:scale-105"
                  unoptimized
                />
              </div>
            </div>
          </section>
        ))}

        <section className="py-24 px-6 md:px-12 border-b border-black">
          <div className="mb-16 text-center reveal">
            <span className="block text-[9px] font-bold uppercase tracking-[0.4em] text-gray-400 mb-3">The Hot List</span>
            <h2 className="text-3xl md:text-4xl font-normal uppercase tracking-tighter font-serif mb-4 leading-none">Trending Now</h2>
            <Link href="/trending" className="text-[10px] font-bold border-b border-black pb-0.5 hover:opacity-50 transition-opacity uppercase tracking-widest">
              View All
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
            {trending.map((product, i) => (
              <div key={product.id} className="relative">
                <span className="block font-serif text-4xl md:text-5xl leading-none mb-4 text-black/15 tabular-nums">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </section>

        {categorySpotlights.length > 0 && (
          <section className="grid grid-cols-1 md:grid-cols-2 border-b border-black">
            {categorySpotlights.map((spot, i) => (
              <div key={spot.id} className={`relative h-[480px] md:h-[640px] group overflow-hidden ${i === 0 ? 'border-b md:border-b-0 md:border-r border-black' : ''}`}>
                <Image
                  src={spot.image_url}
                  alt={spot.title}
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-105"
                  unoptimized
                />
                <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12 bg-gradient-to-t from-black/60 via-black/5 to-transparent">
                  <span className="text-white/70 text-[9px] font-bold uppercase tracking-[0.4em] mb-3">{String(i + 1).padStart(2, '0')} — Spotlight</span>
                  <h3 className="text-white text-4xl md:text-5xl font-normal uppercase tracking-tighter mb-5 font-serif leading-none reveal">{spot.title}</h3>
                  <Link href={spot.link_url || '/shop'} className="text-white text-[10px] font-bold uppercase tracking-[0.2em] border-b border-white inline-block w-max hover:opacity-80 pb-0.5">
                    {spot.link_text || 'Shop Now'} →
                  </Link>
                </div>
              </div>
            ))}
          </section>
        )}

        <section className="grid grid-cols-2 md:grid-cols-4 border-b border-black">
          {settings.services.slice(0, 4).map(({ title, text }, i) => (
            <div key={title} className={`reveal px-6 md:px-10 py-10 md:py-12 border-black ${i % 2 === 0 ? 'border-r' : 'md:border-r'} ${i < 2 ? 'border-b md:border-b-0' : ''} ${i === 3 ? 'md:border-r-0' : ''}`}>
              <span className="block text-[9px] text-gray-400 tabular-nums mb-4">{String(i + 1).padStart(2, '0')}</span>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] mb-2">{title}</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest leading-relaxed">{text}</p>
            </div>
          ))}
        </section>

        {newsletter?.is_visible !== false && (
          <Newsletter title={newsletter?.title || undefined} subtitle={newsletter?.subtitle || undefined} />
        )}
      </main>

      <Footer />
    </div>
  );
}
