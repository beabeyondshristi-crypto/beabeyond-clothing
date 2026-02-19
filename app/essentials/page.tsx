import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import { products } from '@/lib/data';

export default function Essentials() {
  const essentialProducts = products.filter(p => p.isEssential); 

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />
      
      <main className="flex-grow">
        <div className="flex flex-col lg:flex-row min-h-screen">
            
            {/* LEFT: Sticky Editorial Section */}
            <div className="w-full lg:w-1/2 lg:sticky lg:top-[74px] lg:h-[calc(100vh-74px)] border-b lg:border-b-0 lg:border-r border-black flex flex-col justify-between p-8 md:p-16 bg-gray-50">
                <div className="max-w-md">
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] mb-6 block text-gray-400">The Core Collection</span>
                    <h1 className="text-5xl md:text-7xl font-normal font-serif uppercase tracking-tighter leading-none mb-8">
                        Wardrobe<br/>Foundation.
                    </h1>
                    <p className="text-xs md:text-sm font-light leading-relaxed text-gray-600 mb-8 max-w-sm">
                        Trends fade, but essentials remain. Discover the pieces you&apos;ll reach for every single day. 
                        Impeccable tailoring, premium fabrics, and neutral tones designed to be mixed and matched.
                    </p>
                    <Link href="/shop" className="text-[10px] font-bold uppercase tracking-[0.2em] border-b border-black pb-1 hover:opacity-50 inline-block">
                        Shop All Categories
                    </Link>
                </div>
                
                {/* Decorative Image at bottom of sticky area */}
                <div className="hidden lg:block relative w-full h-64 mt-12 overflow-hidden filter grayscale hover:grayscale-0 transition-all duration-700">
                    <Image
                        src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80"
                        alt="Essentials Mood"
                        fill
                        className="object-cover"
                        unoptimized
                    />
                </div>
            </div>

            {/* RIGHT: Scrollable Product Feed */}
            <div className="w-full lg:w-1/2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-black/10 border-b border-black/10"> 
                    {/* gap-px with bg color creates inner borders */}
                    {essentialProducts.map((product) => (
                        <div key={product.id} className="bg-white p-6 md:p-12 hover:bg-gray-50 transition-colors border-b border-gray-100 lg:border-none">
                            <ProductCard product={product} />
                        </div>
                    ))}
                    
                    {/* Filler content to make list longer if needed */}
                    <div className="bg-white p-12 flex flex-col justify-center items-center text-center col-span-1 md:col-span-2">
                        <h3 className="text-2xl font-serif uppercase tracking-tighter mb-4">Complete The Look</h3>
                        <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-6">Discover matching accessories</p>
                        <Link href="/shop?category=accessories" className="bg-black text-white px-8 py-3 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-gray-800">
                            Shop Accessories
                        </Link>
                    </div>
                </div>
            </div>

        </div>
      </main>
      
      <footer className="py-12 px-6 md:px-12 bg-white border-t border-black text-center text-[9px] text-gray-400 uppercase tracking-[0.2em]">
          &copy; {new Date().getFullYear()} Beabeyond Retail Group.
      </footer>
    </div>
  );
}
