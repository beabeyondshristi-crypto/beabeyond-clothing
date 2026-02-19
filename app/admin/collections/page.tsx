'use client';

import { useState } from 'react';
import { collections } from '@/lib/data';

export default function AdminCollections() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<any>(null);

  const toggleForm = (collection: any = null) => {
    setEditingCollection(collection);
    setIsFormOpen(!isFormOpen);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 border border-black/5 shadow-sm">
        <div>
           <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Storefront</h2>
           <p className="text-xl font-serif mt-1">{collections.length} Collections</p>
        </div>
        <button 
          onClick={() => toggleForm()}
          className="bg-black text-white px-8 py-3 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-gray-800 transition-colors"
        >
          New Collection
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {collections.map((collection) => (
          <div key={collection.slug} className="bg-white border border-black/5 shadow-sm group">
             <div className="relative aspect-[16/9] bg-gray-100 overflow-hidden">
                <img src={collection.image} alt={collection.name} className="object-cover w-full h-full grayscale group-hover:grayscale-0 transition-all duration-700" />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                   <button 
                     onClick={() => toggleForm(collection)}
                     className="bg-white text-black px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-100"
                   >
                     Edit
                   </button>
                   <button className="bg-red-500 text-white px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-red-600">
                     Delete
                   </button>
                </div>
             </div>
             <div className="p-6">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] mb-1">{collection.name}</h3>
                <p className="text-[9px] text-gray-400 uppercase tracking-widest">slug: /{collection.slug}</p>
             </div>
          </div>
        ))}
      </div>

      {/* Form Overlay */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
           <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => toggleForm()} />
           <div className="relative w-full max-w-lg bg-white h-full shadow-2xl p-12">
              <div className="flex justify-between items-center mb-12">
                 <h2 className="text-2xl font-serif uppercase tracking-tighter">
                    {editingCollection ? 'Edit Collection' : 'New Collection'}
                 </h2>
                 <button onClick={() => toggleForm()} className="text-2xl font-light">✕</button>
              </div>

              <form className="space-y-8">
                 <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest font-bold">Collection Name</label>
                    <input type="text" defaultValue={editingCollection?.name} className="w-full border-b border-black py-3 text-sm focus:outline-none" placeholder="E.G. SUMMER 2026" />
                 </div>

                 <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest font-bold">URL Slug</label>
                    <input type="text" defaultValue={editingCollection?.slug} className="w-full border-b border-black py-3 text-sm focus:outline-none" placeholder="E.G. summer-2026" />
                 </div>

                 <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest font-bold">Hero Image URL</label>
                    <input type="text" defaultValue={editingCollection?.image} className="w-full border-b border-black py-3 text-sm focus:outline-none" placeholder="HTTPS://..." />
                 </div>

                 <div className="pt-12">
                    <button type="submit" className="w-full bg-black text-white py-5 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-gray-800 transition-colors">
                       {editingCollection ? 'Update Collection' : 'Create Collection'}
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}
