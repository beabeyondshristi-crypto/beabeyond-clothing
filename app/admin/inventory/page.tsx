'use client';

import { useEffect, useState } from 'react';
import type { InventoryItem } from '@/lib/types';

export default function AdminInventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [stockChange, setStockChange] = useState('');
  const [stockReason, setStockReason] = useState('');

  const fetchInventory = async () => {
    try {
      const res = await fetch('/api/admin/inventory');
      const data = await res.json();
      if (Array.isArray(data)) setItems(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInventory(); }, []);

  const updateStock = async (productId: string) => {
    const change = parseInt(stockChange);
    if (isNaN(change) || change === 0) return;

    try {
      await fetch('/api/admin/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, change, reason: stockReason }),
      });
      setEditingItem(null);
      setStockChange('');
      setStockReason('');
      fetchInventory();
    } catch (e) {
      console.error(e);
    }
  };

  const lowStockItems = items.filter(i => i.stock <= i.low_stock_threshold);
  const outOfStock = items.filter(i => i.stock === 0);
  const healthyStock = items.filter(i => i.stock > i.low_stock_threshold);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 border border-black/5 shadow-sm">
          <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-2 font-bold">Total Items</p>
          <p className="text-3xl font-serif">{items.length}</p>
        </div>
        <div className="bg-white p-8 border border-black/5 shadow-sm">
          <p className="text-[10px] uppercase tracking-widest text-red-400 mb-2 font-bold">Low Stock</p>
          <p className="text-3xl font-serif text-red-500">{lowStockItems.length}</p>
        </div>
        <div className="bg-white p-8 border border-black/5 shadow-sm">
          <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-2 font-bold">Out of Stock</p>
          <p className="text-3xl font-serif">{outOfStock.length}</p>
        </div>
      </div>

      {lowStockItems.length > 0 && (
        <div className="bg-red-50 border border-red-200 shadow-sm p-6">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-red-600 mb-4">
            Low Stock Alert — {lowStockItems.length} products need attention
          </h2>
          <div className="flex flex-wrap gap-2">
            {lowStockItems.map(item => (
              <span key={item.product_id} className="text-[9px] bg-red-100 text-red-700 px-2 py-1 uppercase tracking-widest">
                {item.product_name} ({item.stock} left)
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white border border-black/5 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-black/5">
            <tr>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-gray-400">Product</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-gray-400">In Stock</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-gray-400">Threshold</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-gray-400">Status</th>
              <th className="px-6 py-4 text-right text-[10px] uppercase tracking-widest font-bold text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {items.map((item) => {
              const status = item.stock === 0 ? 'Out of Stock' : item.stock <= item.low_stock_threshold ? 'Low Stock' : 'In Stock';
              const statusColor = item.stock === 0 ? 'text-red-500' : item.stock <= item.low_stock_threshold ? 'text-orange-500' : 'text-green-600';
              return (
                <tr key={item.product_id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-[11px] font-bold uppercase tracking-widest">{item.product_name}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-serif font-bold ${statusColor}`}>{item.stock}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] text-gray-400">{item.low_stock_threshold}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[8px] px-2 py-1 uppercase tracking-[0.2em] font-bold ${statusColor} bg-opacity-10`}>
                      {status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setEditingItem(editingItem?.product_id === item.product_id ? null : item)}
                      className="text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-black transition-colors"
                    >
                      {editingItem?.product_id === item.product_id ? 'Cancel' : 'Update Stock'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {editingItem && (
        <div className="bg-white border border-black/5 shadow-sm p-8">
          <h3 className="text-sm font-serif uppercase tracking-tight mb-6">
            Update Stock: {editingItem.product_name}
          </h3>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-6">
            Current Stock: <span className="font-bold text-black">{editingItem.stock}</span>
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest font-bold">Change Quantity</label>
              <input
                type="number"
                value={stockChange}
                onChange={(e) => setStockChange(e.target.value)}
                className="w-full border-b border-black py-3 text-sm focus:outline-none"
                placeholder="+10 or -5"
              />
              <p className="text-[8px] text-gray-400 mt-1">Use + to add, - to subtract</p>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest font-bold">Reason</label>
              <input
                type="text"
                value={stockReason}
                onChange={(e) => setStockReason(e.target.value)}
                className="w-full border-b border-black py-3 text-sm focus:outline-none"
                placeholder="E.G. STOCK COUNT, RETURN"
              />
            </div>
            <button
              onClick={() => updateStock(editingItem.product_id)}
              className="bg-black text-white px-8 py-3 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-gray-800 transition-colors h-fit"
            >
              Apply Change
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
