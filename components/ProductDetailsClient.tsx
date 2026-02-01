'use client';

import { useCart } from '@/context/CartContext';
import { Product, products } from '@/lib/data';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import ProductCard from './ProductCard';
import ProductReviews from './ProductReviews';

export default function ProductDetailsClient({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState('M');
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(product.images[0]);

  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="flex flex-col">
      <main className="flex-grow grid grid-cols-1 md:grid-cols-2 min-h-[calc(100vh-80px)]">
        {/* Product Image */}
        <div className="relative bg-gray-50 min-h-[50vh] md:min-h-auto border-b md:border-b-0 md:border-r border-black flex flex-col">
           <div className="relative flex-grow">
             <Image
               src={selectedImage}
               alt={product.name}
               fill
               className="object-cover"
               priority
               unoptimized
             />
           </div>
           {/* Thumbnails */}
           {product.images.length > 1 && (
             <div className="flex gap-2 p-4 overflow-x-auto bg-white border-t border-gray-100">
               {product.images.map((img, idx) => (
                 <button
                   key={idx}
                   onClick={() => setSelectedImage(img)}
                   className={`relative w-20 h-24 flex-shrink-0 border transition-all ${
                     selectedImage === img ? 'border-black opacity-100' : 'border-transparent opacity-50 hover:opacity-100'
                   }`}
                 >
                   <Image
                     src={img}
                     alt={`${product.name} ${idx + 1}`}
                     fill
                     className="object-cover"
                     unoptimized
                   />
                 </button>
               ))}
             </div>
           )}
        </div>

        {/* Product Details */}
        <div className="flex flex-col p-8 md:p-16 lg:p-24 justify-center bg-white">
          <div className="mb-auto">
             <Link href="/shop" className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 hover:text-black mb-8 inline-block">
               ← Back to Shop
             </Link>
             <h1 className="text-4xl md:text-5xl font-normal font-serif uppercase tracking-tighter mb-4 leading-tight">
               {product.name}
             </h1>
             <p className="text-xl font-light mb-8">${product.price}</p>
             <div className="prose prose-sm max-w-none text-gray-500 mb-12 uppercase text-[10px] tracking-widest leading-loose font-light">
               <p>{product.description}</p>
             </div>
          </div>

          <div className="space-y-8">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest block mb-4">Select Size</span>
              <div className="grid grid-cols-4 gap-4">
                 {['S', 'M', 'L', 'XL'].map((size) => (
                   <button 
                     key={size}
                     onClick={() => setSelectedSize(size)}
                     className={`border py-3 text-[10px] font-bold transition-colors uppercase tracking-widest ${
                       selectedSize === size ? 'bg-black text-white border-black' : 'border-gray-200 hover:border-black'
                     }`}
                   >
                     {size}
                   </button>
                 ))}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest block mb-4">Quantity</span>
              <div className="flex items-center border border-gray-200 w-max">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                  className="px-4 py-3 hover:bg-gray-50 text-gray-500"
                >
                  -
                </button>
                <span className="px-4 py-3 text-sm font-medium border-x border-gray-200 min-w-[3rem] text-center">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)} 
                  className="px-4 py-3 hover:bg-gray-50 text-gray-500"
                >
                  +
                </button>
              </div>
            </div>
            
            <button 
              onClick={() => addToCart(product, quantity)}
              className="w-full bg-black text-white py-5 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-gray-800 transition-colors"
            >
              Add to Bag
            </button>
            
             <div className="pt-8 border-t border-gray-100">
                <div className="flex justify-between text-[9px] uppercase tracking-[0.2em] text-gray-400 font-bold">
                   <span>Free Shipping & Returns</span>
                   <span>Secure Checkout</span>
                </div>
             </div>
          </div>
        </div>
      </main>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="px-8 md:px-16 lg:px-24 py-20 border-t border-gray-100 bg-white">
          <h2 className="text-2xl font-serif mb-12 text-center uppercase tracking-widest">You May Also Like</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-12">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Reviews Section */}
      <ProductReviews />
    </div>
  );
}
