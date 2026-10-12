import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHeader from '@/components/PageHeader';
import { createClient } from '@/lib/supabase/server';
import { getSiteSettings } from '@/lib/admin-db';
import type { HomepageSection } from '@/lib/types';

const values = [
  ['Subtraction', 'Every seam, button and pocket has to earn its place. What remains is the essential form.'],
  ['Monochrome', 'A palette of black, white and stone lets silhouette and texture carry the design.'],
  ['Longevity', 'Small batches, considered fabrics and construction made to outlast the season.'],
];

export default async function About() {
  const supabase = await createClient();
  const [{ data }, settings] = await Promise.all([
    supabase.from('homepage_sections').select('*').eq('page', 'about').eq('is_visible', true).order('sort_order'),
    getSiteSettings(),
  ]);
  const sections = (data || []) as HomepageSection[];
  const hero = sections.find((s) => s.section_type === 'hero');
  const content = sections.find((s) => s.section_type === 'content');

  const help = [
    { id: 'shipping', title: 'Shipping', body: 'Free standard shipping on orders over ₹200. Orders are dispatched within 2 business days and arrive in 3–7 days across India.' },
    { id: 'returns', title: 'Returns', body: 'Changed your mind? Return unworn pieces with tags within 14 days for a full refund. Start a return from your account orders page.' },
    { id: 'contact', title: 'Contact', body: `Questions about sizing, an order or a piece? Write to ${settings.contact.email}${settings.contact.phone ? ` or call ${settings.contact.phone}` : ''} — we reply within one business day.` },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />
      <main className="flex-grow">
        <PageHeader
          crumbs={[{ name: 'About' }]}
          eyebrow={hero?.description || 'Est. 2026'}
          title={hero?.title || 'About Beabeyond'}
          description={hero?.subtitle || 'A conceptual retail house dedicated to the art of subtraction.'}
        />

        <section className="grid grid-cols-1 lg:grid-cols-2 border-b border-black">
          <div className="relative min-h-[420px] lg:min-h-[640px] border-b lg:border-b-0 lg:border-r border-black overflow-hidden">
            <Image
              src={content?.image_url || 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1400&q=80'}
              alt="Beabeyond studio"
              fill
              className="object-cover grayscale"
              unoptimized
            />
          </div>
          <div className="flex flex-col justify-center px-6 py-16 md:p-20 reveal">
            <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-gray-400 mb-6">{(content?.settings as Record<string, string>)?.badge || 'Our Philosophy'}</span>
            <p className="text-2xl md:text-4xl font-serif uppercase tracking-tight leading-tight mb-10">
              {content?.title || 'Style is defined not by what you add, but by what you take away.'}
            </p>
            <p className="text-[11px] text-gray-500 uppercase tracking-widest leading-loose max-w-md mb-10">
              {content?.subtitle || 'Founded in 2026, Beabeyond is a study in monochrome, structure and timeless form.'}
            </p>
            <Link href={content?.link_url || '/shop'} className="inline-block w-max bg-black text-white border border-black px-10 py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-colors">
              {content?.link_text || 'Shop The Collection'}
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 border-b border-black">
          {values.map(([title, body], i) => (
            <div key={title} className={`reveal px-6 md:px-12 py-14 md:py-20 border-black ${i < 2 ? 'border-b md:border-b-0 md:border-r' : ''}`}>
              <span className="block font-serif text-5xl text-black/15 mb-8 tabular-nums">{String(i + 1).padStart(2, '0')}</span>
              <h2 className="text-2xl font-serif uppercase tracking-tighter mb-4">{title}</h2>
              <p className="text-[11px] text-gray-500 uppercase tracking-widest leading-loose">{body}</p>
            </div>
          ))}
        </section>

        <section className="px-6 md:px-12 py-20 border-b border-black">
          <span className="block text-[9px] font-bold uppercase tracking-[0.4em] text-gray-400 mb-4">Client Services</span>
          <h2 className="text-3xl md:text-4xl font-serif uppercase tracking-tighter mb-12">How Can We Help</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-black border border-black">
            {help.map((item) => (
              <div key={item.id} id={item.id} className="bg-white p-8 md:p-10 scroll-mt-24 reveal">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] mb-4">{item.title}</p>
                <p className="text-[11px] text-gray-500 uppercase tracking-widest leading-loose">{item.body}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
