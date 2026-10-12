import Link from 'next/link';

interface Crumb {
  name: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  eyebrow?: string;
  description?: string;
  crumbs?: Crumb[];
  meta?: React.ReactNode;
  children?: React.ReactNode;
}

// Shared page intro: breadcrumb, eyebrow label, serif title and an optional right-hand slot
export default function PageHeader({ title, eyebrow, description, crumbs, meta, children }: PageHeaderProps) {
  return (
    <header className="border-b border-black px-6 md:px-12 pt-10 pb-10 md:pt-14 md:pb-12">
      {crumbs && crumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-[9px] uppercase tracking-[0.25em] text-gray-400 mb-8">
          <Link href="/" className="hover:text-black transition-colors">Home</Link>
          {crumbs.map((c) => (
            <span key={c.name} className="flex items-center gap-2">
              <span>/</span>
              {c.href ? (
                <Link href={c.href} className="hover:text-black transition-colors">{c.name}</Link>
              ) : (
                <span className="text-black font-bold">{c.name}</span>
              )}
            </span>
          ))}
        </nav>
      )}

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="max-w-2xl">
          {eyebrow && (
            <span className="block text-[9px] font-bold uppercase tracking-[0.4em] text-gray-400 mb-4">{eyebrow}</span>
          )}
          <h1 className="text-4xl md:text-6xl font-normal font-serif uppercase tracking-tighter leading-[0.9]">{title}</h1>
          {description && (
            <p className="text-[11px] text-gray-500 uppercase tracking-widest leading-loose mt-6 max-w-md">{description}</p>
          )}
        </div>
        {meta && <div className="flex items-center gap-6 shrink-0">{meta}</div>}
      </div>
      {children}
    </header>
  );
}
