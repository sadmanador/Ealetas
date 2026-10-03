'use client';

import React, { useState, useEffect } from 'react';
import {
  PackageCheck,
  Search,
  Loader2,
  Phone,
  MapPin,
  Clock,
  CheckCircle,
  Truck,
  RotateCcw,
  XCircle,
  AlertCircle,
} from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { value: 'in_transit', label: 'In Transit', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  { value: 'delivered', label: 'Delivered', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { value: 'returned', label: 'Returned', color: 'bg-rose-100 text-rose-800 border-rose-200' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-gray-100 text-gray-800 border-gray-200' },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);
  const [notice, setNotice] = useState('');

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const url = statusFilter !== 'all' ? `/api/orders?status=${statusFilter}` : '/api/orders';
      const res = await fetch(url);
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (e) {
      console.error('Error fetching orders:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    setNotice('');
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update order status');
      }

      setNotice(
        newStatus === 'delivered'
          ? `✓ Order #${data.order.orderNumber} marked as Delivered! Stock inventory automatically reduced.`
          : `✓ Order status updated to ${newStatus}.`
      );

      setTimeout(() => setNotice(''), 4000);
      fetchOrders();
    } catch (err) {
      alert(err.message || 'Status update failed');
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase();
    return (
      o.orderNumber.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.customerPhone.includes(q) ||
      o.deliveryAddress.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#eae5de]">
        <div>
          <span className="text-[10px] tracking-widest text-[#b88b42] uppercase font-semibold">
            Fulfillment & Logistics
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-medium text-[#1c1a17]">
            Customer Orders Pipeline
          </h1>
        </div>
      </div>

      {notice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{notice}</span>
        </div>
      )}

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 border border-[#eae5de] rounded-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by order #, phone, customer name, or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[#faf8f5] border border-[#dcd5cb] text-xs rounded-xs focus:outline-none focus:border-[#b88b42]"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-48 px-3 py-1.5 bg-[#faf8f5] border border-[#dcd5cb] text-xs rounded-xs focus:outline-none focus:border-[#b88b42]"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="in_transit">In Transit</option>
          <option value="delivered">Delivered (Stock Reduced)</option>
          <option value="returned">Returned</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders Table */}
      {isLoading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="w-8 h-8 text-[#b88b42] animate-spin" />
        </div>
      ) : (
        <div className="bg-white border border-[#eae5de] rounded-xs overflow-x-auto shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#faf8f5] border-b border-[#eae5de] text-[11px] uppercase tracking-wider text-[#6b665f]">
              <tr>
                <th className="p-3.5">Order Info</th>
                <th className="p-3.5">Customer & Phone</th>
                <th className="p-3.5">Delivery Zone & Address</th>
                <th className="p-3.5">Items Ordered</th>
                <th className="p-3.5">Total (৳)</th>
                <th className="p-3.5">Status Workflow</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0ece5]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-500">
                    No orders match your criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((order) => {
                  return (
                    <tr key={order.id} className="hover:bg-[#faf8f5]/50 transition-colors align-top">
                      <td className="p-3.5 space-y-1">
                        <span className="font-semibold text-gray-900 block font-mono">
                          #{order.orderNumber}
                        </span>
                        <span className="text-[11px] text-gray-500 block">
                          {new Date(order.createdAt).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        {order.inventoryAdjusted && (
                          <span className="inline-block px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200 rounded-xs">
                            ✓ Stock Reduced
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 space-y-1">
                        <span className="font-medium text-gray-900 block">{order.customerName}</span>
                        <div className="flex items-center gap-1 text-[11px] text-[#b88b42]">
                          <Phone className="w-3 h-3" />
                          <a href={`tel:${order.customerPhone}`} className="hover:underline">
                            {order.customerPhone}
                          </a>
                        </div>
                      </td>

                      <td className="p-3.5 max-w-xs space-y-1">
                        <span
                          className={`inline-block px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-xs ${
                            order.isDhakaCityCorp
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {order.isDhakaCityCorp ? 'Inside Dhaka City (80৳)' : 'Outside Dhaka (120৳)'}
                        </span>
                        <p className="text-[11px] text-gray-600 leading-snug line-clamp-2">
                          {order.deliveryAddress}
                        </p>
                        {order.notes && (
                          <p className="text-[10px] text-gray-400 italic">Note: {order.notes}</p>
                        )}
                      </td>

                      <td className="p-3.5 space-y-1">
                        {order.items?.map((item) => (
                          <div key={item.id} className="text-[11px] text-gray-700">
                            • {item.productName} <span className="font-semibold">×{item.quantity}</span>
                          </div>
                        ))}
                      </td>

                      <td className="p-3.5 font-semibold text-gray-900">
                        ৳{order.totalAmount?.toLocaleString()}
                        <div className="text-[10px] text-gray-400 font-normal">
                          (incl. ৳{order.deliveryCharge} delivery)
                        </div>
                      </td>

                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <select
                            value={order.status}
                            disabled={updatingId === order.id}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            className="px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-xs border border-[#dcd5cb] bg-white focus:outline-none focus:border-[#b88b42]"
                          >
                            {STATUS_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                          {updatingId === order.id && (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#b88b42]" />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
