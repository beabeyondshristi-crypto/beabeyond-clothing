'use client';

import { useState } from 'react';

interface NewsletterProps {
  title?: string;
  subtitle?: string;
}

export default function Newsletter({
  title = 'Join The Club',
  subtitle = 'Sign up for exclusive access to new drops and member-only sales.',
}: NewsletterProps) {
  const [submitted, setSubmitted] = useState(false);

  return (
    <section className="py-24 px-6 md:px-12 bg-black text-white flex flex-col items-center justify-center text-center">
      <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-gray-500 mb-6 reveal">Newsletter</span>
      <h2 className="text-4xl md:text-6xl font-normal uppercase tracking-tighter mb-6 font-serif leading-none reveal">{title}</h2>
      <p className="text-gray-400 max-w-xs mb-10 font-light text-[11px] uppercase tracking-widest leading-relaxed">{subtitle}</p>
      {submitted ? (
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] border border-white/30 px-8 py-4">
          You&apos;re on the list — welcome.
        </p>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitted(true);
          }}
          className="w-full max-w-md flex flex-col sm:flex-row border border-white/30 focus-within:border-white transition-colors"
        >
          <input
            type="email"
            required
            aria-label="Email address"
            placeholder="ENTER YOUR EMAIL"
            className="flex-1 min-w-0 bg-transparent p-4 text-white placeholder-gray-600 text-[10px] font-bold uppercase tracking-[0.2em] focus:outline-none"
          />
          <button
            type="submit"
            className="bg-white text-black px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-gray-200 transition-colors"
          >
            Subscribe
          </button>
        </form>
      )}
    </section>
  );
}
