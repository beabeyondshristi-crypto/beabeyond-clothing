'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/lib/data';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  return (
    <div className="group block transition-opacity duration-300 relative">
      <Link href={`/product/${product.id}`}>
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-gray-50 mb-3 border border-transparent group-hover:border-black/10 transition-colors">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            unoptimized 
          />
        </div>
      </Link>
      
      {/* Quick Add Button */}
      <button 
        onClick={(e) => {
          e.preventDefault();
          addToCart(product);
        }}
        className="absolute bottom-20 left-4 right-4 bg-white/90 backdrop-blur-sm text-black py-3 text-[9px] font-bold uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 border border-black/10 hover:bg-black hover:text-white"
      >
        Quick Add +
      </button>

      <div className="flex justify-between items-start px-0.5 mt-4">
        <div className="max-w-[75%]">
          <h3 className="text-[11px] font-medium uppercase tracking-wider text-black">
            {product.name}
          </h3>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">{product.category}</p>
        </div>
        <p className="text-[11px] font-medium tracking-tight">${product.price}</p>
      </div>
    </div>
  );
}
