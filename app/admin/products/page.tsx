'use client';

import { useState } from 'react';
import { products, Product } from '@/lib/data';

export default function AdminProducts() {
  const [isFormOpen, setIsFilterOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const toggleForm = (product: Product | null = null) => {
    setEditingProduct(product);
    setIsFilterOpen(!isFormOpen);
  };

  return (
    <div className="space-y-8">
      {/* Header Actions */}
      <div className="flex justify-between items-center bg-white p-6 border border-black/5 shadow-sm sticky top-20 z-10">
        <div>
           <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Inventory</h2>
           <p className="text-xl font-serif mt-1">{products.length} Items</p>
        </div>
        <button 
          onClick={() => toggleForm()}
          className="bg-black text-white px-8 py-3 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-gray-800 transition-colors"
        >
          Add New Product
        </button>
      </div>

      {/* Product Table */}
      <div className="bg-white border border-black/5 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-black/5">
            <tr>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-gray-400">Product</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-gray-400">Category</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-gray-400">Price</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-gray-400">Colors</th>
              <th className="px-6 py-4 text-right text-[10px] uppercase tracking-widest font-bold text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-16 bg-gray-100 relative overflow-hidden">
                       <img src={product.images[0]} alt="" className="object-cover w-full h-full grayscale group-hover:grayscale-0 transition-all" />
                    </div>
                    <div>
                       <p className="text-[11px] font-bold uppercase tracking-widest">{product.name}</p>
                       <p className="text-[9px] text-gray-400 uppercase tracking-widest mt-1">ID: #{product.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-[10px] uppercase tracking-widest text-gray-500">{product.category}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-serif">${product.price}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-1 flex-wrap max-w-[150px]">
                    {product.colors.map(c => (
                      <span key={c} className="text-[8px] border border-black/10 px-1.5 py-0.5 uppercase tracking-widest">{c}</span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-4">
                    <button 
                      onClick={() => toggleForm(product)}
                      className="text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-black transition-colors"
                    >
                      Edit
                    </button>
                    <button className="text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-red-500 transition-colors">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Form Overlay */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
           <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => toggleForm()} />
           <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl overflow-y-auto p-12">
              <div className="flex justify-between items-center mb-12">
                 <h2 className="text-2xl font-serif uppercase tracking-tighter">
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                 </h2>
                 <button onClick={() => toggleForm()} className="text-2xl font-light">✕</button>
              </div>

              <form className="space-y-8 pb-20">
                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-1">
                       <label className="text-[10px] uppercase tracking-widest font-bold">Product Name</label>
                       <input type="text" defaultValue={editingProduct?.name} className="w-full border-b border-black py-3 text-sm focus:outline-none" placeholder="E.G. SILK BLOUSE" />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] uppercase tracking-widest font-bold">Price ($)</label>
                       <input type="number" defaultValue={editingProduct?.price} className="w-full border-b border-black py-3 text-sm focus:outline-none" placeholder="0.00" />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-1">
                       <label className="text-[10px] uppercase tracking-widest font-bold">Category</label>
                       <select defaultValue={editingProduct?.category} className="w-full border-b border-black py-3 text-sm focus:outline-none bg-transparent">
                          <option>Dresses</option>
                          <option>Tops</option>
                          <option>Jeans</option>
                          <option>Skirts</option>
                          <option>Co-ord Sets</option>
                          <option>Accessories</option>
                       </select>
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] uppercase tracking-widest font-bold">Fabric</label>
                       <input type="text" defaultValue={editingProduct?.fabric} className="w-full border-b border-black py-3 text-sm focus:outline-none" placeholder="E.G. 100% ORGANIC COTTON" />
                    </div>
                 </div>

                 <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest font-bold">Description</label>
                    <textarea defaultValue={editingProduct?.description} className="w-full border-b border-black py-3 text-sm focus:outline-none min-h-[100px]" placeholder="PRODUCT DETAILS..." />
                 </div>

                 <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest font-bold">Images (URLs, comma separated)</label>
                    <textarea defaultValue={editingProduct?.images.join(', ')} className="w-full border-b border-black py-3 text-sm focus:outline-none min-h-[80px]" placeholder="HTTPS://IMAGE1.JPG, HTTPS://IMAGE2.JPG" />
                 </div>

                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-1">
                       <label className="text-[10px] uppercase tracking-widest font-bold">Colors (comma separated)</label>
                       <input type="text" defaultValue={editingProduct?.colors.join(', ')} className="w-full border-b border-black py-3 text-sm focus:outline-none" placeholder="BLACK, WHITE, NAVY" />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] uppercase tracking-widest font-bold">Sizes (comma separated)</label>
                       <input type="text" defaultValue={editingProduct?.sizes.join(', ')} className="w-full border-b border-black py-3 text-sm focus:outline-none" placeholder="XXS, XS, S, M, L, XL, XXL" />
                    </div>
                 </div>

                 {/* Storefront Flags */}
                 <div className="pt-4 border-t border-black/5">
                    <span className="text-[10px] font-bold uppercase tracking-widest block mb-6">Storefront Placement</span>
                    <div className="flex flex-wrap gap-12">
                       <label className="flex items-center gap-3 cursor-pointer group">
                          <input type="checkbox" defaultChecked={editingProduct?.isNewArrival} className="w-4 h-4 accent-black rounded-none border-black" />
                          <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400 group-hover:text-black transition-colors">New Arrival</span>
                       </label>
                       <label className="flex items-center gap-3 cursor-pointer group">
                          <input type="checkbox" defaultChecked={editingProduct?.isTrending} className="w-4 h-4 accent-black rounded-none border-black" />
                          <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400 group-hover:text-black transition-colors">Trending</span>
                       </label>
                       <label className="flex items-center gap-3 cursor-pointer group">
                          <input type="checkbox" defaultChecked={editingProduct?.isEssential} className="w-4 h-4 accent-black rounded-none border-black" />
                          <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400 group-hover:text-black transition-colors">Essential</span>
                       </label>
                    </div>
                 </div>

                 <div className="pt-12">
                    <button type="submit" className="w-full bg-black text-white py-5 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-gray-800 transition-colors">
                       {editingProduct ? 'Update Product' : 'Create Product Entry'}
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}
