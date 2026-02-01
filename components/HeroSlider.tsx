'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const slides = [
  {
    id: 1,
    type: 'split',
    image: 'https://images.unsplash.com/photo-1760512901586-f70030a53cd1?auto=format&fit=crop&w=1600&q=80',
    title: <>Spring<br/>2026</>,
    subtitle: 'Defined by sharp silhouettes and uncompromising monochrome.',
    theme: 'light', // Light background, dark text
    cta: 'Shop Collection'
  },
  {
    id: 2,
    type: 'fullscreen-center',
    image: 'https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?auto=format&fit=crop&w=2000&q=80', // Dark moody texture/fashion
    title: <>Night<br/>Mode</>,
    subtitle: 'Evening essentials for the modern minimalist.',
    theme: 'dark', // Dark background, white text
    cta: 'View Evening'
  },
  {
    id: 3,
    type: 'fullscreen-left',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=2000&q=80', // Street style/Editorial
    title: <>Urban<br/>Utility</>,
    subtitle: 'Functional layers for the city streets.',
    theme: 'dark',
    cta: 'Shop Outerwear'
  }
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000); // Change every 5 seconds
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative h-[85vh] w-full overflow-hidden border-b border-black">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
            index === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          {/* Layout: Split Screen */}
          {slide.type === 'split' && (
            <div className="grid grid-cols-1 grid-rows-2 md:grid-cols-2 md:grid-rows-1 h-full">
              <div className="flex flex-col justify-center p-6 md:p-16 bg-white h-full border-t md:border-t-0 border-r-0 md:border-r border-black order-2 md:order-1">
                <div className="animate-in slide-in-from-bottom-4 duration-700 fade-in fill-mode-both" style={{ animationDelay: '300ms' }}>
                    <h1 className="text-5xl md:text-8xl font-normal uppercase tracking-tighter leading-[0.85] mb-6 md:mb-8 font-serif text-black">
                    {slide.title}
                    </h1>
                    <p className="text-xs md:text-sm max-w-[280px] mb-8 md:mb-10 font-light tracking-widest uppercase leading-loose text-gray-500">
                    {slide.subtitle}
                    </p>
                    <Link 
                    href="/shop" 
                    className="inline-block border border-black px-8 md:px-10 py-3 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-black hover:text-white transition-colors text-black"
                    >
                    {slide.cta}
                    </Link>
                </div>
              </div>
              <div className="relative h-full bg-gray-100 order-1 md:order-2">
                <Image
                  src={slide.image}
                  alt="Hero"
                  fill
                  className="object-cover object-top"
                  priority={index === 0}
                  unoptimized
                />
              </div>
            </div>
          )}

          {/* Layout: Fullscreen Center */}
          {slide.type === 'fullscreen-center' && (
            <div className="relative h-full w-full flex items-center justify-center text-center">
              <Image
                src={slide.image}
                alt="Hero"
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute inset-0 bg-black/30" /> {/* Overlay */}
              <div className="relative z-10 p-12 text-white animate-in zoom-in-95 duration-1000 fade-in fill-mode-both">
                <h1 className="text-7xl md:text-9xl font-normal uppercase tracking-tighter leading-none mb-6 font-serif">
                  {slide.title}
                </h1>
                <p className="text-xs md:text-sm font-light tracking-[0.3em] uppercase mb-10 max-w-lg mx-auto">
                  {slide.subtitle}
                </p>
                <Link 
                  href="/shop" 
                  className="inline-block bg-white text-black px-12 py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-gray-200 transition-colors"
                >
                  {slide.cta}
                </Link>
              </div>
            </div>
          )}

          {/* Layout: Fullscreen Left */}
          {slide.type === 'fullscreen-left' && (
             <div className="relative h-full w-full flex items-end justify-start">
              <Image
                src={slide.image}
                alt="Hero"
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="relative z-10 p-12 md:p-24 text-white w-full md:w-1/2 animate-in slide-in-from-left-4 duration-700 fade-in fill-mode-both">
                <h1 className="text-6xl md:text-8xl font-normal uppercase tracking-tighter leading-[0.85] mb-8 font-serif">
                  {slide.title}
                </h1>
                <p className="text-xs md:text-sm font-light tracking-[0.2em] uppercase mb-10 border-l border-white pl-6">
                  {slide.subtitle}
                </p>
                <Link 
                  href="/shop" 
                  className="inline-block border border-white px-10 py-3 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-colors text-white"
                >
                  {slide.cta}
                </Link>
              </div>
            </div>
          )}
        </div>
      ))}
      
      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-4">
        {slides.map((_, idx) => (
            <button
                key={idx}
                onClick={() => setCurrent(idx)}
                className={`w-12 h-0.5 transition-colors duration-300 ${
                    idx === current ? 'bg-white' : 'bg-white/30'
                } ${slides[current].type === 'split' && idx === current ? '!bg-black' : ''} ${slides[current].type === 'split' && idx !== current ? '!bg-black/20' : ''}`}
            />
        ))}
      </div>
    </section>
  );
}
