'use client';

import React, { useState, useEffect } from 'react';
import {
  Compass,
  Plus,
  Loader2,
  Calendar,
  CheckCircle,
  Package,
  Layers,
  ArrowRight,
  ExternalLink,
  Trash2,
  Sparkles,
  Upload,
  X,
  AlertCircle,
  Palette,
  Image as ImageIcon,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminProcurementPage() {
  const [logs, setLogs] = useState([]);
  const [totalExpenditure, setTotalExpenditure] = useState(0);
  const [totalWholesaleSourced, setTotalWholesaleSourced] = useState(0);
  const [totalTravelCosts, setTotalTravelCosts] = useState(0);
  const [existingProducts, setExistingProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [title, setTitle] = useState('');
  const [supplier, setSupplier] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [transportCost, setTransportCost] = useState('');
  const [foodCost, setFoodCost] = useState('');
  const [otherCost, setOtherCost] = useState('');
  const [notes, setNotes] = useState('');

  // Procured items rows inside the trip
  const [sourcedItems, setSourcedItems] = useState([
    { name: '', category: 'Necklaces', colorName: '', colorCode: '#0f388a', quantity: 10, unitPrice: 500 },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Enlistment Modal state
  const [enlistingItem, setEnlistingItem] = useState(null);
  const [enlistType, setEnlistType] = useState('new'); // 'new' | 'restock'
  const [enlistName, setEnlistName] = useState('');
  const [enlistCategory, setEnlistCategory] = useState('Rings');
  const [enlistRetailPrice, setEnlistRetailPrice] = useState('');
  const [enlistWholesaleCost, setEnlistWholesaleCost] = useState('');
  const [enlistQuantity, setEnlistQuantity] = useState('');
  const [enlistDescription, setEnlistDescription] = useState('');
  const [enlistTags, setEnlistTags] = useState('Procured,New Arrival');
  const [enlistCommonImages, setEnlistCommonImages] = useState([]);
  const [enlistVariants, setEnlistVariants] = useState([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [enlistSelectedProductId, setEnlistSelectedProductId] = useState('');
  const [isSubmittingEnlist, setIsSubmittingEnlist] = useState(false);
  const [enlistFormError, setEnlistFormError] = useState('');

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/procurement');
      const data = await res.json();
      setLogs(data.logs || []);
      setTotalExpenditure(data.totalExpenditure || 0);
      setTotalWholesaleSourced(data.totalWholesaleSourced || 0);
      setTotalTravelCosts(data.totalTravelCosts || 0);
    } catch (e) {
      console.error('Error fetching procurement logs:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchExistingProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setExistingProducts(data.products || []);
    } catch (e) {
      console.error('Error fetching existing products:', e);
    }
  };

  useEffect(() => {
    fetchLogs();
    fetchExistingProducts();
  }, []);

  // Item row operations
  const handleAddItemRow = () => {
    setSourcedItems((prev) => [
      ...prev,
      { name: '', category: 'Necklaces', colorName: '', colorCode: '#0f388a', quantity: 5, unitPrice: 400 },
    ]);
  };

  const handleUpdateItemRow = (index, field, value) => {
    setSourcedItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleRemoveItemRow = (index) => {
    setSourcedItems((prev) => prev.filter((_, i) => i !== index));
  };

  // AUTO-CALCULATE Wholesale Total from item batches
  const autoWholesaleSum = sourcedItems.reduce((sum, item) => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.unitPrice) || 0;
    return sum + qty * price;
  }, 0);

  const calculatedTravelSum =
    (Number(transportCost) || 0) + (Number(foodCost) || 0) + (Number(otherCost) || 0);

  const calculatedGrandTotal = calculatedTravelSum + autoWholesaleSum;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMsg('');

    try {
      const validItems = sourcedItems.filter((i) => i.name && i.name.trim().length > 0);

      const res = await fetch('/api/procurement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim() || 'Procurement & Sourcing Run',
          supplier: supplier.trim(),
          date,
          transportCost,
          foodCost,
          otherCost,
          notes,
          items: validItems,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save procurement run');
      }

      setSuccessMsg(`✓ Procurement run logged! Auto-calculated wholesale cost: ৳${data.log.wholesaleProductCost.toLocaleString()}`);
      setTimeout(() => setSuccessMsg(''), 4000);

      // Reset form
      setTitle('');
      setSupplier('');
      setTransportCost('');
      setFoodCost('');
      setOtherCost('');
      setNotes('');
      setSourcedItems([
        { name: '', category: 'Necklaces', colorName: '', colorCode: '#0f388a', quantity: 10, unitPrice: 500 },
      ]);
      fetchLogs();
    } catch (err) {
      alert(err.message || 'Error saving procurement trip');
    } finally {
      setIsSubmitting(false);
    }
  };

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || 'Failed to upload image');
    return data.url;
  };

  const handleUploadCommonImage = async (file) => {
    if (!file) return;
    if (enlistCommonImages.length >= 2) {
      alert('Maximum 2 common images allowed.');
      return;
    }
    setIsUploadingImage(true);
    try {
      const url = await uploadFile(file);
      setEnlistCommonImages((prev) => [...prev, url].slice(0, 2));
    } catch (err) {
      alert(err.message || 'Upload failed');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleAddCommonImageUrl = () => {
    const url = prompt('Enter public URL for common image:');
    if (url && url.trim()) {
      if (enlistCommonImages.length >= 2) {
        alert('Maximum 2 common images allowed.');
        return;
      }
      setEnlistCommonImages((prev) => [...prev, url.trim()].slice(0, 2));
    }
  };

  // Enlist Color Variant Helpers
  const addEnlistVariant = () => {
    setEnlistVariants((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        colorName: '',
        colorCode: '#0f388a',
        quantity: 5,
        images: [],
      },
    ]);
  };

  const removeEnlistVariant = (index) => {
    setEnlistVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const updateEnlistVariantField = (index, field, value) => {
    setEnlistVariants((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleEnlistVariantFileUpload = async (index, file) => {
    if (!file) return;
    setIsUploadingImage(true);
    try {
      const url = await uploadFile(file);
      setEnlistVariants((prev) => {
        const copy = [...prev];
        const vImages = copy[index].images || [];
        copy[index] = { ...copy[index], images: [...vImages, url] };
        return copy;
      });
    } catch (err) {
      alert(err.message || 'Variant image upload failed');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleAddEnlistVariantImageUrl = (index) => {
    const url = prompt('Enter image URL for this color variant:');
    if (url && url.trim()) {
      setEnlistVariants((prev) => {
        const copy = [...prev];
        const vImages = copy[index].images || [];
        copy[index] = { ...copy[index], images: [...vImages, url.trim()] };
        return copy;
      });
    }
  };

  const removeEnlistVariantImage = (variantIndex, imageIndex) => {
    setEnlistVariants((prev) => {
      const copy = [...prev];
      copy[variantIndex].images = copy[variantIndex].images.filter((_, i) => i !== imageIndex);
      return copy;
    });
  };

  // Open Enlist Modal (supports both direct enlistment and from sourced procurement item)
  const openEnlistModal = (item = null) => {
    setEnlistingItem(item || { isDirect: true, name: '', category: 'Rings', unitPrice: 0, quantity: 10 });
    setEnlistName(item?.name || '');
    setEnlistCategory(item?.category || 'Rings');
    setEnlistRetailPrice(String(item?.unitPrice ? item.unitPrice * 2 : ''));
    setEnlistWholesaleCost(String(item?.unitPrice || ''));
    setEnlistQuantity(String(item?.quantity || '10'));
    setEnlistDescription(
      item?.category
        ? `Fine handcrafted ${item.category.toLowerCase()} sourced with genuine quality materials.`
        : 'Fine handcrafted jewelry sourced with genuine quality materials.'
    );
    setEnlistTags('Procured,New Arrival,Handcrafted');
    setEnlistCommonImages([]);

    // Initialize with item's color if present, else default empty variant
    if (item?.colorName) {
      setEnlistVariants([
        {
          id: Math.random().toString(36).substring(2, 9),
          colorName: item.colorName,
          colorCode: item.colorCode || '#0f388a',
          quantity: item.quantity || 5,
          images: [],
        },
      ]);
    } else {
      setEnlistVariants([]);
    }

    setEnlistType('new');
    setEnlistSelectedProductId(existingProducts.length > 0 ? existingProducts[0].id : '');
    setEnlistFormError('');
  };

  const handleEnlistSubmit = async () => {
    if (!enlistingItem) return;
    setEnlistFormError('');

    if (enlistType === 'new') {
      if (!enlistName.trim() || enlistRetailPrice === '') {
        setEnlistFormError('Product Name and Retail Selling Price are required.');
        return;
      }
    }

    setIsSubmittingEnlist(true);

    try {
      const isDirect = !enlistingItem.id;

      if (isDirect) {
        // Direct enlistment via POST /api/products
        const payload = {
          name: enlistName.trim(),
          category: enlistCategory,
          price: Number(enlistRetailPrice),
          wholesaleCost: Number(enlistWholesaleCost) || 0,
          quantity: Number(enlistQuantity) || 0,
          description: enlistDescription,
          tags: enlistTags,
          commonImages: enlistCommonImages,
          variants: enlistVariants,
        };

        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to enlist product');
        }

        setSuccessMsg(`✓ Successfully enlisted "${data.product?.name || enlistName}" to catalog!`);
      } else {
        // Enlistment linked to a procurement item batch
        const payload = {
          procurementItemId: enlistingItem.id,
          existingProductId: enlistType === 'restock' ? enlistSelectedProductId : null,
          name: enlistName.trim(),
          category: enlistCategory,
          retailPrice: Number(enlistRetailPrice),
          wholesaleCost: Number(enlistWholesaleCost) || enlistingItem.unitPrice,
          quantity: Number(enlistQuantity) || enlistingItem.quantity,
          description: enlistDescription,
          tags: enlistTags,
          commonImages: enlistCommonImages,
          variants: enlistVariants,
        };

        const res = await fetch('/api/procurement/enlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to enlist product');
        }

        setSuccessMsg(`✓ ${data.message}`);
      }

      setTimeout(() => setSuccessMsg(''), 5000);
      setEnlistingItem(null);
      fetchLogs();
      fetchExistingProducts();
    } catch (err) {
      setEnlistFormError(err.message || 'Error enlisting product');
    } finally {
      setIsSubmittingEnlist(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with 3 Core KPI Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#eae5de]">
        <div>
          <span className="text-[10px] tracking-widest text-[#b88b42] uppercase font-semibold">
            Supply Chain & Origin
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-medium text-[#1c1a17]">
            Procurement, Travel & Sourcing Pipeline
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <button
            type="button"
            onClick={() => openEnlistModal(null)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0f388a] text-white text-xs uppercase tracking-widest font-semibold hover:bg-[#0a2561] transition-colors rounded-lg shadow-md cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" /> Enlist New Product
          </button>

          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-2.5 bg-white border border-[#eae5de] rounded-xs shadow-xs text-xs">
              <span className="text-gray-500 uppercase tracking-wider block text-[9px]">
                Wholesale Sourced
              </span>
              <span className="text-base font-serif font-bold text-[#0f388a]">
                ৳{totalWholesaleSourced?.toLocaleString()}
              </span>
            </div>

            <div className="p-2.5 bg-white border border-[#eae5de] rounded-xs shadow-xs text-xs">
              <span className="text-gray-500 uppercase tracking-wider block text-[9px]">
                Travel & Food Costs
              </span>
              <span className="text-base font-serif font-bold text-gray-800">
                ৳{totalTravelCosts?.toLocaleString()}
              </span>
            </div>

            <div className="p-2.5 bg-white border border-[#b88b42]/30 bg-[#faf8f5] rounded-xs shadow-xs text-xs">
              <span className="text-gray-500 uppercase tracking-wider block text-[9px]">
                Total Procurement Outlay
              </span>
              <span className="text-base font-serif font-bold text-[#b88b42]">
                ৳{totalExpenditure?.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Log New Trip & Enlist Sourced Items Form */}
      <div className="bg-white border border-[#eae5de] rounded-xs p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-[#f0ece5]">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-[#b88b42]" />
            <div>
              <h2 className="font-serif text-lg font-medium text-[#1c1a17]">
                Record Procurement Sourcing Run
              </h2>
              <p className="text-[11px] text-gray-500">
                Log travel expenses & enlist purchased products. Wholesale costs are auto-calculated!
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-semibold text-[#b88b42] bg-[#fbf8f1] px-2.5 py-1 border border-[#ebdcc7] rounded-xs">
            Auto-Calculated Sourcing Total: ৳{calculatedGrandTotal.toLocaleString()}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          {/* Section 1: Trip & Travel Overhead */}
          <div className="space-y-3">
            <span className="text-xs uppercase tracking-wider font-semibold text-[#1c1a17] block">
              1. Trip Details & Travel Overhead:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* Trip Title */}
              <div>
                <label className="block text-[11px] text-[#6b665f] mb-1">Trip Name / Market</label>
                <input
                  type="text"
                  placeholder="e.g. Tanti Bazar Gold Market"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#faf8f5] border border-[#dcd5cb] rounded-xs focus:outline-none focus:border-[#b88b42]"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-[11px] text-[#6b665f] mb-1">Trip Date *</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#faf8f5] border border-[#dcd5cb] rounded-xs focus:outline-none focus:border-[#b88b42]"
                />
              </div>

              {/* Transport */}
              <div>
                <label className="block text-[11px] text-[#6b665f] mb-1">Transport Cost (৳)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="Uber, CNG, Rickshaw..."
                  value={transportCost}
                  onChange={(e) => setTransportCost(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#faf8f5] border border-[#dcd5cb] rounded-xs focus:outline-none focus:border-[#b88b42]"
                />
              </div>

              {/* Food */}
              <div>
                <label className="block text-[11px] text-[#6b665f] mb-1">Food & Meals (৳)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="Daily meals..."
                  value={foodCost}
                  onChange={(e) => setFoodCost(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#faf8f5] border border-[#dcd5cb] rounded-xs focus:outline-none focus:border-[#b88b42]"
                />
              </div>

              {/* Other Expenses */}
              <div>
                <label className="block text-[11px] text-[#6b665f] mb-1">Other Incidental (৳)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="Packaging, tips..."
                  value={otherCost}
                  onChange={(e) => setOtherCost(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[#faf8f5] border border-[#dcd5cb] rounded-xs focus:outline-none focus:border-[#b88b42]"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Sourced Products Enlistment Rows */}
          <div className="space-y-3 pt-4 border-t border-[#f0ece5]">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-[#1c1a17] block">
                  2. Sourced Products in this Trip (Auto-Calculates Wholesale Cost):
                </span>
                <span className="text-[11px] text-gray-500">
                  Enter quantity and unit purchase price. Line totals and wholesale sum will calculate automatically.
                </span>
              </div>
              <button
                type="button"
                onClick={handleAddItemRow}
                className="px-2.5 py-1 bg-[#faf8f5] border border-[#dcd5cb] hover:border-[#b88b42] text-[#1c1a17] text-xs font-semibold rounded-xs transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Sourced Item
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {sourcedItems.map((item, idx) => {
                const lineTotal = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);

                return (
                  <div
                    key={idx}
                    className="p-3 bg-[#faf8f5] border border-[#eae5de] rounded-xs grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center text-xs"
                  >
                    {/* Item Name */}
                    <div className="sm:col-span-4">
                      <input
                        type="text"
                        placeholder="Product name (e.g. Sapphire Pendant)..."
                        value={item.name}
                        onChange={(e) => handleUpdateItemRow(idx, 'name', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-[#dcd5cb] rounded-xs focus:outline-none"
                      />
                    </div>

                    {/* Category */}
                    <div className="sm:col-span-2">
                      <select
                        value={item.category}
                        onChange={(e) => handleUpdateItemRow(idx, 'category', e.target.value)}
                        className="w-full px-2 py-1.5 bg-white border border-[#dcd5cb] rounded-xs focus:outline-none"
                      >
                        <option value="Necklaces">Necklaces</option>
                        <option value="Earrings">Earrings</option>
                        <option value="Rings">Rings</option>
                        <option value="Bracelets">Bracelets</option>
                        <option value="Pearls">Pearls</option>
                        <option value="Gifting">Gifting</option>
                      </select>
                    </div>

                    {/* Color / Variant */}
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        placeholder="Color (e.g. Blue)"
                        value={item.colorName}
                        onChange={(e) => handleUpdateItemRow(idx, 'colorName', e.target.value)}
                        className="w-full px-2 py-1.5 bg-white border border-[#dcd5cb] rounded-xs focus:outline-none"
                      />
                    </div>

                    {/* Quantity */}
                    <div className="sm:col-span-1">
                      <input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => handleUpdateItemRow(idx, 'quantity', e.target.value)}
                        className="w-full px-2 py-1.5 bg-white border border-[#dcd5cb] text-center font-semibold rounded-xs focus:outline-none"
                      />
                    </div>

                    {/* Purchase Price (Wholesale Unit Cost) */}
                    <div className="sm:col-span-1">
                      <input
                        type="number"
                        min="0"
                        placeholder="৳/unit"
                        value={item.unitPrice}
                        onChange={(e) => handleUpdateItemRow(idx, 'unitPrice', e.target.value)}
                        className="w-full px-2 py-1.5 bg-white border border-[#dcd5cb] text-right rounded-xs focus:outline-none font-semibold text-[#0f388a]"
                      />
                    </div>

                    {/* Line Total & Remove */}
                    <div className="sm:col-span-2 flex items-center justify-between gap-1 pl-2">
                      <span className="font-semibold text-gray-900 font-mono">
                        ৳{lineTotal.toLocaleString()}
                      </span>
                      {sourcedItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItemRow(idx)}
                          className="text-gray-400 hover:text-rose-600 p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Wholesale Summary Banner */}
            <div className="p-3 bg-[#f0f6fd] border border-[#cde0f8] rounded-xs flex items-center justify-between text-xs">
              <span className="text-[#0f388a] font-medium flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#0f388a]" />
                Auto-Calculated Wholesale Product Total for this Run:
              </span>
              <span className="font-bold text-sm text-[#0f388a]">
                ৳{autoWholesaleSum.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[11px] text-[#6b665f] mb-1">
              Procurement Trip Observations & Supplier Notes
            </label>
            <input
              type="text"
              placeholder="e.g. Sourced from New Alankar Jewellers, verified 925 sterling silver hallmarking..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-1.5 bg-[#faf8f5] border border-[#dcd5cb] rounded-xs focus:outline-none focus:border-[#b88b42]"
            />
          </div>

          {/* Submission Bar */}
          <div className="flex items-center justify-between pt-3 border-t border-[#f0ece5]">
            <div className="text-xs space-x-3">
              <span className="text-gray-500">Travel Overhead: <strong>৳{calculatedTravelSum.toLocaleString()}</strong></span>
              <span className="text-gray-500">+ Wholesale Stock: <strong>৳{autoWholesaleSum.toLocaleString()}</strong></span>
              <span className="text-[#b88b42] font-semibold">= Grand Total: <strong>৳{calculatedGrandTotal.toLocaleString()}</strong></span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-[#0f388a] text-white uppercase tracking-widest font-semibold text-xs hover:bg-[#0a2561] transition-colors rounded-xs shadow-xs flex items-center gap-1.5"
            >
              {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              Save Procurement Run & Calculate
            </button>
          </div>
        </form>
      </div>

      {/* Historical Sourcing Trips & One-Click Enlistment Table */}
      <div className="bg-white border border-[#eae5de] rounded-xs overflow-x-auto shadow-xs">
        <div className="p-4 border-b border-[#eae5de] bg-[#faf8f5] flex items-center justify-between">
          <h3 className="font-serif text-base font-medium text-[#1c1a17]">
            Historical Procurement Trips & Sourced Products
          </h3>
          <span className="text-xs text-gray-500">
            {logs.length} logged sourcing trips
          </span>
        </div>

        {isLoading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="w-8 h-8 text-[#b88b42] animate-spin" />
          </div>
        ) : (
          <div className="divide-y divide-[#eae5de]">
            {logs.length === 0 ? (
              <div className="text-center py-12 text-gray-500 text-xs">
                No procurement trips recorded yet. Use the form above to record your first sourcing trip!
              </div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="p-4 space-y-3 hover:bg-[#faf8f5]/40 transition-colors">
                  {/* Trip Summary Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-serif text-base font-semibold text-gray-900">
                          {log.title || 'Procurement Run'}
                        </span>
                        <span className="text-xs text-gray-500 font-mono">
                          • {new Date(log.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      {log.notes && <p className="text-xs text-gray-600 italic mt-0.5">{log.notes}</p>}
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono">
                      <div>
                        <span className="text-gray-400 block text-[10px]">TRAVEL & FOOD</span>
                        <span className="font-semibold text-gray-800">
                          ৳{((log.transportCost || 0) + (log.foodCost || 0) + (log.otherCost || 0)).toLocaleString()}
                        </span>
                      </div>

                      <div>
                        <span className="text-gray-400 block text-[10px]">AUTO WHOLESALE</span>
                        <span className="font-semibold text-[#0f388a]">
                          ৳{log.wholesaleProductCost?.toLocaleString()}
                        </span>
                      </div>

                      <div className="pl-2 border-l border-gray-300">
                        <span className="text-gray-400 block text-[10px]">TRIP OUTLAY</span>
                        <span className="font-bold text-[#b88b42] text-sm">
                          ৳{log.totalCost?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Sourced Items in this Trip with Enlistment Buttons */}
                  {log.items && log.items.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-[#f0ece5]">
                      <span className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold block mb-2">
                        Sourced Products in this Trip ({log.items.length} batches):
                      </span>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                        {log.items.map((item) => (
                          <div
                            key={item.id}
                            className="p-3 bg-white border border-[#eae5de] rounded-xs flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="space-y-0.5">
                              <span className="font-semibold text-gray-900 block truncate">
                                {item.name}
                              </span>
                              <div className="text-[11px] text-gray-500">
                                <span>{item.quantity} pcs @ ৳{item.unitPrice}</span>
                                {item.colorName && (
                                  <span className="text-[#0f388a] ml-1.5 font-medium">
                                    • {item.colorName}
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-gray-400 block">
                                Batch Total: ৳{item.totalCost?.toLocaleString()}
                              </span>
                            </div>

                            {/* Enlist / Catalog Status Button */}
                            {item.isEnlisted ? (
                              <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200 rounded-xs flex items-center gap-1 shrink-0">
                                ✓ Enlisted
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => openEnlistModal(item)}
                                className="px-2.5 py-1 bg-[#1c1a17] hover:bg-[#0f388a] text-white text-[10px] uppercase font-semibold rounded-xs transition-colors flex items-center gap-1 shrink-0 shadow-xs"
                              >
                                Enlist <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Enlistment Modal Dialog */}
      {enlistingItem && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-white border border-[#eae5de] rounded-2xl shadow-2xl my-8 overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-[#e2edf8] bg-[#f8fbfe]">
              <div>
                <span className="text-[10px] tracking-widest text-[#0f388a] uppercase font-semibold">
                  {enlistingItem.id ? 'Catalog Hand-Off & Enlistment' : 'Direct Product Enlistment'}
                </span>
                <h3 className="font-serif text-lg font-semibold text-[#0d2342]">
                  {enlistingItem.id
                    ? `Enlist "${enlistingItem.name}" to Active Catalog`
                    : 'Enlist New Jewelry Piece to Catalog'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEnlistingItem(null)}
                className="p-1 text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sourced Info Preview Bar (if linked to a procured batch) */}
            {enlistingItem.id && (
              <div className="px-6 py-3 bg-[#faf8f5] border-b border-[#eae5de] grid grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-gray-500 block text-[10px] uppercase font-semibold">Wholesale Unit Cost</span>
                  <span className="font-semibold text-[#0f388a]">৳{enlistingItem.unitPrice} / unit</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px] uppercase font-semibold">Procured Batch Stock</span>
                  <span className="font-semibold text-gray-900">{enlistingItem.quantity} units</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[10px] uppercase font-semibold">Procurement Color</span>
                  <span className="font-semibold text-gray-900">{enlistingItem.colorName || 'Default'}</span>
                </div>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleEnlistSubmit();
              }}
              className="p-6 space-y-5 text-xs max-h-[75vh] overflow-y-auto"
            >
              {enlistFormError && (
                <div className="flex items-center gap-2 p-3 bg-rose-50 text-rose-700 rounded-lg border border-rose-200">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{enlistFormError}</span>
                </div>
              )}

              {/* Mode: New Product vs Restock */}
              <div className="space-y-1.5">
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#0d2342]">
                  Enlistment Strategy
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setEnlistType('new')}
                    className={`p-3 border rounded-xl text-center font-medium transition-colors ${
                      enlistType === 'new'
                        ? 'border-[#0f388a] bg-[#f0f6fd] text-[#0f388a] font-semibold shadow-xs'
                        : 'border-[#eae5de] bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    ✨ Create New Catalog Product
                  </button>
                  <button
                    type="button"
                    onClick={() => setEnlistType('restock')}
                    className={`p-3 border rounded-xl text-center font-medium transition-colors ${
                      enlistType === 'restock'
                        ? 'border-[#0f388a] bg-[#f0f6fd] text-[#0f388a] font-semibold shadow-xs'
                        : 'border-[#eae5de] bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    📦 Restock Existing Product
                  </button>
                </div>
              </div>

              {enlistType === 'new' ? (
                <>
                  {/* Name & Category */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#0d2342] mb-1">
                        Product Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={enlistName}
                        onChange={(e) => setEnlistName(e.target.value)}
                        placeholder="e.g. Ocean Blue Sapphire Pendant"
                        className="w-full px-3 py-2 border border-[#d2e2f6] rounded-lg focus:outline-none focus:border-[#0f388a]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#0d2342] mb-1">
                        Jewelry Category *
                      </label>
                      <select
                        value={enlistCategory}
                        onChange={(e) => setEnlistCategory(e.target.value)}
                        className="w-full px-3 py-2 border border-[#d2e2f6] rounded-lg focus:outline-none focus:border-[#0f388a]"
                      >
                        <option value="Rings">Rings</option>
                        <option value="Necklaces">Necklaces</option>
                        <option value="Earrings">Earrings</option>
                        <option value="Bracelets">Bracelets</option>
                        <option value="Pearls">Pearls</option>
                        <option value="Gifting">Gifting</option>
                        <option value="Bespoke">Bespoke</option>
                      </select>
                    </div>
                  </div>

                  {/* Pricing & Stock */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#0d2342] mb-1">
                        Retail Selling Price (৳) *
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={enlistRetailPrice}
                        onChange={(e) => setEnlistRetailPrice(e.target.value)}
                        placeholder="1250"
                        className="w-full px-3 py-2 border border-[#d2e2f6] rounded-lg focus:outline-none focus:border-[#0f388a] font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#0d2342] mb-1">
                        Wholesale Cost (৳)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={enlistWholesaleCost}
                        onChange={(e) => setEnlistWholesaleCost(e.target.value)}
                        placeholder="500"
                        className="w-full px-3 py-2 bg-gray-50 border border-[#d2e2f6] rounded-lg focus:outline-none font-semibold text-[#0f388a]"
                      />
                      <span className="text-[10px] text-gray-500">Auto-filled from sourcing unit price</span>
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#0d2342] mb-1">
                        Total Stock Quantity
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={enlistQuantity}
                        onChange={(e) => setEnlistQuantity(e.target.value)}
                        placeholder="25"
                        className="w-full px-3 py-2 border border-[#d2e2f6] rounded-lg focus:outline-none focus:border-[#0f388a]"
                      />
                      <span className="text-[10px] text-gray-500">Auto-sums from color variants if added</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#0d2342] mb-1">
                      Tags (Comma-separated)
                    </label>
                    <input
                      type="text"
                      value={enlistTags}
                      onChange={(e) => setEnlistTags(e.target.value)}
                      placeholder="Ocean, Sapphire, Best Seller, New"
                      className="w-full px-3 py-2 border border-[#d2e2f6] rounded-lg focus:outline-none focus:border-[#0f388a]"
                    />
                  </div>

                  {/* SECTION 1: Common Images (Max 2) */}
                  <div className="space-y-3 p-4 bg-[#f8fbfe] border border-[#e2edf8] rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-xs uppercase tracking-wider font-semibold text-[#0d2342] flex items-center gap-1.5">
                          <ImageIcon className="w-4 h-4 text-[#0f388a]" />
                          Common Master Images ({enlistCommonImages.length}/2 Max)
                        </label>
                        <p className="text-[11px] text-[#6e85a0]">
                          Upload up to 2 common master images shared across all color variations.
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleAddCommonImageUrl}
                          disabled={enlistCommonImages.length >= 2}
                          className="px-2.5 py-1 text-[11px] bg-white border border-[#d2e2f6] hover:bg-gray-50 rounded-lg text-[#0f388a] font-medium"
                        >
                          + Image URL
                        </button>
                        <label
                          className={`px-3 py-1 text-[11px] bg-[#0f388a] text-white rounded-lg cursor-pointer hover:bg-[#0a2561] flex items-center gap-1 font-medium ${
                            enlistCommonImages.length >= 2 || isUploadingImage ? 'opacity-50 pointer-events-none' : ''
                          }`}
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>{isUploadingImage ? 'Uploading...' : 'Upload'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files?.[0]) handleUploadCommonImage(e.target.files[0]);
                            }}
                            disabled={enlistCommonImages.length >= 2 || isUploadingImage}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      {enlistCommonImages.map((img, idx) => (
                        <div key={idx} className="relative aspect-video border border-[#d2e2f6] rounded-lg overflow-hidden bg-white">
                          <img src={img} alt={`Common ${idx + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setEnlistCommonImages((prev) => prev.filter((_, i) => i !== idx))}
                            className="absolute top-1.5 right-1.5 p-1 bg-black/70 text-white rounded-full hover:bg-rose-600 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 bg-black/60 text-white text-[9px] rounded font-medium">
                            Common Image {idx + 1}
                          </span>
                        </div>
                      ))}
                      {enlistCommonImages.length === 0 && (
                        <div className="col-span-2 text-center py-4 text-gray-400 border border-dashed border-[#d2e2f6] rounded-lg text-xs">
                          No common images added yet (optional).
                        </div>
                      )}
                    </div>
                  </div>

                  {/* SECTION 2: Color Variations */}
                  <div className="space-y-4 p-4 bg-white border border-[#e2edf8] rounded-xl shadow-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-[#edf4fc]">
                      <div>
                        <h3 className="font-serif text-sm font-semibold text-[#0d2342] flex items-center gap-1.5">
                          <Palette className="w-4 h-4 text-[#0f388a]" />
                          Color Variations & Variant-Specific Images
                        </h3>
                        <p className="text-[11px] text-[#6e85a0]">
                          Enlist as many color variations as needed. Each variant has its own quantity and images.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={addEnlistVariant}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#f0f6fd] border border-[#d2e2f6] text-[#0f388a] hover:bg-[#e0edfb] font-semibold text-xs rounded-lg transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Color Variant
                      </button>
                    </div>

                    {enlistVariants.length === 0 ? (
                      <div className="text-center py-6 text-gray-400 border border-dashed border-[#d2e2f6] rounded-lg">
                        No color variations configured yet. If this jewelry piece comes in multiple colors (e.g. Ocean Blue, Emerald Green, Rose Gold), click "Add Color Variant".
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {enlistVariants.map((v, vIdx) => (
                          <div key={v.id || vIdx} className="p-4 bg-[#f8fbfe] border border-[#d2e2f6] rounded-xl space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-xs text-[#0f388a]">
                                Variant #{vIdx + 1}
                              </span>
                              <button
                                type="button"
                                onClick={() => removeEnlistVariant(vIdx)}
                                className="text-rose-600 hover:text-rose-800 flex items-center gap-1 text-[11px]"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Remove
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div>
                                <label className="block text-[10px] uppercase font-semibold text-[#0d2342] mb-1">
                                  Color Name *
                                </label>
                                <input
                                  type="text"
                                  required
                                  value={v.colorName}
                                  onChange={(e) => updateEnlistVariantField(vIdx, 'colorName', e.target.value)}
                                  placeholder="e.g. Sapphire Blue"
                                  className="w-full px-2.5 py-1.5 border border-[#d2e2f6] rounded-lg bg-white focus:outline-none focus:border-[#0f388a]"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] uppercase font-semibold text-[#0d2342] mb-1">
                                  Color Picker (Optional)
                                </label>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="color"
                                    value={v.colorCode || '#0f388a'}
                                    onChange={(e) => updateEnlistVariantField(vIdx, 'colorCode', e.target.value)}
                                    className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
                                  />
                                  <input
                                    type="text"
                                    value={v.colorCode || ''}
                                    onChange={(e) => updateEnlistVariantField(vIdx, 'colorCode', e.target.value)}
                                    placeholder="#0f388a"
                                    className="w-full px-2 py-1.5 border border-[#d2e2f6] rounded-lg bg-white text-xs font-mono"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="block text-[10px] uppercase font-semibold text-[#0d2342] mb-1">
                                  Variant Stock Quantity *
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  required
                                  value={v.quantity}
                                  onChange={(e) => updateEnlistVariantField(vIdx, 'quantity', e.target.value)}
                                  className="w-full px-2.5 py-1.5 border border-[#d2e2f6] rounded-lg bg-white focus:outline-none focus:border-[#0f388a]"
                                />
                              </div>
                            </div>

                            {/* Images for this specific variant */}
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <label className="text-[10px] uppercase font-semibold text-[#0d2342]">
                                  Variant Images ({v.images?.length || 0})
                                </label>
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleAddEnlistVariantImageUrl(vIdx)}
                                    className="px-2 py-0.5 text-[10px] bg-white border border-[#d2e2f6] rounded hover:bg-gray-50 text-[#0f388a]"
                                  >
                                    + URL
                                  </button>
                                  <label className="px-2 py-0.5 text-[10px] bg-[#0f388a] text-white rounded cursor-pointer hover:bg-[#0a2561] flex items-center gap-1">
                                    <Upload className="w-3 h-3" />
                                    <span>Upload</span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => handleEnlistVariantFileUpload(vIdx, e.target.files?.[0])}
                                      className="hidden"
                                    />
                                  </label>
                                </div>
                              </div>

                              <div className="flex gap-2 flex-wrap">
                                {(v.images || []).map((vImg, imgI) => (
                                  <div key={imgI} className="relative w-16 h-16 rounded border border-[#d2e2f6] overflow-hidden bg-white">
                                    <img src={vImg} alt="variant" className="w-full h-full object-cover" />
                                    <button
                                      type="button"
                                      onClick={() => removeEnlistVariantImage(vIdx, imgI)}
                                      className="absolute top-0.5 right-0.5 p-0.5 bg-black/70 text-white rounded-full hover:bg-rose-600"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#0d2342] mb-1">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      value={enlistDescription}
                      onChange={(e) => setEnlistDescription(e.target.value)}
                      placeholder="Artisanal description of this piece..."
                      className="w-full px-3 py-2 border border-[#d2e2f6] rounded-lg focus:outline-none focus:border-[#0f388a]"
                    />
                  </div>
                </>
              ) : (
                /* Restock existing */
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#0d2342] mb-1">
                      Select Existing Product to Restock (+{enlistingItem.quantity} units) *
                    </label>
                    <select
                      value={enlistSelectedProductId}
                      onChange={(e) => setEnlistSelectedProductId(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#d2e2f6] rounded-lg focus:outline-none"
                    >
                      {existingProducts.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.quantity} current stock)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#edf4fc]">
                <button
                  type="button"
                  onClick={() => setEnlistingItem(null)}
                  disabled={isSubmittingEnlist}
                  className="px-4 py-2 border border-[#d2e2f6] text-xs uppercase tracking-wider text-gray-600 hover:bg-gray-50 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEnlist}
                  className="px-6 py-2 bg-[#0f388a] text-white text-xs uppercase tracking-widest font-semibold hover:bg-[#0a2561] transition-colors rounded-lg shadow-md disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmittingEnlist ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Enlisting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-3.5 h-3.5" /> Confirm & Enlist to Catalog
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
