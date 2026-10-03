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
  const [images, setImages] = useState([]); // up to 3 strings (URLs or base64 data URIs)
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
    setImages([]);
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

    let parsedImgs = [];
    try {
      parsedImgs = typeof p.images === 'string' ? JSON.parse(p.images) : p.images;
    } catch (e) {
      parsedImgs = [];
    }
    setImages(Array.isArray(parsedImgs) ? parsedImgs : []);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (images.length >= 3) {
      setFormError('Maximum 3 images allowed per product.');
      return;
    }

    setIsUploading(true);
    setFormError('');
    try {
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

      setImages((prev) => [...prev, data.url].slice(0, 3));
    } catch (err) {
      setFormError(err.message || 'Image upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddImageUrl = () => {
    const url = prompt('Enter public Image URL:');
    if (url && url.trim()) {
      if (images.length >= 3) {
        alert('Maximum 3 images allowed.');
        return;
      }
      setImages((prev) => [...prev, url.trim()].slice(0, 3));
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
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
        images: images.slice(0, 3),
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
          <span className="text-[10px] tracking-widest text-[#b88b42] uppercase font-semibold">
            Catalog & Logistics
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-medium text-[#1c1a17]">
            Jewelry Products & Stock
          </h1>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1c1a17] text-white text-xs uppercase tracking-widest font-medium hover:bg-[#b88b42] transition-colors rounded-xs shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Enlist New Product
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 border border-[#eae5de] rounded-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search products by name or tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[#faf8f5] border border-[#dcd5cb] text-xs rounded-xs focus:outline-none focus:border-[#b88b42]"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full sm:w-48 px-3 py-1.5 bg-[#faf8f5] border border-[#dcd5cb] text-xs rounded-xs focus:outline-none focus:border-[#b88b42]"
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
          <Loader2 className="w-8 h-8 text-[#b88b42] animate-spin" />
        </div>
      ) : (
        <div className="bg-white border border-[#eae5de] rounded-xs overflow-x-auto shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#faf8f5] border-b border-[#eae5de] text-[11px] uppercase tracking-wider text-[#6b665f]">
              <tr>
                <th className="p-3.5">Images (Max 3)</th>
                <th className="p-3.5">Product Name</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Retail Price</th>
                <th className="p-3.5">Wholesale Cost</th>
                <th className="p-3.5">Stock (Qty)</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0ece5]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-500">
                    No products found. Click "Enlist New Product" to add one.
                  </td>
                </tr>
              ) : (
                filtered.map((prod) => {
                  let imgs = [];
                  try {
                    imgs = typeof prod.images === 'string' ? JSON.parse(prod.images) : prod.images;
                  } catch (e) {
                    imgs = [];
                  }
                  const firstImg = Array.isArray(imgs) && imgs.length > 0 ? imgs[0] : '';

                  return (
                    <tr key={prod.id} className="hover:bg-[#faf8f5]/50 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5">
                          {firstImg ? (
                            <img
                              src={firstImg}
                              alt={prod.name}
                              className="w-10 h-10 object-cover rounded-xs border border-[#eae5de]"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-100 flex items-center justify-center text-gray-400 rounded-xs">
                              <ImageIcon className="w-4 h-4" />
                            </div>
                          )}
                          <span className="text-[10px] text-gray-400 font-semibold">
                            ({Array.isArray(imgs) ? imgs.length : 0}/3)
                          </span>
                        </div>
                      </td>
                      <td className="p-3.5 font-medium text-gray-900">
                        {prod.name}
                        {prod.tags && (
                          <div className="text-[10px] text-gray-400 line-clamp-1">{prod.tags}</div>
                        )}
                      </td>
                      <td className="p-3.5 text-gray-600">{prod.category}</td>
                      <td className="p-3.5 font-semibold text-gray-900">৳{prod.price?.toLocaleString()}</td>
                      <td className="p-3.5 text-gray-600">৳{prod.wholesaleCost?.toLocaleString() || 0}</td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-xs font-semibold ${
                            prod.quantity === 0
                              ? 'bg-red-100 text-red-800'
                              : prod.quantity <= 5
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {prod.quantity} left
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(prod)}
                          className="p-1.5 text-gray-500 hover:text-[#b88b42] transition-colors"
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(prod.id, prod.name)}
                          className="p-1.5 text-gray-500 hover:text-red-600 transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Enlist / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white border border-[#eae5de] rounded-xs shadow-2xl my-8">
            <div className="flex items-center justify-between p-5 border-b border-[#eae5de] bg-[#faf8f5]">
              <h2 className="font-serif text-lg font-medium text-[#1c1a17]">
                {editingProduct ? 'Edit Jewelry Piece' : 'Enlist New Jewelry Piece'}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              {formError && (
                <div className="flex items-center gap-2 p-2.5 bg-red-50 text-red-700 rounded-xs">
                  <AlertCircle className="w-4 h-4" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#1c1a17] mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Royal Solitaire Diamond Ring"
                    className="w-full px-3 py-2 border border-[#dcd5cb] rounded-xs focus:outline-none focus:border-[#b88b42]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#1c1a17] mb-1">
                    Jewelry Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-[#dcd5cb] rounded-xs focus:outline-none focus:border-[#b88b42]"
                  >
                    <option value="Rings">Rings</option>
                    <option value="Necklaces">Necklaces</option>
                    <option value="Earrings">Earrings</option>
                    <option value="Bracelets">Bracelets</option>
                    <option value="Bespoke">Bespoke</option>
                  </select>
                </div>
              </div>

              {/* Pricing & Stock for Logistics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#1c1a17] mb-1">
                    Retail Price (৳) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="18500"
                    className="w-full px-3 py-2 border border-[#dcd5cb] rounded-xs focus:outline-none focus:border-[#b88b42]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#1c1a17] mb-1">
                    Wholesale Cost (৳)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={wholesaleCost}
                    onChange={(e) => setWholesaleCost(e.target.value)}
                    placeholder="12000"
                    className="w-full px-3 py-2 border border-[#dcd5cb] rounded-xs focus:outline-none focus:border-[#b88b42]"
                  />
                  <span className="text-[10px] text-gray-500">Unit procurement cost</span>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#1c1a17] mb-1">
                    Initial Stock (Qty) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="10"
                    className="w-full px-3 py-2 border border-[#dcd5cb] rounded-xs focus:outline-none focus:border-[#b88b42]"
                  />
                  <span className="text-[10px] text-gray-500">Decrements on delivered</span>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#1c1a17] mb-1">
                  Tags (Comma-separated)
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Diamond, 18k Gold, Solitaire, Bestseller"
                  className="w-full px-3 py-2 border border-[#dcd5cb] rounded-xs focus:outline-none focus:border-[#b88b42]"
                />
              </div>

              {/* Images (Max 3 stored under Neon DB credentials) */}
              <div className="space-y-2 p-3 bg-[#faf8f5] border border-[#eae5de] rounded-xs">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] uppercase tracking-wider font-semibold text-[#1c1a17] flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-[#b88b42]" />
                    Product Images ({images.length}/3 Max)
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      disabled={images.length >= 3}
                      className="px-2 py-1 text-[10px] bg-white border border-[#dcd5cb] hover:bg-gray-50 rounded-xs"
                    >
                      + Add Image URL
                    </button>
                    <label className={`px-2 py-1 text-[10px] bg-[#1c1a17] text-white rounded-xs cursor-pointer hover:bg-[#b88b42] flex items-center gap-1 ${images.length >= 3 ? 'opacity-50 pointer-events-none' : ''}`}>
                      <Upload className="w-3 h-3" />
                      {isUploading ? 'Encoding...' : 'Upload File'}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        disabled={images.length >= 3 || isUploading}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Previews */}
                <div className="grid grid-cols-3 gap-3 pt-2">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative aspect-square border border-[#dcd5cb] rounded-xs overflow-hidden group">
                      <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1 right-1 p-1 bg-black/70 text-white rounded-full opacity-90 hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/60 text-white text-[9px] rounded-xs">
                        Angle {idx + 1}
                      </span>
                    </div>
                  ))}
                  {images.length === 0 && (
                    <div className="col-span-3 text-center py-6 text-gray-400 border border-dashed border-[#dcd5cb] rounded-xs">
                      No images added yet. Upload files or paste image URLs (Max 3).
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#1c1a17] mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detail the gemstone cut, metal purity, certification, and atelier finish..."
                  className="w-full px-3 py-2 border border-[#dcd5cb] rounded-xs focus:outline-none focus:border-[#b88b42]"
                />
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#eae5de]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-[#dcd5cb] text-gray-600 hover:bg-gray-50 rounded-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 bg-[#1c1a17] text-white hover:bg-[#b88b42] transition-colors rounded-xs shadow-xs flex items-center gap-1.5"
                >
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  {editingProduct ? 'Save Changes' : 'Publish Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
