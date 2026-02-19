'use client';

import { products, collections } from '@/lib/data';

export default function AdminDashboard() {
  const stats = [
    { name: 'Total Products', value: products.length },
    { name: 'Total Collections', value: collections.length },
    { name: 'Active Orders', value: '12' },
    { name: 'Revenue (MTD)', value: '$4,250' },
  ];

  return (
    <div className="space-y-12">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white p-8 border border-black/5 shadow-sm">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-2 font-bold">{stat.name}</p>
            <p className="text-3xl font-serif">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Recent Activity */}
        <div className="bg-white border border-black/5 shadow-sm">
           <div className="p-6 border-b border-black/5 flex justify-between items-center">
              <h2 className="text-[11px] font-bold uppercase tracking-widest">Recent Products</h2>
              <button className="text-[9px] uppercase tracking-widest text-gray-400 hover:text-black transition-colors">View All</button>
           </div>
           <div className="divide-y divide-black/5">
              {products.slice(0, 5).map((product) => (
                <div key={product.id} className="p-6 flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-12 bg-gray-50 relative overflow-hidden">
                         <img src={product.images[0]} alt="" className="object-cover w-full h-full grayscale" />
                      </div>
                      <div>
                         <p className="text-[11px] font-bold uppercase tracking-widest">{product.name}</p>
                         <p className="text-[9px] text-gray-400 uppercase tracking-widest mt-1">{product.category}</p>
                      </div>
                   </div>
                   <p className="text-[11px] font-serif">${product.price}</p>
                </div>
              ))}
           </div>
        </div>

        {/* System Overview */}
        <div className="bg-white border border-black/5 shadow-sm p-8 flex flex-col justify-center text-center">
           <div className="max-w-xs mx-auto">
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-300 mb-6 block">Status</span>
              <h3 className="text-2xl font-serif uppercase tracking-tight mb-4">System Operational</h3>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest leading-loose">
                 All modules are running correctly. Next scheduled sync in 4 hours.
              </p>
              <div className="w-px h-12 bg-black mx-auto mt-8"></div>
           </div>
        </div>
      </div>
    </div>
  );
}
