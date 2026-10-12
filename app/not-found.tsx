import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />
      <main className="flex-grow flex flex-col items-center justify-center text-center px-6 py-24 border-b border-black">
        <span className="font-serif text-[30vw] md:text-[16rem] leading-none text-black/5 select-none">404</span>
        <span className="block text-[9px] font-bold uppercase tracking-[0.4em] text-gray-400 -mt-6 md:-mt-12 mb-5">Page Not Found</span>
        <h1 className="text-4xl md:text-6xl font-serif uppercase tracking-tighter leading-none mb-6">Lost In The Edit</h1>
        <p className="text-[11px] text-gray-500 uppercase tracking-widest leading-loose max-w-sm mb-10">
          The page you are looking for has moved or no longer exists.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/shop" className="bg-black text-white border border-black px-10 py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-colors">
            Shop All
          </Link>
          <Link href="/" className="border border-black px-10 py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-colors">
            Home
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
