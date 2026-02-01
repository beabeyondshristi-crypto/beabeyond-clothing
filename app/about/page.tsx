import Navbar from '@/components/Navbar';

export default function About() {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />
      <main className="flex-grow flex flex-col items-center justify-center p-12 text-center">
        <h1 className="text-4xl md:text-6xl font-normal font-serif uppercase tracking-tighter mb-8">About Beabeyond</h1>
        <p className="max-w-2xl text-sm font-light leading-relaxed uppercase tracking-wide text-gray-600">
          Founded in 2026, Beabeyond is a conceptual retail experience dedicated to the art of subtraction. 
          We believe that style is defined not by what you add, but by what you take away. 
          Our collections are a study in monochrome, structure, and timeless form.
        </p>
      </main>
      <footer className="py-6 border-t border-black text-center text-[9px] text-gray-400 uppercase tracking-[0.2em] w-full">
          © {new Date().getFullYear()} Beabeyond Retail Group.
      </footer>
    </div>
  );
}
