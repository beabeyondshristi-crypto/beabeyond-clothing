'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import type { Product } from '@/lib/data';

function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortOption, setSortOption] = useState('newest');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        if (Array.isArray(data)) {
          setAllProducts(data);
          setFilteredProducts(data);
          const cats = Array.from(new Set(data.map((p: Product) => p.category))) as string[];
          setCategories(cats);
        }
      } catch (e) {
        console.error('Failed to fetch products', e);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (!allProducts.length) return;

    const categoryParam = searchParams.get('category');
    const _sortParam = searchParams.get('sort');
    const queryParam = searchParams.get('q');

    let result = [...allProducts];

    if (queryParam) {
      const q = queryParam.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }

    if (categoryParam) {
      const catMatch = categories.find(c => c.toLowerCase() === categoryParam.toLowerCase());
      if (catMatch) {
        setSelectedCategory(catMatch);
        result = result.filter(p => p.category === catMatch);
      }
    }

    if (selectedCategory) {
      result = result.filter(p => p.category === selectedCategory);
    }

    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    switch (sortOption) {
      case 'price-asc': result.sort((a, b) => a.price - b.price); break;
      case 'price-desc': result.sort((a, b) => b.price - a.price); break;
      case 'newest':
      default: result.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()); break;
    }

    setFilteredProducts(result);
  }, [selectedCategory, priceRange, sortOption, searchParams, allProducts, categories]);

  const toggleCategory = (cat: string) => {
    if (selectedCategory === cat) {
      setSelectedCategory(null);
      const params = new URLSearchParams(searchParams.toString());
      params.delete('category');
      router.push(`/shop?${params.toString()}`);
    } else {
      setSelectedCategory(cat);
    }
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setPriceRange([0, 500]);
    setSortOption('newest');
    router.push('/shop');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col font-sans">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />

      <div className="md:hidden sticky top-[60px] z-30 bg-white border-b border-black flex justify-between items-center px-6 py-4">
        <button
           onClick={() => setIsFilterOpen(true)}
           className="text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2"
        >
           <span>Filters</span>
           <span className="bg-black text-white rounded-full w-4 h-4 flex items-center justify-center text-[8px]">
             {(selectedCategory ? 1 : 0) + (priceRange[0] > 0 || priceRange[1] < 500 ? 1 : 0)}
           </span>
        </button>
        <span className="text-[10px] text-gray-400 uppercase tracking-widest">{filteredProducts.length} Items</span>
      </div>

      <main className="flex-grow flex flex-col md:flex-row">

        <aside className={`
            fixed inset-0 z-[60] bg-white transform transition-transform duration-300 md:translate-x-0 md:static md:w-64 md:border-r border-black md:block
            ${isFilterOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="h-full overflow-y-auto p-8 md:p-12 md:sticky md:top-[65px] md:h-[calc(100vh-65px)] pb-32 md:pb-12">
             <div className="flex justify-between items-center md:hidden mb-8">
                <h2 className="text-xl font-serif uppercase">Filters</h2>
                <button onClick={() => setIsFilterOpen(false)} className="text-2xl p-2">✕</button>
             </div>

             <div className="space-y-10">
                <div>
                   <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4 text-gray-900">Category</h3>
                   <ul className="space-y-3">
                      {categories.map(cat => (
                        <li key={cat}>
                           <button
                             onClick={() => toggleCategory(cat)}
                             className={`text-[11px] uppercase tracking-widest hover:text-black transition-colors text-left w-full ${selectedCategory === cat ? 'font-bold text-black border-l-2 border-black pl-2' : 'text-gray-400 font-medium'}`}
                           >
                             {cat}
                           </button>
                        </li>
                      ))}
                   </ul>
                </div>

                <div>
                   <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4 text-gray-900">Price Range</h3>
                   <div className="flex gap-4 items-center mb-4">
                      <div className="border border-gray-200 p-2 w-full text-center">
                        <span className="text-[10px] text-gray-500">$</span>
                        <input
                           type="number"
                           value={priceRange[0]}
                           onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                           className="w-8 text-[10px] outline-none text-center"
                        />
                      </div>
                      <span className="text-gray-300">-</span>
                      <div className="border border-gray-200 p-2 w-full text-center">
                        <span className="text-[10px] text-gray-500">$</span>
                        <input
                           type="number"
                           value={priceRange[1]}
                           onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                           className="w-8 text-[10px] outline-none text-center"
                        />
                      </div>
                   </div>
                   <input
                     type="range"
                     min="0"
                     max="500"
                     value={priceRange[1]}
                     onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                     className="w-full accent-black h-0.5 bg-gray-200 appearance-none"
                   />
                </div>

                <div className="md:hidden">
                   <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4 text-gray-900">Sort By</h3>
                   <select
                      value={sortOption}
                      onChange={(e) => setSortOption(e.target.value)}
                      className="w-full border border-gray-200 p-3 text-[11px] uppercase tracking-widest outline-none rounded-none"
                   >
                      <option value="newest">Newest Arrivals</option>
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                   </select>
                </div>

                <button
                   onClick={clearFilters}
                   className="text-[9px] uppercase tracking-[0.2em] text-gray-400 border-b border-gray-200 pb-0.5 hover:text-black hover:border-black transition-colors"
                >
                   Clear All Filters
                </button>
             </div>
          </div>

          <div className="md:hidden absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-100">
             <button
                onClick={() => setIsFilterOpen(false)}
                className="w-full bg-black text-white py-4 text-[10px] font-bold uppercase tracking-[0.2em]"
             >
                View {filteredProducts.length} Results
             </button>
          </div>
        </aside>

        <div className="flex-grow">
           <div className="hidden md:flex justify-between items-center p-8 md:p-12 border-b border-gray-100">
              <h1 className="text-2xl font-normal font-serif uppercase tracking-tighter">
                 {selectedCategory ? selectedCategory : 'All Products'}
              </h1>
              <div className="flex items-center gap-4">
                 <span className="text-[10px] text-gray-400 uppercase tracking-widest">{filteredProducts.length} Products</span>
                 <div className="h-4 w-px bg-gray-200 mx-2"></div>
                 <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="text-[10px] font-bold uppercase tracking-[0.2em] outline-none bg-transparent cursor-pointer hover:opacity-50"
                 >
                    <option value="newest">Sort: Newest</option>
                    <option value="price-asc">Sort: Price Low</option>
                    <option value="price-desc">Sort: Price High</option>
                 </select>
              </div>
           </div>

           <div className="p-6 md:p-12">
              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="min-h-[50vh] flex flex-col items-center justify-center text-center">
                   <p className="text-xl font-serif italic mb-4">No products found.</p>
                   <button onClick={clearFilters} className="text-[10px] font-bold uppercase tracking-[0.2em] border-b border-black">
                      Reset Filters
                   </button>
                </div>
              )}
           </div>
        </div>
      </main>

      <footer className="py-12 px-6 md:px-12 bg-white border-t border-black text-center text-[9px] text-gray-400 uppercase tracking-[0.2em]">
          &copy; {new Date().getFullYear()} Beabeyond Retail Group.
      </footer>
    </div>
  );
}

export default function Shop() {
  return (
    <Suspense>
      <ShopContent />
    </Suspense>
  );
}
