'use client';

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Package,
  AlertTriangle,
  Compass,
  Calendar,
  Loader2,
  CheckCircle,
  Truck,
  RotateCcw,
  XCircle,
  Clock,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const [filter, setFilter] = useState('month'); // 'today', 'week', 'month', or custom date
  const [customDate, setCustomDate] = useState('');
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMetrics = async (activeFilter) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/dashboard?filter=${activeFilter}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Error fetching dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics(filter);
  }, [filter]);

  const handleCustomDateSubmit = (e) => {
    e.preventDefault();
    if (customDate) {
      setFilter(customDate);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Time Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#eae5de]">
        <div>
          <span className="text-[10px] tracking-widest text-[#b88b42] uppercase font-semibold">
            Overview & Metrics
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-medium text-[#1c1a17]">
            Atelier Dashboard
          </h1>
        </div>

        {/* Date Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setFilter('today')}
            className={`px-3 py-1.5 text-xs font-medium uppercase tracking-wider rounded-xs border transition-colors ${
              filter === 'today'
                ? 'bg-[#1c1a17] text-white border-[#1c1a17]'
                : 'bg-white text-[#6b665f] border-[#dcd5cb] hover:bg-[#faf8f5]'
            }`}
          >
            Today
          </button>

          <button
            type="button"
            onClick={() => setFilter('week')}
            className={`px-3 py-1.5 text-xs font-medium uppercase tracking-wider rounded-xs border transition-colors ${
              filter === 'week'
                ? 'bg-[#1c1a17] text-white border-[#1c1a17]'
                : 'bg-white text-[#6b665f] border-[#dcd5cb] hover:bg-[#faf8f5]'
            }`}
          >
            This Week
          </button>

          <button
            type="button"
            onClick={() => setFilter('month')}
            className={`px-3 py-1.5 text-xs font-medium uppercase tracking-wider rounded-xs border transition-colors ${
              filter === 'month'
                ? 'bg-[#1c1a17] text-white border-[#1c1a17]'
                : 'bg-white text-[#6b665f] border-[#dcd5cb] hover:bg-[#faf8f5]'
            }`}
          >
            This Month
          </button>

          {/* Specific Day Picker */}
          <form onSubmit={handleCustomDateSubmit} className="flex items-center gap-1.5">
            <input
              type="date"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-[#dcd5cb] text-xs rounded-xs focus:outline-none focus:border-[#b88b42]"
            />
            <button
              type="submit"
              className="px-2.5 py-1.5 bg-[#b88b42] text-white text-xs rounded-xs hover:bg-[#9e7135] transition-colors"
            >
              Filter Day
            </button>
          </form>
        </div>
      </div>

      {isLoading ? (
        <div className="py-24 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#b88b42] animate-spin" />
        </div>
      ) : data ? (
        <>
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Income */}
            <div className="p-5 bg-white border border-[#eae5de] rounded-xs shadow-xs space-y-2">
              <div className="flex items-center justify-between text-[#8e8880]">
                <span className="text-xs uppercase tracking-wider font-medium">Income / Revenue</span>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-serif font-semibold text-[#1c1a17]">
                ৳{data.totalIncome?.toLocaleString() || 0}
              </div>
              <div className="text-[11px] text-[#6b665f]">
                Filtered by: <span className="font-semibold capitalize">{data.filter}</span> (excluding cancelled/returned)
              </div>
            </div>

            {/* Total Orders */}
            <div className="p-5 bg-white border border-[#eae5de] rounded-xs shadow-xs space-y-2">
              <div className="flex items-center justify-between text-[#8e8880]">
                <span className="text-xs uppercase tracking-wider font-medium">Total Orders</span>
                <Package className="w-4 h-4 text-[#b88b42]" />
              </div>
              <div className="text-2xl font-serif font-semibold text-[#1c1a17]">
                {data.totalOrders || 0}
              </div>
              <div className="text-[11px] text-[#6b665f]">
                Delivered: <span className="font-semibold text-emerald-700">{data.statusCounts?.delivered || 0}</span> • Pending: <span className="font-semibold text-amber-700">{data.statusCounts?.pending || 0}</span>
              </div>
            </div>

            {/* Total Inventory Units */}
            <div className="p-5 bg-white border border-[#eae5de] rounded-xs shadow-xs space-y-2">
              <div className="flex items-center justify-between text-[#8e8880]">
                <span className="text-xs uppercase tracking-wider font-medium">Stock for Logistics</span>
                <Package className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-serif font-semibold text-[#1c1a17]">
                {data.totalInventoryUnits || 0} <span className="text-sm font-normal text-gray-500">units</span>
              </div>
              <div className="text-[11px] text-[#6b665f]">
                Wholesale asset: <span className="font-semibold">৳{data.totalWholesaleValue?.toLocaleString() || 0}</span>
              </div>
            </div>

            {/* Procurement Travel Costs */}
            <div className="p-5 bg-white border border-[#eae5de] rounded-xs shadow-xs space-y-2">
              <div className="flex items-center justify-between text-[#8e8880]">
                <span className="text-xs uppercase tracking-wider font-medium">Procure Travel Cost</span>
                <Compass className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-serif font-semibold text-[#1c1a17]">
                ৳{data.totalProcurementCost?.toLocaleString() || 0}
              </div>
              <div className="text-[11px] text-[#6b665f]">
                Transport, food, and wholesale expenses in this period
              </div>
            </div>
          </div>

          {/* Status Breakdown Pills */}
          <div className="p-4 bg-white border border-[#eae5de] rounded-xs">
            <span className="text-xs uppercase tracking-wider font-semibold text-[#1c1a17] block mb-3">
              Order Status Pipeline:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-center">
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xs">
                <span className="text-lg font-bold text-amber-800">{data.statusCounts?.pending || 0}</span>
                <span className="block text-[10px] uppercase tracking-wider text-amber-700 font-medium">Pending</span>
              </div>
              <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xs">
                <span className="text-lg font-bold text-blue-800">{data.statusCounts?.confirmed || 0}</span>
                <span className="block text-[10px] uppercase tracking-wider text-blue-700 font-medium">Confirmed</span>
              </div>
              <div className="p-2.5 bg-indigo-50 border border-indigo-200 rounded-xs">
                <span className="text-lg font-bold text-indigo-800">{data.statusCounts?.in_transit || 0}</span>
                <span className="block text-[10px] uppercase tracking-wider text-indigo-700 font-medium">In Transit</span>
              </div>
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xs">
                <span className="text-lg font-bold text-emerald-800">{data.statusCounts?.delivered || 0}</span>
                <span className="block text-[10px] uppercase tracking-wider text-emerald-700 font-medium">Delivered</span>
              </div>
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xs">
                <span className="text-lg font-bold text-rose-800">{data.statusCounts?.returned || 0}</span>
                <span className="block text-[10px] uppercase tracking-wider text-rose-700 font-medium">Returned</span>
              </div>
              <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-xs">
                <span className="text-lg font-bold text-gray-800">{data.statusCounts?.cancelled || 0}</span>
                <span className="block text-[10px] uppercase tracking-wider text-gray-700 font-medium">Cancelled</span>
              </div>
            </div>
          </div>

          {/* Low Stock Alerts & Recent Orders */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Low Stock Logistics Alert */}
            <div className="p-5 bg-white border border-[#eae5de] rounded-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <h3 className="font-serif text-lg font-medium text-[#1c1a17]">
                    Low Stock Logistics Alert (≤ 5)
                  </h3>
                </div>
                <Link href="/admin/products" className="text-xs text-[#b88b42] hover:underline">
                  Manage Stock →
                </Link>
              </div>

              {data.lowStockProducts?.length === 0 ? (
                <p className="text-xs text-emerald-700 bg-emerald-50 p-3 rounded-xs border border-emerald-200">
                  ✓ All products have adequate stock levels.
                </p>
              ) : (
                <div className="divide-y divide-[#f0ece5] text-xs">
                  {data.lowStockProducts.map((p) => (
                    <div key={p.id} className="py-2.5 flex items-center justify-between">
                      <div>
                        <span className="font-medium text-gray-900 block">{p.name}</span>
                        <span className="text-gray-500 text-[11px]">{p.category} • ৳{p.price}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-xs font-semibold ${
                        p.quantity === 0
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {p.quantity === 0 ? 'Out of Stock' : `${p.quantity} left`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Orders Overview */}
            <div className="p-5 bg-white border border-[#eae5de] rounded-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-lg font-medium text-[#1c1a17]">
                  Recent Orders
                </h3>
                <Link href="/admin/orders" className="text-xs text-[#b88b42] hover:underline">
                  View All Orders →
                </Link>
              </div>

              {data.recentOrders?.length === 0 ? (
                <p className="text-xs text-gray-500 py-4 text-center">No orders found in this period.</p>
              ) : (
                <div className="divide-y divide-[#f0ece5] text-xs">
                  {data.recentOrders.map((o) => (
                    <div key={o.id} className="py-2.5 flex items-center justify-between">
                      <div>
                        <span className="font-medium text-gray-900 block">#{o.orderNumber}</span>
                        <span className="text-gray-500 text-[11px]">
                          {o.customerName} ({o.customerPhone})
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-gray-900 block">৳{o.totalAmount}</span>
                        <span className="text-[10px] uppercase font-semibold text-amber-700 tracking-wider">
                          {o.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
