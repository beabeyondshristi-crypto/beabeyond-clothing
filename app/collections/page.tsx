import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHeader from '@/components/PageHeader';
import { createClient } from '@/lib/supabase/server';

export default async function Collections() {
  const supabase = await createClient();

  const [{ data: collections }, { data: heroSections }, { data: memberships }] = await Promise.all([
    supabase.from('collections').select('*').order('name'),
    supabase.from('homepage_sections').select('*').eq('page', 'collections').eq('is_visible', true).eq('section_type', 'hero').order('sort_order').limit(1),
    supabase.from('collection_products').select('collection_id'),
  ]);

  const hero = (heroSections || [])[0] || null;
  const counts = (memberships || []).reduce<Record<string, number>>((acc, m) => {
    acc[m.collection_id] = (acc[m.collection_id] || 0) + 1;
    return acc;
  }, {});
  const list = collections || [];

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />
      <main className="flex-grow">
        <PageHeader
          crumbs={[{ name: 'Collections' }]}
          eyebrow="Curated Edits"
          title={hero?.title || 'Collections'}
          description={hero?.subtitle || 'Themed edits from the house — each one a complete point of view.'}
          meta={<span className="text-[10px] text-gray-400 uppercase tracking-widest">{String(list.length).padStart(2, '0')} Collections</span>}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 overflow-hidden">
          {list.map((collection, index) => (
            <Link href={`/collections/${collection.slug}`} key={collection.slug} className="group block bg-white border-b border-r border-black -mr-px reveal">
              <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
                {collection.image && (
                  <Image
                    src={collection.image}
                    alt={collection.name}
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    unoptimized
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <span className="absolute top-5 left-5 text-white/80 text-[9px] font-bold uppercase tracking-[0.4em] tabular-nums">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h2 className="absolute bottom-6 left-6 right-6 text-white text-3xl md:text-4xl font-serif font-normal uppercase tracking-tighter leading-none">
                  {collection.name}
                </h2>
              </div>
              <div className="flex items-center justify-between gap-6 px-6 py-5">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest leading-relaxed line-clamp-1">
                  {collection.description || 'Explore the edit'}
                </p>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] whitespace-nowrap group-hover:opacity-50 transition-opacity">
                  {counts[collection.id] ? `${counts[collection.id]} pieces` : 'Explore'} →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
