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

  // Packaging Modal state
  const [packagingModalOrder, setPackagingModalOrder] = useState(null);
  const [packagingItemsList, setPackagingItemsList] = useState([]);
  const [selectedPackaging, setSelectedPackaging] = useState([]); // [{ packagingItemId, quantity }]
  const [itemAdjustments, setItemAdjustments] = useState([]); // [{ orderItemId, quantity }]
  const [isSubmittingPackaging, setIsSubmittingPackaging] = useState(false);

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

  const fetchPackagingInventory = async () => {
    try {
      const res = await fetch('/api/packaging');
      const data = await res.json();
      setPackagingItemsList(data.items || []);
    } catch (e) {
      console.error('Error fetching packaging items:', e);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchPackagingInventory();
  }, []);

  const openPackagingModal = (order) => {
    if (!order) return;
    setPackagingModalOrder(order);
    // Initialize item adjustments with current quantities
    const safeItems = Array.isArray(order.items) ? order.items : [];
    setItemAdjustments(
      safeItems.map((i) => ({
        orderItemId: i.id,
        productName: i.productName || 'Product',
        colorVariantName: i.colorVariantName || null,
        originalQty: Number(i.quantity) || 1,
        quantity: Number(i.quantity) || 1,
        wholesaleCost: Number(i.wholesaleCost) || 0,
      }))
    );
    setSelectedPackaging([]);
  };

  const closePackagingModal = () => {
    setPackagingModalOrder(null);
    setSelectedPackaging([]);
    setItemAdjustments([]);
  };

  const handleAddPackagingItemRow = (pkgId) => {
    if (!pkgId) return;
    if (selectedPackaging.some((p) => p.packagingItemId === pkgId)) return;
    setSelectedPackaging((prev) => [...prev, { packagingItemId: pkgId, quantity: 1 }]);
  };

  const handleUpdatePackagingQty = (pkgId, qty) => {
    const val = Math.max(1, Number(qty) || 1);
    setSelectedPackaging((prev) =>
      prev.map((p) => (p.packagingItemId === pkgId ? { ...p, quantity: val } : p))
    );
  };

  const handleRemovePackagingRow = (pkgId) => {
    setSelectedPackaging((prev) => prev.filter((p) => p.packagingItemId !== pkgId));
  };

  const handleUpdateItemAdjQty = (orderItemId, qty) => {
    const val = Math.max(1, Number(qty) || 1);
    setItemAdjustments((prev) =>
      prev.map((item) => (item.orderItemId === orderItemId ? { ...item, quantity: val } : item))
    );
  };

  const handleSubmitPackaging = async () => {
    if (!packagingModalOrder) return;
    setIsSubmittingPackaging(true);
    try {
      const res = await fetch(`/api/orders/${packagingModalOrder.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'packaged',
          packagingItems: selectedPackaging,
          itemAdjustments: itemAdjustments.map((a) => ({
            orderItemId: a.orderItemId,
            quantity: a.quantity,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update order packaging');
      }

      setNotice(`✓ Order #${data.order.orderNumber} successfully Packaged! Cost recorded & packaging inventory deducted.`);
      setTimeout(() => setNotice(''), 4000);
      closePackagingModal();
      fetchOrders();
      fetchPackagingInventory();
    } catch (err) {
      alert(err.message || 'Failed to submit packaging');
    } finally {
      setIsSubmittingPackaging(false);
    }
  };

  const handleStatusChange = async (order, newStatus) => {
    // If transitioning from confirmed to packaged, trigger modal!
    if (order.status === 'confirmed' && newStatus === 'packaged') {
      openPackagingModal(order);
      return;
    }

    setUpdatingId(order.id);
    setNotice('');
    try {
      const res = await fetch(`/api/orders/${order.id}/status`, {
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

  // State machine transition helper
  const getAllowedTransitions = (currentStatus) => {
    switch (currentStatus) {
      case 'pending':
        return [
          { status: 'confirmed', label: 'Confirm Order', color: 'bg-blue-600 hover:bg-blue-700 text-white' },
          { status: 'cancelled', label: 'Cancel', color: 'bg-gray-200 hover:bg-gray-300 text-gray-700' },
        ];
      case 'confirmed':
        return [
          { status: 'packaged', label: 'Package & Box', color: 'bg-amber-600 hover:bg-amber-700 text-white' },
          { status: 'cancelled', label: 'Cancel', color: 'bg-gray-200 hover:bg-gray-300 text-gray-700' },
        ];
      case 'packaged':
        return [
          { status: 'in_transit', label: 'Ship (In Transit)', color: 'bg-indigo-600 hover:bg-indigo-700 text-white' },
          { status: 'cancelled', label: 'Cancel', color: 'bg-gray-200 hover:bg-gray-300 text-gray-700' },
        ];
      case 'in_transit':
        return [
          { status: 'delivered', label: 'Mark Delivered', color: 'bg-emerald-600 hover:bg-emerald-700 text-white' },
          { status: 'returned', label: 'Mark Returned', color: 'bg-rose-600 hover:bg-rose-700 text-white' },
        ];
      case 'delivered':
        return [
          { status: 'returned', label: 'Return Parcel', color: 'bg-rose-600 hover:bg-rose-700 text-white' },
        ];
      case 'returned':
      case 'cancelled':
      default:
        return []; // Locked!
    }
  };

  // Helper to compute orders & product quantities for each status
  const getStatusStats = (statusKey) => {
    const matching = statusKey === 'all'
      ? (allOrders || [])
      : (allOrders || []).filter((o) => o?.status === statusKey);

    const totalOrdersCount = matching.length;
    const totalItemsCount = matching.reduce((sum, o) => {
      const itemsInOrder = Array.isArray(o?.items)
        ? o.items.reduce((s, i) => s + (Number(i?.quantity) || 1), 0)
        : 0;
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

  const filtered = (allOrders || []).filter((o) => {
    if (!o) return false;
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    const q = (search || '').toLowerCase();
    const orderNum = (o.orderNumber || '').toLowerCase();
    const custName = (o.customerName || '').toLowerCase();
    const custPhone = (o.customerPhone || '');
    const addr = (o.deliveryAddress || '').toLowerCase();

    const matchesSearch =
      orderNum.includes(q) ||
      custName.includes(q) ||
      custPhone.includes(q) ||
      addr.includes(q);

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
                          #{order.orderNumber || 'N/A'}
                        </span>
                        <span className="text-[11px] text-gray-500 block">
                          {order.createdAt
                            ? new Date(order.createdAt).toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : '—'}
                        </span>
                        {order.inventoryAdjusted && (
                          <span className="inline-block px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200 rounded-xs">
                            ✓ Stock Reduced
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 space-y-1">
                        <span className="font-medium text-gray-900 block">{order.customerName || 'Anonymous'}</span>
                        {order.customerPhone && (
                          <div className="flex items-center gap-1 text-[11px] text-[#b88b42]">
                            <Phone className="w-3 h-3" />
                            <a href={`tel:${order.customerPhone}`} className="hover:underline">
                              {order.customerPhone}
                            </a>
                          </div>
                        )}
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
                          {order.deliveryAddress || 'No address provided'}
                        </p>
                        {order.notes && (
                          <p className="text-[10px] text-gray-400 italic">Note: {order.notes}</p>
                        )}
                      </td>

                      <td className="p-3.5 space-y-1">
                        {Array.isArray(order.items) &&
                          order.items.map((item) => (
                            <div key={item.id} className="text-[11px] text-gray-700">
                              • {item.productName || 'Product'}{' '}
                              {item.colorVariantName && (
                                <span className="text-[#0f388a]">({item.colorVariantName})</span>
                              )}{' '}
                              <span className="font-semibold text-gray-900">×{item.quantity}</span>
                            </div>
                          ))}
                      </td>

                      <td className="p-3.5 font-semibold text-gray-900">
                        ৳{Number(order.totalAmount || 0).toLocaleString()}
                        <div className="text-[10px] text-gray-400 font-normal">
                          (incl. ৳{Number(order.deliveryCharge || 0)} delivery)
                        </div>
                        {Number(order.totalCost || 0) > 0 && (
                          <div className="mt-1.5 pt-1 border-t border-[#f0ece5] text-[10px] text-[#0f388a] font-normal">
                            Cost: <strong>৳{Number(order.totalCost).toLocaleString()}</strong>
                            {Array.isArray(order.packagingItems) && order.packagingItems.length > 0 && (
                              <span className="block text-gray-500">
                                ({order.packagingItems.length} packaging attached)
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      <td className="p-3.5">
                        <div className="space-y-1.5">
                          <span
                            className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-xs border ${
                              STATUS_OPTIONS.find((s) => s.value === order.status)?.color || 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {(order.status || 'pending').replace('_', ' ')}
                          </span>

                          {/* Strict Transition Action Buttons */}
                          <div className="flex flex-col gap-1 pt-1">
                            {getAllowedTransitions(order.status).length === 0 ? (
                              <span className="text-[10px] text-gray-400 italic">Locked</span>
                            ) : (
                              getAllowedTransitions(order.status).map((t) => (
                                <button
                                  key={t.status}
                                  type="button"
                                  disabled={updatingId === order.id}
                                  onClick={() => handleStatusChange(order, t.status)}
                                  className={`px-2 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-xs transition-colors text-left flex items-center justify-between ${t.color}`}
                                >
                                  <span>{t.label}</span>
                                  {updatingId === order.id ? (
                                    <Loader2 className="w-2.5 h-2.5 animate-spin ml-1" />
                                  ) : (
                                    <ArrowRight className="w-2.5 h-2.5 ml-1" />
                                  )}
                                </button>
                              ))
                            )}
                          </div>
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

      {/* Packaging Modal for Confirmed -> Packaged Transition */}
      {packagingModalOrder && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white border border-[#eae5de] rounded-xs shadow-2xl overflow-hidden my-8 p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#eae5de]">
              <div>
                <span className="text-[10px] tracking-widest text-[#b88b42] uppercase font-semibold">
                  Packaging & Fulfillment Check
                </span>
                <h3 className="font-serif text-xl font-medium text-[#1c1a17]">
                  Order #{packagingModalOrder.orderNumber}
                </h3>
              </div>
              <button
                type="button"
                onClick={closePackagingModal}
                className="text-gray-400 hover:text-gray-700 text-sm"
              >
                ✕
              </button>
            </div>

            {/* Step 1: Adjust Product Quantities */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs uppercase tracking-wider font-semibold text-gray-900">
                  1. Verify / Adjust Product Quantities in Package:
                </label>
                <span className="text-[11px] text-gray-500">
                  Reduce quantity if customer changed order before packing
                </span>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {itemAdjustments.map((item) => (
                  <div
                    key={item.orderItemId}
                    className="p-3 bg-[#faf8f5] border border-[#eae5de] rounded-xs flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="font-medium text-xs text-gray-900">{item.productName}</div>
                      {item.colorVariantName && (
                        <div className="text-[10px] text-[#0f388a]">Color: {item.colorVariantName}</div>
                      )}
                      <div className="text-[10px] text-gray-500">
                        Wholesale Cost: ৳{item.wholesaleCost} / unit
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-gray-500">Qty:</span>
                      <input
                        type="number"
                        min="1"
                        max={item.originalQty}
                        value={item.quantity}
                        onChange={(e) => handleUpdateItemAdjQty(item.orderItemId, e.target.value)}
                        className="w-16 px-2 py-1 bg-white border border-[#dcd5cb] text-xs font-semibold text-center rounded-xs focus:outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 2: Tag Packaging Items */}
            <div className="space-y-3 pt-2 border-t border-[#eae5de]">
              <div className="flex items-center justify-between">
                <label className="text-xs uppercase tracking-wider font-semibold text-gray-900">
                  2. Add Packaging Items (Boxes, Pouches, Ribbons):
                </label>
                <span className="text-[11px] text-gray-500">
                  Multiple items can be tagged to single order
                </span>
              </div>

              {/* Add Packaging Item Dropdown */}
              <div className="flex items-center gap-2">
                <select
                  defaultValue=""
                  onChange={(e) => {
                    handleAddPackagingItemRow(e.target.value);
                    e.target.value = '';
                  }}
                  className="w-full px-3 py-2 bg-[#faf8f5] border border-[#dcd5cb] text-xs rounded-xs focus:outline-none"
                >
                  <option value="" disabled>
                    + Select packaging item to add...
                  </option>
                  {packagingItemsList.map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.sku} - {pkg.name} ({pkg.quantity} in stock, ৳{pkg.unitPrice}/unit)
                    </option>
                  ))}
                </select>
              </div>

              {/* Tagged Packaging List */}
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {selectedPackaging.length === 0 ? (
                  <p className="text-xs text-gray-400 italic py-2">
                    No packaging item tagged yet. Select an item from above to include it in the package cost.
                  </p>
                ) : (
                  selectedPackaging.map((row) => {
                    const itemData = packagingItemsList.find((p) => p.id === row.packagingItemId);
                    if (!itemData) return null;
                    return (
                      <div
                        key={row.packagingItemId}
                        className="p-2.5 bg-white border border-[#eae5de] rounded-xs flex items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <div className="font-semibold text-gray-900">
                            {itemData.name} ({itemData.sku})
                          </div>
                          <div className="text-[10px] text-gray-500">
                            Unit Cost: ৳{itemData.unitPrice} | Stock Available: {itemData.quantity}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] text-gray-500">Qty:</span>
                            <input
                              type="number"
                              min="1"
                              value={row.quantity}
                              onChange={(e) =>
                                handleUpdatePackagingQty(row.packagingItemId, e.target.value)
                              }
                              className="w-14 px-2 py-1 bg-[#faf8f5] border border-[#dcd5cb] text-xs font-semibold text-center rounded-xs focus:outline-none"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemovePackagingRow(row.packagingItemId)}
                            className="text-rose-600 hover:text-rose-800 text-xs px-1"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Cost Summary Preview */}
            <div className="p-3.5 bg-[#faf8f5] border border-[#eae5de] rounded-xs text-xs space-y-1">
              <div className="flex justify-between text-gray-600">
                <span>Products Wholesale Cost:</span>
                <span>
                  ৳
                  {itemAdjustments
                    .reduce((sum, i) => sum + (i.wholesaleCost || 0) * i.quantity, 0)
                    .toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Packaging Materials Cost:</span>
                <span>
                  ৳
                  {selectedPackaging
                    .reduce((sum, row) => {
                      const item = packagingItemsList.find((p) => p.id === row.packagingItemId);
                      return sum + (item ? item.unitPrice * row.quantity : 0);
                    }, 0)
                    .toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between font-semibold text-gray-900 pt-1 border-t border-[#eae5de]">
                <span>Total Calculated Order Cost:</span>
                <span className="text-[#0f388a]">
                  ৳
                  {(
                    itemAdjustments.reduce((sum, i) => sum + (i.wholesaleCost || 0) * i.quantity, 0) +
                    selectedPackaging.reduce((sum, row) => {
                      const item = packagingItemsList.find((p) => p.id === row.packagingItemId);
                      return sum + (item ? item.unitPrice * row.quantity : 0);
                    }, 0)
                  ).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={closePackagingModal}
                disabled={isSubmittingPackaging}
                className="px-4 py-2 border border-[#dcd5cb] text-xs font-medium text-gray-700 hover:bg-[#faf8f5] rounded-xs transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSubmitPackaging}
                disabled={isSubmittingPackaging}
                className="px-5 py-2 bg-[#b88b42] text-white text-xs uppercase tracking-wider font-semibold hover:bg-[#9a7332] rounded-xs transition-colors flex items-center gap-1.5 shadow-xs"
              >
                {isSubmittingPackaging ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Packaging...
                  </>
                ) : (
                  'Complete & Pack Order'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
