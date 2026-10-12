'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  image_url: string;
  link_url: string;
  link_text: string;
  settings: Record<string, unknown>;
}

const SLIDE_DURATION = 6000;
const pad = (n: number) => String(n).padStart(2, '0');

export default function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const go = useCallback(
    (dir: 1 | -1) => setCurrent((prev) => (prev + dir + slides.length) % slides.length),
    [slides.length],
  );

  useEffect(() => {
    if (slides.length <= 1 || paused) return;
    const timer = setTimeout(() => go(1), SLIDE_DURATION);
    return () => clearTimeout(timer);
  }, [current, paused, slides.length, go]);

  if (!slides.length) return null;

  const activeLayout = (slides[current].settings?.layout as string) || 'split';
  // Controls sit on white for split slides, on the photo otherwise
  const onLight = activeLayout === 'split';

  return (
    <section
      className="relative h-[calc(100svh-100px)] min-h-[560px] max-h-[1000px] w-full overflow-hidden border-b border-black"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
    >
      {slides.map((slide, index) => {
        const layout = (slide.settings?.layout as string) || 'split';
        const active = index === current;
        const badge = (slide.settings?.badge as string) || `Collection ${pad(index + 1)}`;
        const reveal = (delay: number) => ({
          className: active ? 'animate-fade-up' : 'opacity-0',
          style: active ? { animationDelay: `${delay}ms` } : undefined,
        });

        const image = (extra = '') => (
          <Image
            key={active ? `${slide.id}-on` : slide.id}
            src={slide.image_url}
            alt={slide.title}
            fill
            className={`object-cover ${extra} ${active ? 'animate-hero-zoom' : ''}`}
            priority={index === 0}
            unoptimized
          />
        );

        const meta = (light: boolean) => (
          <div style={reveal(150).style} className={`${reveal(150).className} flex items-center gap-4 mb-8 text-[9px] font-bold uppercase tracking-[0.4em] ${light ? 'text-white/70' : 'text-gray-400'}`}>
            <span>{badge}</span>
            <span className={`h-px w-10 ${light ? 'bg-white/40' : 'bg-black/20'}`} />
            <span>SS{new Date().getFullYear() % 100}</span>
          </div>
        );

        const ctas = (light: boolean, primary: string) => (
          <div style={reveal(600).style} className={`${reveal(600).className} flex flex-wrap items-center gap-x-8 gap-y-4`}>
            <Link href={slide.link_url || '/shop'} className={primary}>
              {slide.link_text || 'Shop Collection'}
            </Link>
            <Link
              href="/new-arrivals"
              className={`text-[10px] font-bold uppercase tracking-[0.2em] border-b pb-0.5 transition-opacity hover:opacity-50 ${light ? 'text-white border-white' : 'text-black border-black'}`}
            >
              New Arrivals
            </Link>
          </div>
        );

        return (
          <div
            key={slide.id}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${active ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}
            aria-hidden={!active}
          >
            {layout === 'split' && (
              <div className="grid grid-rows-[1fr_auto] md:grid-rows-1 md:grid-cols-12 h-full">
                <div className="relative overflow-hidden bg-gray-100 md:order-2 md:col-span-7 lg:col-span-6">
                  {image('object-[center_25%]')}
                </div>
                <div className="flex flex-col justify-center px-6 pt-10 pb-20 md:p-16 lg:p-20 bg-white md:col-span-5 lg:col-span-6 border-t md:border-t-0 md:border-r border-black md:order-1">
                  {meta(false)}
                  <h1 style={reveal(300).style} className={`${reveal(300).className} text-5xl md:text-7xl lg:text-8xl font-normal uppercase tracking-tighter leading-[0.85] mb-6 md:mb-8 font-serif text-black`}>
                    {slide.title}
                  </h1>
                  <p style={reveal(450).style} className={`${reveal(450).className} text-[11px] md:text-xs max-w-[300px] mb-8 md:mb-12 font-light tracking-widest uppercase leading-loose text-gray-500`}>
                    {slide.subtitle}
                  </p>
                  {ctas(false, 'inline-block bg-black text-white border border-black px-10 py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-colors')}
                </div>
              </div>
            )}

            {layout === 'fullscreen-center' && (
              <div className="relative h-full w-full flex items-center justify-center text-center overflow-hidden">
                {image()}
                <div className="absolute inset-0 bg-black/40" />
                <div className="relative z-10 px-6 md:p-12 text-white flex flex-col items-center">
                  {meta(true)}
                  <h1 style={reveal(300).style} className={`${reveal(300).className} text-6xl md:text-9xl font-normal uppercase tracking-tighter leading-[0.9] mb-6 font-serif`}>
                    {slide.title}
                  </h1>
                  <p style={reveal(450).style} className={`${reveal(450).className} text-[11px] md:text-xs font-light tracking-[0.3em] uppercase mb-10 max-w-lg mx-auto leading-loose`}>
                    {slide.subtitle}
                  </p>
                  {ctas(true, 'inline-block bg-white text-black px-12 py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-colors')}
                </div>
              </div>
            )}

            {layout === 'fullscreen-left' && (
              <div className="relative h-full w-full flex items-end justify-start overflow-hidden">
                {image()}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="relative z-10 px-6 pb-28 md:p-24 md:pb-28 text-white w-full md:w-2/3 lg:w-1/2">
                  {meta(true)}
                  <h1 style={reveal(300).style} className={`${reveal(300).className} text-6xl md:text-8xl font-normal uppercase tracking-tighter leading-[0.85] mb-8 font-serif`}>
                    {slide.title}
                  </h1>
                  <p style={reveal(450).style} className={`${reveal(450).className} text-[11px] md:text-xs font-light tracking-[0.2em] uppercase mb-10 border-l border-white pl-6 leading-loose max-w-sm`}>
                    {slide.subtitle}
                  </p>
                  {ctas(true, 'inline-block border border-white px-10 py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-colors text-white')}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {slides.length > 1 && (
        <div
          className={`absolute z-20 bottom-0 left-0 right-0 flex items-center gap-6 px-6 md:px-10 h-16 transition-colors duration-700 ${
            onLight ? 'text-black left-0 md:right-[58.333%] lg:right-1/2' : 'text-white left-0'
          }`}
        >
          <span className="text-[10px] font-bold tracking-[0.2em] tabular-nums">
            {pad(current + 1)} <span className="opacity-40">/ {pad(slides.length)}</span>
          </span>

          <div className="flex-1 flex gap-2">
            {slides.map((slide, idx) => (
              <button
                key={slide.id}
                onClick={() => setCurrent(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className="group relative flex-1 h-6 flex items-center"
              >
                <span className={`absolute inset-x-0 h-px ${onLight ? 'bg-black/20' : 'bg-white/30'}`} />
                <span
                  key={idx === current ? `active-${current}` : idx}
                  className={`absolute inset-x-0 h-px origin-left ${onLight ? 'bg-black' : 'bg-white'} ${idx < current ? 'scale-x-100' : 'scale-x-0'}`}
                  style={idx === current ? { animation: `progress ${SLIDE_DURATION}ms linear both`, animationPlayState: paused ? 'paused' : 'running' } : undefined}
                />
              </button>
            ))}
          </div>

          <div className="flex">
            <button onClick={() => go(-1)} aria-label="Previous slide" className={`w-10 h-10 border flex items-center justify-center text-sm transition-colors ${onLight ? 'border-black hover:bg-black hover:text-white' : 'border-white/60 hover:bg-white hover:text-black'}`}>
              ←
            </button>
            <button onClick={() => go(1)} aria-label="Next slide" className={`w-10 h-10 border border-l-0 flex items-center justify-center text-sm transition-colors ${onLight ? 'border-black hover:bg-black hover:text-white' : 'border-white/60 hover:bg-white hover:text-black'}`}>
              →
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
