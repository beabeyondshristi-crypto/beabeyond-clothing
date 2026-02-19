'use client';

const mockOrders = [
  { id: 'ORD-1001', customer: 'Sarah Jenkins', date: 'Feb 18, 2026', total: '$240.00', status: 'Shipped' },
  { id: 'ORD-1002', customer: 'Michael Chen', date: 'Feb 18, 2026', total: '$180.00', status: 'Processing' },
  { id: 'ORD-1003', customer: 'Emma Wilson', date: 'Feb 17, 2026', total: '$420.00', status: 'Pending' },
  { id: 'ORD-1004', customer: 'James Tailor', date: 'Feb 17, 2026', total: '$95.00', status: 'Delivered' },
];

export default function AdminOrders() {
  return (
    <div className="space-y-8">
      <div className="bg-white p-6 border border-black/5 shadow-sm">
        <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Order Management</h2>
        <p className="text-xl font-serif mt-1">{mockOrders.length} Recent Orders</p>
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
            {mockOrders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-[11px] font-bold">{order.id}</td>
                <td className="px-6 py-4 text-[11px] uppercase tracking-widest">{order.customer}</td>
                <td className="px-6 py-4 text-[11px] text-gray-500">{order.date}</td>
                <td className="px-6 py-4 text-sm font-serif">{order.total}</td>
                <td className="px-6 py-4">
                  <span className={`text-[8px] px-2 py-1 uppercase tracking-[0.2em] font-bold ${
                    order.status === 'Delivered' || order.status === 'Shipped' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-black transition-colors">
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
