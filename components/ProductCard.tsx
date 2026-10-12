'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/lib/data';
import { useCart } from '@/context/CartContext';
import { swatchColor } from '@/lib/swatches';
import LikeButton from './LikeButton';
import { isSoldOut, isLowStock } from '@/lib/stock';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const [loaded, setLoaded] = useState(false);
  const images = (product.images || []).filter((img: string) => img && img.trim());
  const primaryImage = images[0] || null;
  const hoverImage = images[1] || null;
  const colors = product.colors || [];
  const soldOut = isSoldOut(product);
  const lowStock = isLowStock(product);

  return (
    <div className="group block relative reveal">
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-gray-50">
        <Link href={`/product/${product.id}`} className="absolute inset-0">
          {primaryImage ? (
            <>
              <Image
                src={primaryImage}
                alt={product.name}
                fill
                className={`object-cover object-center transition-all duration-700 group-hover:scale-[1.03] ${loaded ? '' : 'opacity-0'} ${hoverImage ? 'group-hover:opacity-0' : ''}`}
                onLoad={() => setLoaded(true)}
                sizes="(max-width: 768px) 50vw, 25vw"
                unoptimized
              />
              {hoverImage && (
                <Image
                  src={hoverImage}
                  alt={`${product.name} alternate view`}
                  fill
                  className="object-cover object-center transition-all duration-700 opacity-0 scale-[1.03] group-hover:opacity-100 group-hover:scale-100"
                  sizes="(max-width: 768px) 50vw, 25vw"
                  unoptimized
                />
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-[10px] uppercase tracking-widest">
              No Image
            </div>
          )}
        </Link>

        {/* Status tag */}
        {(soldOut || lowStock || product.is_new_arrival) && (
          <span className="absolute top-3 left-3 bg-white text-black px-2 py-1 text-[8px] font-bold uppercase tracking-[0.2em] pointer-events-none">
            {soldOut ? 'Sold Out' : lowStock ? 'Few Left' : 'New'}
          </span>
        )}

        <LikeButton productId={product.id} className="absolute top-3 right-3 w-8 h-8 bg-white/90 hover:bg-white" />

        {/* Quick Add */}
        {!soldOut && (
          <button
            onClick={(e) => {
              e.preventDefault();
              addToCart(product);
            }}
            className="absolute bottom-0 inset-x-0 bg-white/95 backdrop-blur-sm text-black py-3.5 text-[9px] font-bold uppercase tracking-[0.2em] border-t border-black translate-y-full group-hover:translate-y-0 focus:translate-y-0 transition-transform duration-300 hover:bg-black hover:text-white"
          >
            Quick Add +
          </button>
        )}
      </div>

      <Link href={`/product/${product.id}`} className="flex justify-between items-start gap-3 px-0.5 mt-4">
        <div className="min-w-0">
          <h3 className="text-[11px] font-medium uppercase tracking-wider text-black truncate">
            {product.name}
          </h3>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">{product.category}</p>
        </div>
        <p className="text-[11px] font-medium tracking-tight shrink-0">₹{product.price}</p>
      </Link>

      {colors.length > 1 && (
        <div className="flex items-center gap-1.5 mt-3 px-0.5">
          {colors.slice(0, 4).map((c) => (
            <span
              key={c}
              title={c}
              className="w-2.5 h-2.5 border border-black/20"
              style={{ backgroundColor: swatchColor(c) }}
            />
          ))}
          {colors.length > 4 && <span className="text-[9px] text-gray-400 ml-1">+{colors.length - 4}</span>}
        </div>
      )}
    </div>
  );
}
