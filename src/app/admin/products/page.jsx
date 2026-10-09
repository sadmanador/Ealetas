'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Image as ImageIcon,
  Loader2,
  Search,
  Upload,
  X,
  AlertCircle,
  CheckCircle,
  Palette,
  Layers,
} from 'lucide-react';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Form Fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Rings');
  const [price, setPrice] = useState('');
  const [wholesaleCost, setWholesaleCost] = useState('');
  const [quantity, setQuantity] = useState('');
  const [tags, setTags] = useState('');
  const [description, setDescription] = useState('');

  // Common Images (up to 2 common images across all variants)
  const [commonImages, setCommonImages] = useState([]);

  // Color Variants: array of { id, colorName, colorCode, quantity, images: [] }
  const [variants, setVariants] = useState([]);

  const [isUploading, setIsUploading] = useState(false);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data.products || []);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openCreateModal = () => {
    setEditingProduct(null);
    setName('');
    setCategory('Rings');
    setPrice('');
    setWholesaleCost('');
    setQuantity('');
    setTags('');
    setDescription('');
    setCommonImages([]);
    setVariants([]);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (p) => {
    setEditingProduct(p);
    setName(p.name);
    setCategory(p.category);
    setPrice(p.price);
    setWholesaleCost(p.wholesaleCost || '');
    setQuantity(p.quantity);
    setTags(p.tags || '');
    setDescription(p.description || '');

    // Parse common images
    let parsedCommon = [];
    try {
      parsedCommon = typeof p.commonImages === 'string' ? JSON.parse(p.commonImages) : p.commonImages;
    } catch (e) {
      parsedCommon = [];
    }
    if (!Array.isArray(parsedCommon) || parsedCommon.length === 0) {
      // Fallback from legacy images
      try {
        const legacy = typeof p.images === 'string' ? JSON.parse(p.images) : p.images;
        if (Array.isArray(legacy)) parsedCommon = legacy.slice(0, 2);
      } catch (e) {}
    }
    setCommonImages(Array.isArray(parsedCommon) ? parsedCommon : []);

    // Set variants
    if (p.variants && Array.isArray(p.variants) && p.variants.length > 0) {
      setVariants(
        p.variants.map((v) => ({
          id: v.id,
          colorName: v.colorName,
          colorCode: v.colorCode || '',
          quantity: v.quantity,
          images: typeof v.images === 'string' ? JSON.parse(v.images || '[]') : v.images || [],
        }))
      );
    } else {
      setVariants([]);
    }

    setFormError('');
    setIsModalOpen(true);
  };

  // Upload helper
  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to upload image');
    }
    return data.url;
  };

  // Add Common Image
  const handleCommonFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (commonImages.length >= 2) {
      setFormError('Maximum 2 common images allowed.');
      return;
    }
    setIsUploading(true);
    setFormError('');
    try {
      const url = await uploadFile(file);
      setCommonImages((prev) => [...prev, url].slice(0, 2));
    } catch (err) {
      setFormError(err.message || 'Image upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddCommonImageUrl = () => {
    const url = prompt('Enter public URL for common image:');
    if (url && url.trim()) {
      if (commonImages.length >= 2) {
        alert('Maximum 2 common images allowed.');
        return;
      }
      setCommonImages((prev) => [...prev, url.trim()].slice(0, 2));
    }
  };

  // Color Variants Management
  const addVariant = () => {
    setVariants((prev) => [
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

  const removeVariant = (index) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const updateVariantField = (index, field, value) => {
    setVariants((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleVariantFileUpload = async (index, file) => {
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await uploadFile(file);
      setVariants((prev) => {
        const copy = [...prev];
        const vImages = copy[index].images || [];
        copy[index] = { ...copy[index], images: [...vImages, url] };
        return copy;
      });
    } catch (err) {
      alert(err.message || 'Variant image upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddVariantImageUrl = (index) => {
    const url = prompt('Enter image URL for this color variant:');
    if (url && url.trim()) {
      setVariants((prev) => {
        const copy = [...prev];
        const vImages = copy[index].images || [];
        copy[index] = { ...copy[index], images: [...vImages, url.trim()] };
        return copy;
      });
    }
  };

  const removeVariantImage = (variantIndex, imageIndex) => {
    setVariants((prev) => {
      const copy = [...prev];
      copy[variantIndex].images = copy[variantIndex].images.filter((_, i) => i !== imageIndex);
      return copy;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!name || price === '') {
      setFormError('Product Name and Price are mandatory.');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        name,
        category,
        price: Number(price),
        wholesaleCost: Number(wholesaleCost) || 0,
        quantity: Number(quantity) || 0,
        tags,
        description,
        commonImages,
        variants,
      };

      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save product');
      }

      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      setFormError(err.message || 'Failed to save product');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id, prodName) => {
    if (!confirm(`Are you sure you want to delete "${prodName}"?`)) return;

    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchProducts();
      } else {
        alert('Failed to delete product.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.tags && p.tags.toLowerCase().includes(search.toLowerCase()));
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#eae5de]">
        <div>
          <span className="text-[10px] tracking-widest text-[#0f388a] uppercase font-semibold">
            Catalog & Variations
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-medium text-[#0d2342]">
            Jewelry Products & Stock
          </h1>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0f388a] text-white text-xs uppercase tracking-widest font-semibold hover:bg-[#0a2561] transition-colors rounded-lg shadow-md"
        >
          <Plus className="w-4 h-4" /> Enlist New Piece
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-3 border border-[#e2edf8] rounded-xl">
        <div className="relative flex-grow">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search jewelry pieces by name or tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-[#d2e2f6] rounded-lg focus:outline-none focus:border-[#0f388a]"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-1.5 text-xs border border-[#d2e2f6] rounded-lg bg-white focus:outline-none focus:border-[#0f388a]"
        >
          <option value="All">All Categories</option>
          <option value="Rings">Rings</option>
          <option value="Necklaces">Necklaces</option>
          <option value="Earrings">Earrings</option>
          <option value="Bracelets">Bracelets</option>
          <option value="Bespoke">Bespoke</option>
        </select>
      </div>

      {/* Products Table */}
      {isLoading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="w-8 h-8 text-[#0f388a] animate-spin" />
        </div>
      ) : (
        <div className="bg-white border border-[#e2edf8] rounded-xl overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#f8fbfe] border-b border-[#e2edf8] text-[10px] uppercase tracking-wider text-[#6e85a0] font-semibold">
                <th className="p-4">Piece Preview</th>
                <th className="p-4">Name & Category</th>
                <th className="p-4">Color Variants</th>
                <th className="p-4">Retail Price</th>
                <th className="p-4">Procure Cost</th>
                <th className="p-4">On-Hand Stock</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf4fc]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-400">
                    No jewelry products found matching your filter.
                  </td>
                </tr>
              ) : (
                filtered.map((prod) => {
                  let img = '';
                  try {
                    const parsed = typeof prod.images === 'string' ? JSON.parse(prod.images) : prod.images;
                    if (Array.isArray(parsed) && parsed.length > 0) img = parsed[0];
                  } catch (e) {}

                  const variantCount = prod.variants ? prod.variants.length : 0;

                  return (
                    <tr key={prod.id} className="hover:bg-[#f8fbfe] transition-colors">
                      <td className="p-4">
                        <div className="w-12 h-12 rounded-lg bg-[#f0f6fd] border border-[#e2edf8] overflow-hidden">
                          {img ? (
                            <img src={img} alt={prod.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <ImageIcon className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-[#0d2342] text-sm">{prod.name}</div>
                        <div className="text-[10px] text-[#0f388a] uppercase font-semibold">{prod.category}</div>
                      </td>
                      <td className="p-4">
                        {variantCount > 0 ? (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {prod.variants.map((v) => (
                              <span
                                key={v.id}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#f0f6fd] border border-[#d2e2f6] text-[10px] font-medium text-[#0f388a]"
                              >
                                {v.colorCode && (
                                  <span
                                    className="w-2 h-2 rounded-full border border-black/20"
                                    style={{ backgroundColor: v.colorCode }}
                                  />
                                )}
                                {v.colorName} ({v.quantity})
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-[11px] text-gray-400">Single Variant</span>
                        )}
                      </td>
                      <td className="p-4 font-semibold text-[#0d2342]">
                        ৳{Number(prod.price).toLocaleString()}
                      </td>
                      <td className="p-4 text-[#6e85a0]">
                        ৳{Number(prod.wholesaleCost || 0).toLocaleString()}
                      </td>
                      <td className="p-4">
                        <span
                          className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                            prod.quantity > 5
                              ? 'bg-emerald-50 text-emerald-800'
                              : prod.quantity > 0
                              ? 'bg-amber-50 text-amber-800'
                              : 'bg-rose-50 text-rose-800'
                          }`}
                        >
                          {prod.quantity} units
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(prod)}
                            className="p-1.5 text-[#0f388a] hover:bg-[#e0edfb] rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(prod.id, prod.name)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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

      {/* Enlist / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-white border border-[#e2edf8] rounded-2xl shadow-2xl my-8 overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-[#e2edf8] bg-[#f8fbfe]">
              <h2 className="font-serif text-lg font-semibold text-[#0d2342]">
                {editingProduct ? 'Edit Jewelry Piece & Variations' : 'Enlist New Jewelry Piece with Color Variations'}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs max-h-[80vh] overflow-y-auto">
              {formError && (
                <div className="flex items-center gap-2 p-3 bg-rose-50 text-rose-700 rounded-lg border border-rose-200">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#0d2342] mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ocean Blue Teardrop Pendant"
                    className="w-full px-3 py-2 border border-[#d2e2f6] rounded-lg focus:outline-none focus:border-[#0f388a]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#0d2342] mb-1">
                    Jewelry Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
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

              {/* Pricing & Base Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#0d2342] mb-1">
                    Selling Price (৳) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="1250"
                    className="w-full px-3 py-2 border border-[#d2e2f6] rounded-lg focus:outline-none focus:border-[#0f388a]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#0d2342] mb-1">
                    Wholesale Cost (৳)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={wholesaleCost}
                    onChange={(e) => setWholesaleCost(e.target.value)}
                    placeholder="650"
                    className="w-full px-3 py-2 border border-[#d2e2f6] rounded-lg focus:outline-none focus:border-[#0f388a]"
                  />
                  <span className="text-[10px] text-gray-500">Unit procurement cost</span>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#0d2342] mb-1">
                    Base / Total Stock (Qty)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
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
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Ocean, Sapphire, Best Seller, New"
                  className="w-full px-3 py-2 border border-[#d2e2f6] rounded-lg focus:outline-none focus:border-[#0f388a]"
                />
              </div>

              {/* SECTION 1: 2 Common Images */}
              <div className="space-y-3 p-4 bg-[#f8fbfe] border border-[#e2edf8] rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs uppercase tracking-wider font-semibold text-[#0d2342] flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-[#0f388a]" />
                      Common Product Images ({commonImages.length}/2 Max)
                    </label>
                    <p className="text-[11px] text-[#6e85a0]">
                      Upload up to 2 common master images shared across all color options.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleAddCommonImageUrl}
                      disabled={commonImages.length >= 2}
                      className="px-2.5 py-1 text-[11px] bg-white border border-[#d2e2f6] hover:bg-gray-50 rounded-lg text-[#0f388a] font-medium"
                    >
                      + Image URL
                    </button>
                    <label
                      className={`px-3 py-1 text-[11px] bg-[#0f388a] text-white rounded-lg cursor-pointer hover:bg-[#0a2561] flex items-center gap-1 font-medium ${
                        commonImages.length >= 2 ? 'opacity-50 pointer-events-none' : ''
                      }`}
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUploading ? 'Uploading...' : 'Upload Image'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCommonFileUpload}
                        disabled={commonImages.length >= 2 || isUploading}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  {commonImages.map((img, idx) => (
                    <div key={idx} className="relative aspect-video border border-[#d2e2f6] rounded-lg overflow-hidden bg-white">
                      <img src={img} alt={`Common ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setCommonImages((prev) => prev.filter((_, i) => i !== idx))}
                        className="absolute top-1.5 right-1.5 p-1 bg-black/70 text-white rounded-full hover:bg-rose-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 bg-black/60 text-white text-[9px] rounded font-medium">
                        Common Image {idx + 1}
                      </span>
                    </div>
                  ))}
                  {commonImages.length === 0 && (
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
                    onClick={addVariant}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#f0f6fd] border border-[#d2e2f6] text-[#0f388a] hover:bg-[#e0edfb] font-semibold text-xs rounded-lg transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Color Variant
                  </button>
                </div>

                {variants.length === 0 ? (
                  <div className="text-center py-6 text-gray-400 border border-dashed border-[#d2e2f6] rounded-lg">
                    No color variations configured yet. If this jewelry piece comes in multiple colors (e.g. Ocean Blue, Emerald Green, Rose Gold), click "Add Color Variant".
                  </div>
                ) : (
                  <div className="space-y-4">
                    {variants.map((v, vIdx) => (
                      <div key={v.id || vIdx} className="p-4 bg-[#f8fbfe] border border-[#d2e2f6] rounded-xl space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs text-[#0f388a]">
                            Variant #{vIdx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeVariant(vIdx)}
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
                              onChange={(e) => updateVariantField(vIdx, 'colorName', e.target.value)}
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
                                onChange={(e) => updateVariantField(vIdx, 'colorCode', e.target.value)}
                                className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
                              />
                              <input
                                type="text"
                                value={v.colorCode || ''}
                                onChange={(e) => updateVariantField(vIdx, 'colorCode', e.target.value)}
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
                              onChange={(e) => updateVariantField(vIdx, 'quantity', e.target.value)}
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
                                onClick={() => handleAddVariantImageUrl(vIdx)}
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
                                  onChange={(e) => handleVariantFileUpload(vIdx, e.target.files?.[0])}
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
                                  onClick={() => removeVariantImage(vIdx, imgI)}
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
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Artisanal description of this piece..."
                  className="w-full px-3 py-2 border border-[#d2e2f6] rounded-lg focus:outline-none focus:border-[#0f388a]"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#edf4fc]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-[#d2e2f6] text-xs uppercase tracking-wider text-gray-600 hover:bg-gray-50 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 bg-[#0f388a] text-white text-xs uppercase tracking-widest font-semibold hover:bg-[#0a2561] transition-colors rounded-lg shadow-md disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  {editingProduct ? 'Save Changes' : 'Publish Piece'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
