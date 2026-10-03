'use client';

import React, { useState, useEffect } from 'react';
import {
  PackageCheck,
  Search,
  Loader2,
  Phone,
  Clock,
  CheckCircle,
  Truck,
  RotateCcw,
  XCircle,
  Box,
  Layers,
  ArrowRight,
} from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { value: 'packaged', label: 'Packaged', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  { value: 'in_transit', label: 'In Transit', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  { value: 'delivered', label: 'Delivered', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { value: 'returned', label: 'Returned', color: 'bg-rose-100 text-rose-800 border-rose-200' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-gray-100 text-gray-800 border-gray-200' },
];

export default function AdminOrdersPage() {
  const [allOrders, setAllOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);
  const [notice, setNotice] = useState('');

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      setAllOrders(data.orders || []);
    } catch (e) {
      console.error('Error fetching orders:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

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
          : `✓ Order status updated to "${newStatus.toUpperCase()}".`
      );

      setTimeout(() => setNotice(''), 4000);
      fetchOrders();
    } catch (err) {
      alert(err.message || 'Status update failed');
    } finally {
      setUpdatingId(null);
    }
  };

  // Helper to compute orders & product quantities for each status
  const getStatusStats = (statusKey) => {
    const matching = statusKey === 'all'
      ? allOrders
      : allOrders.filter((o) => o.status === statusKey);

    const totalOrdersCount = matching.length;
    const totalItemsCount = matching.reduce((sum, o) => {
      const itemsInOrder = o.items ? o.items.reduce((s, i) => s + (i.quantity || 1), 0) : 0;
      return sum + itemsInOrder;
    }, 0);

    return { ordersCount: totalOrdersCount, itemsCount: totalItemsCount };
  };

  // Status tiles definition
  const tiles = [
    { key: 'all', label: 'All Orders', icon: Layers, bg: 'hover:border-gray-800' },
    { key: 'pending', label: 'Pending', icon: Clock, bg: 'hover:border-amber-600' },
    { key: 'confirmed', label: 'Confirmed', icon: CheckCircle, bg: 'hover:border-blue-600' },
    { key: 'packaged', label: 'Packaged', icon: Box, bg: 'hover:border-yellow-600' },
    { key: 'in_transit', label: 'In Transit', icon: Truck, bg: 'hover:border-indigo-600' },
    { key: 'delivered', label: 'Delivered', icon: PackageCheck, bg: 'hover:border-emerald-600' },
    { key: 'returned', label: 'Returned', icon: RotateCcw, bg: 'hover:border-rose-600' },
    { key: 'cancelled', label: 'Cancelled', icon: XCircle, bg: 'hover:border-gray-500' },
  ];

  const filtered = allOrders.filter((o) => {
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    const q = search.toLowerCase();
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.customerPhone.includes(q) ||
      o.deliveryAddress.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
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
            Orders & Product Logistics Pipeline
          </h1>
        </div>

        <div className="text-xs text-[#6b665f]">
          Total Live Orders: <span className="font-semibold text-gray-900">{allOrders.length}</span>
        </div>
      </div>

      {notice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{notice}</span>
        </div>
      )}

      {/* Interactive Status Tiles */}
      <div className="space-y-2">
        <span className="text-xs uppercase tracking-wider font-semibold text-[#1c1a17] block">
          Filter by Status & Product Volume:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {tiles.map((tile) => {
            const Icon = tile.icon;
            const stats = getStatusStats(tile.key);
            const isActive = statusFilter === tile.key;

            return (
              <button
                key={tile.key}
                type="button"
                onClick={() => setStatusFilter(tile.key)}
                className={`p-3 text-left border rounded-xs transition-all ${
                  isActive
                    ? 'border-[#b88b42] bg-[#fbf8f1] shadow-xs'
                    : 'border-[#eae5de] bg-white hover:bg-[#faf8f5]'
                } ${tile.bg}`}
              >
                <div className="flex items-center justify-between text-gray-400 mb-1">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#b88b42]' : ''}`} />
                  <span className={`text-base font-bold font-serif ${isActive ? 'text-[#b88b42]' : 'text-gray-900'}`}>
                    {stats.ordersCount}
                  </span>
                </div>
                <div className="text-xs font-semibold text-gray-900 truncate">
                  {tile.label}
                </div>
                <div className="text-[10px] text-gray-500 font-medium">
                  {stats.itemsCount} products
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search and Dropdown Filter */}
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
          className="w-full sm:w-56 px-3 py-1.5 bg-[#faf8f5] border border-[#dcd5cb] text-xs font-medium rounded-xs focus:outline-none focus:border-[#b88b42]"
        >
          <option value="all">Status: Show All ({allOrders.length})</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="packaged">Packaged (Ready for Pickup)</option>
          <option value="in_transit">In Transit</option>
          <option value="delivered">Delivered (Stock Deducted)</option>
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
                <th className="p-3.5">Products in Package</th>
                <th className="p-3.5">Total Payable</th>
                <th className="p-3.5">Status Workflow</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0ece5]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-500">
                    No orders match the selected status or query.
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
                            • {item.productName} <span className="font-semibold text-gray-900">×{item.quantity}</span>
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
