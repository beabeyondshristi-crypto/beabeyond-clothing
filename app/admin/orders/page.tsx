'use client';

import { useEffect, useState } from 'react';
import type { Order } from '@/lib/types';

const statusColors: Record<string, string> = {
  pending: 'bg-orange-50 text-orange-600',
  processing: 'bg-blue-50 text-blue-600',
  shipped: 'bg-purple-50 text-purple-600',
  delivered: 'bg-green-50 text-green-600',
  cancelled: 'bg-red-50 text-red-600',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = async () => {
    const params = new URLSearchParams();
    if (statusFilter) params.set('status', statusFilter);
    try {
      const res = await fetch(`/api/admin/orders?${params}`);
      const data = await res.json();
      if (Array.isArray(data)) setOrders(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [statusFilter]);

  const updateStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/admin/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      fetchOrders();
      if (selectedOrder?.id === id) {
        setSelectedOrder({ ...selectedOrder, status: status as Order['status'] });
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-white p-6 border border-black/5 shadow-sm">
        <div>
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Order Management</h2>
          <p className="text-xl font-serif mt-1">{orders.length} Orders</p>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border-b border-black py-2 text-[10px] uppercase tracking-widest focus:outline-none bg-transparent"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="bg-white border border-black/5 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-black/5">
            <tr>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-gray-400">Order ID</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-gray-400">Customer</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-gray-400">Date</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-gray-400">Total</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-gray-400">Status</th>
              <th className="px-6 py-4 text-right text-[10px] uppercase tracking-widest font-bold text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest">No orders found</p>
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-[11px] font-bold">#{order.id.slice(0, 8)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-[11px] uppercase tracking-widest">{order.customer_name}</p>
                    <p className="text-[9px] text-gray-400 mt-0.5">{order.customer_email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-[11px] text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-serif">₹{Number(order.total).toFixed(2)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      className={`text-[8px] px-2 py-1 uppercase tracking-[0.2em] font-bold border-none cursor-pointer ${statusColors[order.status] || 'bg-gray-50 text-gray-600'}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                      className="text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-black transition-colors"
                    >
                      {selectedOrder?.id === order.id ? 'Close' : 'View Details'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedOrder && (
        <div className="bg-white border border-black/5 shadow-sm p-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-lg font-serif uppercase tracking-tight">Order #{selectedOrder.id.slice(0, 8)}</h2>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">
                Placed on {new Date(selectedOrder.created_at).toLocaleString()}
              </p>
            </div>
            <span className={`text-[8px] px-3 py-1.5 uppercase tracking-[0.2em] font-bold ${statusColors[selectedOrder.status] || 'bg-gray-50 text-gray-600'}`}>
              {selectedOrder.status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Customer</h3>
              <p className="text-sm">{selectedOrder.customer_name}</p>
              <p className="text-[11px] text-gray-500">{selectedOrder.customer_email}</p>
            </div>
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Shipping Address</h3>
              {selectedOrder.shipping_address && Object.keys(selectedOrder.shipping_address).length > 0 ? (
                <div className="text-[11px] leading-relaxed">
                  {Object.entries(selectedOrder.shipping_address).map(([key, val]) => (
                    <p key={key} className="capitalize">{key}: {String(val)}</p>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-gray-400">No address on file</p>
              )}
            </div>
          </div>

          <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">Order Items</h3>
          <table className="w-full text-left border-collapse mb-8">
            <thead className="bg-gray-50 border-b border-black/5">
              <tr>
                <th className="px-4 py-3 text-[9px] uppercase tracking-widest font-bold text-gray-400">Item</th>
                <th className="px-4 py-3 text-[9px] uppercase tracking-widest font-bold text-gray-400">Qty</th>
                <th className="px-4 py-3 text-[9px] uppercase tracking-widest font-bold text-gray-400">Size</th>
                <th className="px-4 py-3 text-[9px] uppercase tracking-widest font-bold text-gray-400">Color</th>
                <th className="px-4 py-3 text-right text-[9px] uppercase tracking-widest font-bold text-gray-400">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {selectedOrder.items?.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3 text-[11px] font-bold uppercase tracking-widest">{item.product_name}</td>
                  <td className="px-4 py-3 text-[11px]">{item.quantity}</td>
                  <td className="px-4 py-3 text-[11px]">{item.size}</td>
                  <td className="px-4 py-3 text-[11px]">{item.color}</td>
                  <td className="px-4 py-3 text-right text-sm font-serif">₹{Number(item.price).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end border-t border-black/5 pt-4">
            <div className="text-right space-y-1">
              <div className="flex justify-between gap-12">
                <span className="text-[10px] uppercase tracking-widest text-gray-400">Subtotal</span>
                <span className="text-sm font-serif">₹{Number(selectedOrder.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between gap-12">
                <span className="text-[10px] uppercase tracking-widest text-gray-400">Shipping</span>
                <span className="text-sm font-serif">₹{Number(selectedOrder.shipping_cost).toFixed(2)}</span>
              </div>
              <div className="flex justify-between gap-12 border-t border-black/5 pt-1 mt-1">
                <span className="text-[11px] uppercase tracking-widest font-bold">Total</span>
                <span className="text-base font-serif font-bold">₹{Number(selectedOrder.total).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {selectedOrder.notes && (
            <div className="mt-8 p-4 bg-gray-50">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Notes</h3>
              <p className="text-[11px]">{selectedOrder.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
