'use client';

import { useCart } from '@/context/CartContext';
import type { Product } from '@/lib/data';
import { swatchColor } from '@/lib/swatches';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import ProductReviews from './ProductReviews';
import LikeButton from './LikeButton';
import { trackViewOnce } from '@/lib/track';
import { availableStock, isSoldOut, isLowStock } from '@/lib/stock';

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3 text-[10px] uppercase tracking-widest text-gray-500 leading-relaxed">
          <span className="text-black mt-[2px]">•</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function ProductDetailsClient({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const images = (product.images || []).filter((img: string) => img && img.trim());
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || 'M');
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || '');
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(images[0] || '');
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [openSection, setOpenSection] = useState<string | null>('description');

  const soldOut = isSoldOut(product);
  const lowStock = isLowStock(product);
  const available = availableStock(product);

  useEffect(() => {
    trackViewOnce(product.id);
  }, [product.id]);

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        const res = await fetch(`/api/products?category=${encodeURIComponent(product.category)}&limit=5`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setRelatedProducts(data.filter((p: Product) => p.id !== product.id).slice(0, 4));
        }
      } catch (e) {
        console.error('Failed to fetch related products', e);
      }
    };
    fetchRelated();
  }, [product.category, product.id]);

  const descriptionLines = (product.description || '').split(/[.\n]/).map((s: string) => s.trim()).filter(Boolean);

  const sections = [
    {
      id: 'description',
      title: 'Description',
      body: (
        <div className="space-y-5">
          {descriptionLines.length > 0 && <Bullets items={descriptionLines} />}
          {product.highlights && product.highlights.length > 0 && <Bullets items={product.highlights} />}
        </div>
      ),
    },
    {
      id: 'care',
      title: 'Material & Care',
      body: (
        <div className="space-y-6">
          {product.fabric && (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest block mb-2">Material</span>
              <p className="text-[11px] text-gray-500 uppercase tracking-widest">{product.fabric}</p>
            </div>
          )}
          {product.care && product.care.length > 0 && (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest block mb-3">Care</span>
              <Bullets items={product.care} />
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'shipping',
      title: 'Shipping & Returns',
      body: (
        <Bullets
          items={[
            'Free standard shipping on orders over ₹200',
            'Dispatched within 2 business days',
            'Free returns within 14 days, unworn with tags',
          ]}
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col">
      <main className="flex-grow grid grid-cols-1 md:grid-cols-2">
        {/* Gallery */}
        <div className="relative bg-gray-50 border-b md:border-b-0 md:border-r border-black flex flex-col md:flex-row-reverse">
          <div className="relative flex-1 min-h-[65vh] flex items-center justify-center p-4">
            <div className="relative aspect-[3/4] h-[75vh] md:h-[85vh] w-auto max-h-full max-w-full overflow-hidden">
              {selectedImage ? (
                <Image
                  key={selectedImage}
                  src={selectedImage}
                  alt={product.name}
                  fill
                  className="object-cover animate-fade-in"
                  priority
                  unoptimized
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-[10px] uppercase tracking-widest">
                  No Image
                </div>
              )}
              {(soldOut || lowStock || product.is_new_arrival) && (
                <span className="absolute top-4 left-4 bg-white px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.2em]">
                  {soldOut ? 'Sold Out' : lowStock ? 'Few Left' : 'New'}
                </span>
              )}
            </div>
          </div>
          {images.length > 1 && (
            <div className="flex md:flex-col gap-2 p-4 overflow-x-auto md:overflow-y-auto bg-white md:bg-transparent border-t md:border-t-0 border-black/10">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  aria-label={`View image ${idx + 1}`}
                  className={`relative w-16 h-20 md:w-20 md:h-24 flex-shrink-0 border transition-all ${
                    selectedImage === img ? 'border-black opacity-100' : 'border-transparent opacity-50 hover:opacity-100'
                  }`}
                >
                  <Image src={img} alt={`${product.name} ${idx + 1}`} fill className="object-cover" unoptimized />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="bg-white">
          <div className="md:sticky md:top-16 px-6 py-10 md:p-14 lg:p-20">
            <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-[9px] uppercase tracking-[0.25em] text-gray-400 mb-10">
              <Link href="/" className="hover:text-black transition-colors">Home</Link>
              <span>/</span>
              <Link href="/shop" className="hover:text-black transition-colors">Shop</Link>
              <span>/</span>
              <Link href={`/shop?category=${encodeURIComponent(product.category)}`} className="hover:text-black transition-colors">{product.category}</Link>
            </nav>

            <div className="flex items-center justify-between mb-4">
              <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-gray-400">{product.category}</span>
              <LikeButton productId={product.id} className="w-10 h-10 border border-black/20 hover:border-black" />
            </div>
            <h1 className="text-4xl md:text-5xl font-normal font-serif uppercase tracking-tighter mb-5 leading-[0.95]">
              {product.name}
            </h1>
            <div className="flex items-baseline justify-between gap-4 pb-8 mb-8 border-b border-black">
              <p className="text-xl font-light tabular-nums">₹{product.price}</p>
              <p className={`text-[9px] font-bold uppercase tracking-[0.2em] ${soldOut ? 'text-gray-400' : 'text-black'}`}>
                {soldOut ? 'Sold Out' : lowStock ? `Only ${available} left` : 'In Stock'}
              </p>
            </div>

            <div className="space-y-8">
              {product.colors && product.colors.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest block mb-4">
                    Color — <span className="text-gray-400">{selectedColor}</span>
                  </span>
                  <div className="flex gap-3">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        title={color}
                        aria-label={color}
                        aria-pressed={selectedColor === color}
                        className={`w-9 h-9 p-1 border transition-colors ${selectedColor === color ? 'border-black' : 'border-transparent hover:border-black/30'}`}
                      >
                        <span className="block w-full h-full border border-black/15" style={{ backgroundColor: swatchColor(color) }} />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {product.sizes && product.sizes.length > 0 && (
                <div>
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest">Select Size</span>
                    <span className="text-[9px] uppercase tracking-[0.2em] text-gray-400">True to size</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        aria-pressed={selectedSize === size}
                        className={`min-w-[3.25rem] border py-3 px-4 text-[10px] font-bold transition-colors uppercase tracking-widest ${
                          selectedSize === size ? 'bg-black text-white border-black' : 'border-black/20 hover:border-black'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <div className="flex items-center border border-black/20">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    aria-label="Decrease quantity"
                    className="px-4 h-full hover:bg-gray-50 text-gray-500"
                  >
                    −
                  </button>
                  <span className="px-2 text-sm font-medium min-w-[2.5rem] text-center tabular-nums">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(available, quantity + 1))}
                    disabled={quantity >= available}
                    aria-label="Increase quantity"
                    className="px-4 h-full hover:bg-gray-50 text-gray-500"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => addToCart(product, quantity, { size: selectedSize, color: selectedColor })}
                  disabled={soldOut}
                  className="flex-1 bg-black text-white border border-black py-5 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-colors disabled:bg-gray-300 disabled:border-gray-300 disabled:text-white"
                >
                  {soldOut ? 'Sold Out' : `Add to Bag — ₹${product.price * quantity}`}
                </button>
              </div>

              <div className="grid grid-cols-3 border border-black/10 text-center text-[8px] font-bold uppercase tracking-[0.2em] text-gray-500">
                <span className="py-3">Free Shipping</span>
                <span className="py-3 border-x border-black/10">14-Day Returns</span>
                <span className="py-3">Secure Checkout</span>
              </div>
            </div>

            <div className="mt-12 border-t border-black">
              {sections.map((section) => (
                <div key={section.id} className="border-b border-black/10">
                  <button
                    onClick={() => setOpenSection(openSection === section.id ? null : section.id)}
                    aria-expanded={openSection === section.id}
                    className="w-full flex justify-between items-center py-5 text-left"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{section.title}</span>
                    <span className="text-gray-400 text-sm font-light">{openSection === section.id ? '−' : '+'}</span>
                  </button>
                  {openSection === section.id && <div className="pb-8 animate-fade-in">{section.body}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {relatedProducts.length > 0 && (
        <section className="px-6 md:px-12 py-20 border-t border-black bg-white">
          <div className="flex justify-between items-end mb-12 reveal">
            <div>
              <span className="block text-[9px] font-bold uppercase tracking-[0.4em] text-gray-400 mb-3">Complete The Look</span>
              <h2 className="text-3xl md:text-4xl font-serif uppercase tracking-tighter leading-none">You May Also Like</h2>
            </div>
            <Link href={`/shop?category=${encodeURIComponent(product.category)}`} className="hidden sm:inline text-[10px] font-bold border-b border-black pb-0.5 hover:opacity-50 transition-opacity uppercase tracking-widest">
              View All
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <ProductReviews />
    </div>
  );
}
