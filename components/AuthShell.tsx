import Link from 'next/link';
import Image from 'next/image';

interface AuthShellProps {
  eyebrow: string;
  title: string;
  image?: string;
  quote?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

// Split-screen frame for sign-in / sign-up: editorial image on the left, form on the right
export default function AuthShell({
  eyebrow,
  title,
  image = 'https://images.unsplash.com/photo-1570653321427-0e4d0c40bb84?auto=format&fit=crop&w=1400&q=80',
  quote = 'Defined by sharp silhouettes and uncompromising monochrome.',
  children,
  footer,
}: AuthShellProps) {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white">
      <div className="relative hidden lg:block border-r border-black overflow-hidden">
        <Image src={image} alt="" fill className="object-cover animate-hero-zoom" priority unoptimized />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/20" />
        <Link href="/" className="absolute top-10 left-12 text-white text-3xl font-serif uppercase tracking-tighter">
          Beabeyond
        </Link>
        <div className="absolute bottom-12 left-12 right-12 text-white">
          <span className="block text-[9px] font-bold uppercase tracking-[0.4em] text-white/60 mb-5">SS{new Date().getFullYear() % 100} Collection</span>
          <p className="font-serif text-3xl xl:text-4xl uppercase tracking-tight leading-tight max-w-md">{quote}</p>
        </div>
      </div>

      <div className="flex flex-col min-h-screen">
        <div className="flex items-center justify-between px-6 md:px-12 h-16 border-b border-black">
          <Link href="/" className="text-2xl font-serif uppercase tracking-tighter lg:invisible">Beabeyond</Link>
          <Link href="/" className="text-[10px] font-bold uppercase tracking-[0.2em] hover:opacity-50 transition-opacity">
            ← Back to Store
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-16">
          <div className="w-full max-w-sm">
            <div className="mb-12">
              <span className="block text-[9px] font-bold uppercase tracking-[0.4em] text-gray-400 mb-4">{eyebrow}</span>
              <h1 className="text-4xl md:text-5xl font-serif uppercase tracking-tighter leading-[0.9]">{title}</h1>
            </div>
            {children}
            {footer && <div className="mt-10 pt-8 border-t border-black/10">{footer}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
