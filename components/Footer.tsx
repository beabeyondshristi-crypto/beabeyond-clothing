'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DEFAULT_SITE_SETTINGS, type SiteSettings } from '@/lib/site-settings';

const columns = [
  {
    title: 'Shop',
    links: [
      { name: 'Shop All', href: '/shop' },
      { name: 'New Arrivals', href: '/new-arrivals' },
      { name: 'Trending', href: '/trending' },
      { name: 'Bealuxe', href: '/bealuxe' },
      { name: 'Collections', href: '/collections' },
    ],
  },
  {
    title: 'Account',
    links: [
      { name: 'Sign In', href: '/login' },
      { name: 'Create Account', href: '/register' },
      { name: 'Orders', href: '/account/orders' },
      { name: 'Addresses', href: '/account/addresses' },
    ],
  },
  {
    title: 'House',
    links: [
      { name: 'About', href: '/about' },
      { name: 'Shipping', href: '/about#shipping' },
      { name: 'Returns', href: '/about#returns' },
      { name: 'Contact', href: '/about#contact' },
    ],
  },
];

export default function Footer() {
  // Defaults render immediately; CMS values replace them once loaded
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);

  useEffect(() => {
    fetch('/api/site-settings')
      .then((r) => r.json())
      .then((data) => { if (data?.footer) setSettings(data); })
      .catch(() => {});
  }, []);

  const socials = [
    { name: 'Instagram', href: settings.footer.instagram },
    { name: 'TikTok', href: settings.footer.tiktok },
    { name: 'Pinterest', href: settings.footer.pinterest },
  ].filter((s) => s.href);

  return (
    <footer className="bg-white border-t border-black">
      <div className="grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-4 px-6 md:px-12 py-14 border-b lg:border-b-0 lg:border-r border-black flex flex-col justify-between gap-10">
          <div>
            <Link href="/" className="uppercase font-normal tracking-tighter text-3xl font-serif">
              Beabeyond
            </Link>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest leading-loose mt-5 max-w-xs">
              {settings.footer.tagline}
            </p>
            {settings.contact.email && (
              <a href={`mailto:${settings.contact.email}`} className="block text-[10px] font-bold uppercase tracking-[0.2em] mt-5 hover:opacity-50 transition-opacity">
                {settings.contact.email}
              </a>
            )}
          </div>
          <div className="flex gap-6 text-[10px] font-bold uppercase tracking-[0.2em]">
            {socials.map((s) => (
              <a key={s.name} href={s.href} target="_blank" rel="noreferrer" className="hover:opacity-50 transition-opacity">{s.name}</a>
            ))}
          </div>
        </div>

        <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-3">
          {columns.map((col, i) => (
            <div
              key={col.title}
              className={`px-6 md:px-12 py-14 border-black ${i < columns.length - 1 ? 'md:border-r' : ''} ${i === 0 ? 'border-r' : ''} ${i === 2 ? 'col-span-2 md:col-span-1 border-t md:border-t-0' : ''}`}
            >
              <span className="block text-[9px] font-bold uppercase tracking-[0.4em] text-gray-400 mb-6">{col.title}</span>
              <ul className="flex flex-col gap-3 text-[10px] font-bold uppercase tracking-[0.15em]">
                {col.links.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="hover:opacity-50 transition-opacity">{link.name}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-black px-6 md:px-12 py-5 flex flex-col md:flex-row gap-3 justify-between items-center text-[9px] text-gray-400 uppercase tracking-[0.2em]">
        <span>© {new Date().getFullYear()} Beabeyond Retail Group.</span>
        <span>India — INR ₹</span>
        <span>Secure payments · Free returns</span>
      </div>
    </footer>
  );
}
