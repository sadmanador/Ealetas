'use client';

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { ShoppingBag, Zap, Check } from 'lucide-react';

export default function ProductCard({ product }) {
  const { addToCart, buyNow } = useCart();
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [addedAnimation, setAddedAnimation] = useState(false);

  // Parse images (up to 3)
  let images = [];
  try {
    const parsed = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
    images = Array.isArray(parsed) && parsed.length > 0 ? parsed.slice(0, 3) : [];
  } catch (e) {
    images = [];
  }

  if (images.length === 0) {
    images = ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80'];
  }

  const isOutOfStock = product.quantity <= 0;
  const isLowStock = product.quantity > 0 && product.quantity <= 5;

  const handleMouseEnter = () => {
    if (images.length > 1) {
      setCurrentImgIndex((prev) => (prev + 1) % images.length);
    }
  };

  const handleMouseLeave = () => {
    setCurrentImgIndex(0);
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, 1);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1500);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    buyNow(product);
  };

  return (
    <article className="group bg-white border border-[#e2edf8] rounded-xl flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-[#0f388a]/5 hover:-translate-y-1">
      {/* Product Image Container */}
      <div
        className="relative aspect-square overflow-hidden bg-[#f4f8fd] cursor-pointer"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <img
          src={images[currentImgIndex]}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />

        {/* Wishlist Heart Button from Theme */}
        <button
          type="button"
          aria-label="Add to Wishlist"
          className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/90 backdrop-blur-xs text-[#0f388a] hover:text-rose-500 hover:bg-white shadow-xs flex items-center justify-center text-xs transition-colors z-10"
        >
          ♡
        </button>

        {/* Tags / Badge */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.tags &&
            product.tags.split(',').slice(0, 1).map((tag, idx) => (
              <span
                key={idx}
                className="bg-white/90 backdrop-blur-xs text-[#0f388a] text-[10px] tracking-wider uppercase font-semibold px-2 py-0.5 rounded-sm shadow-xs border border-[#d8e6f8]"
              >
                {tag.trim()}
              </span>
            ))}
          {isOutOfStock && (
            <span className="bg-rose-700 text-white text-[10px] tracking-wider uppercase font-semibold px-2 py-0.5 rounded-sm">
              Sold Out
            </span>
          )}
          {isLowStock && (
            <span className="bg-amber-600 text-white text-[10px] tracking-wider uppercase font-medium px-2 py-0.5 rounded-sm">
              Only {product.quantity} Left
            </span>
          )}
        </div>
      </div>

      {/* Dot Image Slider Under Image */}
      {images.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 py-2.5 bg-white border-b border-[#edf4fc]">
          {images.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentImgIndex(idx)}
              aria-label={`View image ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                currentImgIndex === idx
                  ? 'w-6 bg-[#0f388a]'
                  : 'w-1.5 bg-[#d0e0f5] hover:bg-[#0f388a]/60'
              }`}
            />
          ))}
        </div>
      )}

      {/* Product Information */}
      <div className="p-4 flex flex-col flex-grow">
        <span className="text-[10px] tracking-widest text-[#0f388a] uppercase font-semibold mb-1">
          {product.category}
        </span>
        <h3 className="font-serif text-lg font-medium text-[#0d2342] line-clamp-1 mb-1">
          {product.name}
        </h3>
        
        {/* Rating Stars from Theme */}
        <div className="flex items-center gap-1.5 text-xs mb-2">
          <span className="text-[#c59b3f] tracking-tighter">★★★★★</span>
          <span className="text-[10px] text-[#6e85a0]">(48)</span>
        </div>

        <p className="text-xs text-[#5e7692] line-clamp-2 leading-relaxed mb-3 flex-grow font-light">
          {product.description}
        </p>

        {/* Pricing */}
        <div className="flex items-baseline justify-between pt-2 border-t border-[#edf4fc] mb-3">
          <span className="text-base font-semibold text-[#0d2342]">
            ৳{Number(product.price).toLocaleString()}
          </span>
          <span className="text-[11px] text-[#7a93b0]">
            {product.quantity > 0 ? `${product.quantity} in stock` : 'Out of stock'}
          </span>
        </div>

        {/* Action Buttons: Add to Bag & Buy Now */}
        <div className="grid grid-cols-2 gap-2 mt-auto">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 text-xs tracking-wider uppercase font-medium rounded-md border transition-all duration-200 ${
              isOutOfStock
                ? 'opacity-40 cursor-not-allowed border-gray-200 text-gray-400'
                : addedAnimation
                ? 'bg-emerald-700 text-white border-emerald-700'
                : 'border-[#0f388a] text-[#0f388a] hover:bg-[#0f388a] hover:text-white'
            }`}
          >
            {addedAnimation ? (
              <>
                <Check className="w-3.5 h-3.5" /> Added
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" /> Add to Bag
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleBuyNow}
            disabled={isOutOfStock}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 text-xs tracking-wider uppercase font-medium rounded-md transition-all duration-200 ${
              isOutOfStock
                ? 'opacity-40 cursor-not-allowed bg-gray-200 text-gray-400'
                : 'bg-[#0f388a] text-white hover:bg-[#0a2561] shadow-sm'
            }`}
          >
            <Zap className="w-3.5 h-3.5 fill-current" /> Buy Now
          </button>
        </div>
      </div>
    </article>
  );
}
