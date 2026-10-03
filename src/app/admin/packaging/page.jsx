'use client';

import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Plus,
  Search,
  Loader2,
  Calendar,
  History,
  Truck,
  CheckCircle,
  AlertCircle,
  X,
  Trash2,
  Package,
} from 'lucide-react';

export default function AdminPackagingPage() {
  const [items, setItems] = useState([]);
  const [totalStockUnits, setTotalStockUnits] = useState(0);
  const [totalAssetValue, setTotalAssetValue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals state
  const [isEnlistModalOpen, setIsEnlistModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [historyModalItem, setHistoryModalItem] = useState(null);

  // Enlist Item Form Fields
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [description, setDescription] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [supplier, setSupplier] = useState('');
  const [isSubmittingItem, setIsSubmittingItem] = useState(false);

  // Add Batch Form Fields
  const [selectedItemId, setSelectedItemId] = useState('');
  const [batchQuantity, setBatchQuantity] = useState('');
  const [batchUnitPrice, setBatchUnitPrice] = useState('');
  const [batchSupplier, setBatchSupplier] = useState('');
  const [batchNotes, setBatchNotes] = useState('');
  const [batchDate, setBatchDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmittingBatch, setIsSubmittingBatch] = useState(false);

  const [notification, setNotice] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const fetchPackaging = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/packaging');
      const data = await res.json();
      setItems(data.items || []);
      setTotalStockUnits(data.totalStockUnits || 0);
      setTotalAssetValue(data.totalAssetValue || 0);
    } catch (e) {
      console.error('Error fetching packaging:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPackaging();
  }, []);

  const openEnlistModal = () => {
    setSku('');
    setName('');
    setDimensions('');
    setDescription('');
    setUnitPrice('');
    setQuantity('');
    setSupplier('');
    setErrorMessage('');
    setIsEnlistModalOpen(true);
  };

  const openBatchModal = (preselectedItem = null) => {
    if (preselectedItem) {
      setSelectedItemId(preselectedItem.id);
      setBatchUnitPrice(preselectedItem.unitPrice || '');
    } else if (items.length > 0) {
      setSelectedItemId(items[0].id);
      setBatchUnitPrice(items[0].unitPrice || '');
    }
    setBatchQuantity('');
    setBatchSupplier('');
    setBatchNotes('');
    setBatchDate(new Date().toISOString().split('T')[0]);
    setErrorMessage('');
    setIsBatchModalOpen(true);
  };

  const handleEnlistSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingItem(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/packaging', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sku,
          name,
          dimensions,
          description,
          unitPrice,
          quantity,
          supplier,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to enlist packaging item');
      }

      setNotice(`✓ Packaging SKU "${data.item.sku}" successfully enlisted!`);
      setTimeout(() => setNotice(''), 4000);
      setIsEnlistModalOpen(false);
      fetchPackaging();
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsSubmittingItem(false);
    }
  };

  const handleBatchSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingBatch(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/packaging/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packagingItemId: selectedItemId,
          quantity: batchQuantity,
          unitPrice: batchUnitPrice,
          supplier: batchSupplier,
          notes: batchNotes,
          receivedDate: batchDate,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to receive shipment batch');
      }

      setNotice(`✓ Added shipment of ${batchQuantity} units to SKU "${data.item.sku}". New total stock: ${data.item.quantity}`);
      setTimeout(() => setNotice(''), 4000);
      setIsBatchModalOpen(false);
      fetchPackaging();
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsSubmittingBatch(false);
    }
  };

  const handleDeleteItem = async (id, itemSku) => {
    if (!confirm(`Are you sure you want to delete packaging SKU "${itemSku}" and its shipment history?`)) return;

    try {
      const res = await fetch(`/api/packaging/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setNotice(`✓ Packaging SKU "${itemSku}" deleted.`);
        setTimeout(() => setNotice(''), 3000);
        fetchPackaging();
      } else {
        alert('Failed to delete item.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = items.filter((item) => {
    const q = search.toLowerCase();
    return (
      item.sku.toLowerCase().includes(q) ||
      item.name.toLowerCase().includes(q) ||
      (item.dimensions && item.dimensions.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#eae5de]">
        <div>
          <span className="text-[10px] tracking-widest text-[#b88b42] uppercase font-semibold">
            Logistics & Stock Control
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-medium text-[#1c1a17]">
            Packaging Items & Shipments
          </h1>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => openBatchModal()}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#dcd5cb] text-[#1c1a17] text-xs uppercase tracking-wider font-medium hover:bg-[#faf8f5] rounded-xs transition-colors shadow-xs"
          >
            <Truck className="w-3.5 h-3.5 text-[#b88b42]" />
            + Receive Batch / Shipment
          </button>

          <button
            type="button"
            onClick={openEnlistModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#1c1a17] text-white text-xs uppercase tracking-widest font-medium hover:bg-[#b88b42] transition-colors rounded-xs shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Enlist New SKU
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{notification}</span>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white border border-[#eae5de] rounded-xs shadow-xs space-y-1">
          <span className="text-[11px] uppercase tracking-wider text-gray-500 font-medium block">
            Packaging SKU Types
          </span>
          <span className="text-2xl font-serif font-semibold text-gray-900">
            {items.length}
          </span>
          <span className="text-[11px] text-gray-400 block">Boxes, pouches, inserts & ribbons</span>
        </div>

        <div className="p-4 bg-white border border-[#eae5de] rounded-xs shadow-xs space-y-1">
          <span className="text-[11px] uppercase tracking-wider text-gray-500 font-medium block">
            Total Units in Stock
          </span>
          <span className="text-2xl font-serif font-semibold text-gray-900">
            {totalStockUnits.toLocaleString()} <span className="text-xs font-normal text-gray-500">units</span>
          </span>
          <span className="text-[11px] text-emerald-700 block">Ready for customer shipments</span>
        </div>

        <div className="p-4 bg-white border border-[#eae5de] rounded-xs shadow-xs space-y-1">
          <span className="text-[11px] uppercase tracking-wider text-gray-500 font-medium block">
            Total Packaging Asset Value
          </span>
          <span className="text-2xl font-serif font-semibold text-gray-900">
            ৳{totalAssetValue.toLocaleString()}
          </span>
          <span className="text-[11px] text-gray-400 block">Evaluated by latest batch unit costs</span>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-3 border border-[#eae5de] rounded-xs">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search packaging by SKU, name, or dimensions (e.g. 12x10x4)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[#faf8f5] border border-[#dcd5cb] text-xs rounded-xs focus:outline-none focus:border-[#b88b42]"
          />
        </div>
      </div>

      {/* Packaging Items Table */}
      {isLoading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="w-8 h-8 text-[#b88b42] animate-spin" />
        </div>
      ) : (
        <div className="bg-white border border-[#eae5de] rounded-xs overflow-x-auto shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#faf8f5] border-b border-[#eae5de] text-[11px] uppercase tracking-wider text-[#6b665f]">
              <tr>
                <th className="p-3.5">SKU Code</th>
                <th className="p-3.5">Item Name & Specs</th>
                <th className="p-3.5">Dimensions</th>
                <th className="p-3.5">In-Stock Qty</th>
                <th className="p-3.5">Unit Price</th>
                <th className="p-3.5">Total Value</th>
                <th className="p-3.5">Shipment Batches</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0ece5]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-500">
                    No packaging items found. Click "Enlist New SKU" to add boxes or materials.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-[#faf8f5]/50 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-gray-900">
                      <span className="px-2 py-0.5 bg-[#f4efe8] border border-[#eae5de] rounded-xs text-[#1c1a17]">
                        {item.sku}
                      </span>
                    </td>

                    <td className="p-3.5 font-medium text-gray-900">
                      {item.name}
                      {item.description && (
                        <div className="text-[10px] text-gray-400 line-clamp-1">{item.description}</div>
                      )}
                    </td>

                    <td className="p-3.5 text-gray-600 font-mono">
                      {item.dimensions || '—'}
                    </td>

                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-xs font-semibold ${
                          item.quantity === 0
                            ? 'bg-red-100 text-red-800'
                            : item.quantity <= 25
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {item.quantity} units
                      </span>
                    </td>

                    <td className="p-3.5 font-semibold text-gray-900">
                      ৳{item.unitPrice}
                    </td>

                    <td className="p-3.5 font-semibold text-[#b88b42]">
                      ৳{(item.quantity * item.unitPrice).toLocaleString()}
                    </td>

                    <td className="p-3.5">
                      <button
                        type="button"
                        onClick={() => setHistoryModalItem(item)}
                        className="text-[11px] text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <History className="w-3 h-3" />
                        {item.batches?.length || 0} batches received
                      </button>
                    </td>

                    <td className="p-3.5 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => openBatchModal(item)}
                        className="px-2 py-1 text-[11px] bg-[#faf8f5] hover:bg-[#ebdcc7] text-[#1c1a17] border border-[#dcd5cb] rounded-xs transition-colors"
                        title="Add shipment batch to this SKU"
                      >
                        + Add Batch
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item.id, item.sku)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete packaging item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 1. Modal: Enlist New SKU */}
      {isEnlistModalOpen && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white border border-[#eae5de] rounded-xs shadow-2xl my-8">
            <div className="flex items-center justify-between p-4 border-b border-[#eae5de] bg-[#faf8f5]">
              <h2 className="font-serif text-base font-medium text-[#1c1a17] flex items-center gap-2">
                <Boxes className="w-4 h-4 text-[#b88b42]" />
                Enlist New Packaging SKU
              </h2>
              <button
                type="button"
                onClick={() => setIsEnlistModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEnlistSubmit} className="p-5 space-y-4 text-xs">
              {errorMessage && (
                <div className="p-2.5 bg-red-50 text-red-700 rounded-xs flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#1c1a17] mb-1">
                    SKU Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BOX-12104"
                    value={sku}
                    onChange={(e) => setSku(e.target.value.toUpperCase())}
                    className="w-full px-3 py-1.5 border border-[#dcd5cb] rounded-xs font-mono font-semibold focus:outline-none focus:border-[#b88b42]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#1c1a17] mb-1">
                    Dimensions (e.g. 12"x10"x4")
                  </label>
                  <input
                    type="text"
                    placeholder={'12"x10"x4"'}
                    value={dimensions}
                    onChange={(e) => setDimensions(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#dcd5cb] rounded-xs focus:outline-none focus:border-[#b88b42]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#1c1a17] mb-1">
                  Item Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rigid Kraft Presentation Shipping Box"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#dcd5cb] rounded-xs focus:outline-none focus:border-[#b88b42]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#1c1a17] mb-1">
                    Default Unit Price (৳) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="45"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#dcd5cb] rounded-xs focus:outline-none focus:border-[#b88b42]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#1c1a17] mb-1">
                    Opening Stock Quantity
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="100"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#dcd5cb] rounded-xs focus:outline-none focus:border-[#b88b42]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#1c1a17] mb-1">
                  Supplier / Vendor Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dhaka Packaging Guild"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#dcd5cb] rounded-xs focus:outline-none focus:border-[#b88b42]"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#1c1a17] mb-1">
                  Material / Specifications Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Custom foam inserts, gold foil stamped logo, etc..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#dcd5cb] rounded-xs focus:outline-none focus:border-[#b88b42]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#eae5de]">
                <button
                  type="button"
                  onClick={() => setIsEnlistModalOpen(false)}
                  className="px-4 py-2 border border-[#dcd5cb] text-gray-600 hover:bg-gray-50 rounded-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingItem}
                  className="px-5 py-2 bg-[#1c1a17] text-white hover:bg-[#b88b42] transition-colors rounded-xs shadow-xs flex items-center gap-1.5"
                >
                  {isSubmittingItem && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Enlist SKU
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Modal: Receive Batch Shipment for Existing SKU */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white border border-[#eae5de] rounded-xs shadow-2xl my-8">
            <div className="flex items-center justify-between p-4 border-b border-[#eae5de] bg-[#faf8f5]">
              <h2 className="font-serif text-base font-medium text-[#1c1a17] flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#b88b42]" />
                Receive Packaging Shipment Batch
              </h2>
              <button
                type="button"
                onClick={() => setIsBatchModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleBatchSubmit} className="p-5 space-y-4 text-xs">
              {errorMessage && (
                <div className="p-2.5 bg-red-50 text-red-700 rounded-xs flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* SKU Selector */}
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#1c1a17] mb-1">
                  Select Packaging SKU *
                </label>
                <select
                  value={selectedItemId}
                  onChange={(e) => {
                    setSelectedItemId(e.target.value);
                    const it = items.find((i) => i.id === e.target.value);
                    if (it) setBatchUnitPrice(it.unitPrice || '');
                  }}
                  className="w-full px-3 py-2 border border-[#dcd5cb] rounded-xs font-medium focus:outline-none focus:border-[#b88b42]"
                >
                  {items.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.sku} — {i.name} {i.dimensions ? `(${i.dimensions})` : ''} [Stock: {i.quantity}]
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Batch Quantity */}
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#1c1a17] mb-1">
                    Shipment Quantity *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 500"
                    value={batchQuantity}
                    onChange={(e) => setBatchQuantity(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#dcd5cb] rounded-xs font-semibold focus:outline-none focus:border-[#b88b42]"
                  />
                  <span className="text-[10px] text-gray-500">Number of units received</span>
                </div>

                {/* Batch Unit Price */}
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#1c1a17] mb-1">
                    Price per Unit in Batch (৳) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    placeholder="e.g. 45"
                    value={batchUnitPrice}
                    onChange={(e) => setBatchUnitPrice(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#dcd5cb] rounded-xs font-semibold focus:outline-none focus:border-[#b88b42]"
                  />
                  <span className="text-[10px] text-gray-500">Unit cost for this shipment</span>
                </div>
              </div>

              {/* Calculated Batch Total */}
              <div className="p-3 bg-[#faf8f5] border border-[#eae5de] rounded-xs flex items-center justify-between">
                <span className="text-gray-600 font-medium">Batch Total Cost:</span>
                <span className="font-bold text-base text-[#b88b42]">
                  ৳{((Number(batchQuantity) || 0) * (Number(batchUnitPrice) || 0)).toLocaleString()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Supplier */}
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#1c1a17] mb-1">
                    Supplier / Factory
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Carton Craft Ltd"
                    value={batchSupplier}
                    onChange={(e) => setBatchSupplier(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#dcd5cb] rounded-xs focus:outline-none focus:border-[#b88b42]"
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#1c1a17] mb-1">
                    Shipment Date
                  </label>
                  <input
                    type="date"
                    value={batchDate}
                    onChange={(e) => setBatchDate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-[#dcd5cb] rounded-xs focus:outline-none focus:border-[#b88b42]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#1c1a17] mb-1">
                  Invoice / Batch Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Invoice #PKG-8821, festive season restock"
                  value={batchNotes}
                  onChange={(e) => setBatchNotes(e.target.value)}
                  className="w-full px-3 py-1.5 border border-[#dcd5cb] rounded-xs focus:outline-none focus:border-[#b88b42]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#eae5de]">
                <button
                  type="button"
                  onClick={() => setIsBatchModalOpen(false)}
                  className="px-4 py-2 border border-[#dcd5cb] text-gray-600 hover:bg-gray-50 rounded-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingBatch}
                  className="px-5 py-2 bg-[#1c1a17] text-white hover:bg-[#b88b42] transition-colors rounded-xs shadow-xs flex items-center gap-1.5"
                >
                  {isSubmittingBatch && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Confirm & Restock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Modal: Shipment History for a SKU */}
      {historyModalItem && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white border border-[#eae5de] rounded-xs shadow-2xl my-8">
            <div className="flex items-center justify-between p-4 border-b border-[#eae5de] bg-[#faf8f5]">
              <div>
                <span className="text-[10px] tracking-widest text-[#b88b42] uppercase font-semibold">
                  Shipment Batches History
                </span>
                <h2 className="font-serif text-lg font-medium text-[#1c1a17]">
                  {historyModalItem.sku} — {historyModalItem.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setHistoryModalItem(null)}
                className="p-1 text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-x-auto text-xs">
              <table className="w-full text-left">
                <thead className="bg-[#faf8f5] text-[11px] uppercase tracking-wider text-gray-500 border-b border-[#eae5de]">
                  <tr>
                    <th className="p-2.5">Received Date</th>
                    <th className="p-2.5">Units Added</th>
                    <th className="p-2.5">Unit Price</th>
                    <th className="p-2.5">Batch Total</th>
                    <th className="p-2.5">Supplier</th>
                    <th className="p-2.5">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0ece5]">
                  {historyModalItem.batches?.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-6 text-gray-400">
                        No shipment history recorded for this SKU.
                      </td>
                    </tr>
                  ) : (
                    historyModalItem.batches?.map((b) => (
                      <tr key={b.id}>
                        <td className="p-2.5 font-mono text-gray-700">
                          {new Date(b.receivedDate).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="p-2.5 font-semibold text-emerald-800">
                          +{b.quantity}
                        </td>
                        <td className="p-2.5 text-gray-800">৳{b.unitPrice}</td>
                        <td className="p-2.5 font-semibold text-gray-900">৳{b.totalCost?.toLocaleString()}</td>
                        <td className="p-2.5 text-gray-600">{b.supplier || '—'}</td>
                        <td className="p-2.5 text-gray-500 line-clamp-1">{b.notes || '—'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              <div className="flex justify-end pt-4 mt-4 border-t border-[#eae5de]">
                <button
                  type="button"
                  onClick={() => setHistoryModalItem(null)}
                  className="px-4 py-1.5 border border-[#dcd5cb] text-gray-600 hover:bg-gray-50 rounded-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
