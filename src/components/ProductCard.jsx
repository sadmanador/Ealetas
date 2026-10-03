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
    <article className="group bg-white border border-[#eae5de] rounded-sm flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      {/* Product Image Container */}
      <div
        className="relative aspect-square overflow-hidden bg-[#f7f5f2] cursor-pointer"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <img
          src={images[currentImgIndex]}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />

        {/* Tags / Badge */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.tags &&
            product.tags.split(',').slice(0, 1).map((tag, idx) => (
              <span
                key={idx}
                className="bg-white/90 backdrop-blur-sm text-[#1c1a17] text-[10px] tracking-widest uppercase font-semibold px-2 py-0.5 rounded-sm shadow-sm"
              >
                {tag.trim()}
              </span>
            ))}
          {isOutOfStock && (
            <span className="bg-red-800 text-white text-[10px] tracking-wider uppercase font-semibold px-2 py-0.5 rounded-sm">
              Sold Out
            </span>
          )}
          {isLowStock && (
            <span className="bg-amber-700 text-white text-[10px] tracking-wider uppercase font-medium px-2 py-0.5 rounded-sm">
              Only {product.quantity} Left
            </span>
          )}
        </div>
      </div>

      {/* Dot Image Slider Under Image */}
      {images.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 py-2.5 bg-white border-b border-[#f3eee8]">
          {images.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentImgIndex(idx)}
              aria-label={`View image ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                currentImgIndex === idx
                  ? 'w-6 bg-[#b88b42]'
                  : 'w-1.5 bg-[#dcd5cb] hover:bg-[#b88b42]/60'
              }`}
            />
          ))}
        </div>
      )}

      {/* Product Information */}
      <div className="p-4 flex flex-col flex-grow">
        <span className="text-[11px] tracking-widest text-[#b88b42] uppercase font-medium mb-1">
          {product.category}
        </span>
        <h3 className="font-serif text-lg font-medium text-[#1c1a17] line-clamp-1 mb-1">
          {product.name}
        </h3>
        <p className="text-xs text-[#6b665f] line-clamp-2 leading-relaxed mb-3 flex-grow">
          {product.description}
        </p>

        {/* Pricing */}
        <div className="flex items-baseline justify-between pt-2 border-t border-[#f0ece5] mb-3">
          <span className="text-base font-semibold text-[#1c1a17]">
            ৳{Number(product.price).toLocaleString()}
          </span>
          <span className="text-[11px] text-[#8e8880]">
            {product.quantity > 0 ? `${product.quantity} in stock` : 'Out of stock'}
          </span>
        </div>

        {/* Action Buttons: Add to Bag & Buy Now */}
        <div className="grid grid-cols-2 gap-2 mt-auto">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 text-xs tracking-wider uppercase font-medium rounded-sm border transition-all duration-200 ${
              isOutOfStock
                ? 'opacity-40 cursor-not-allowed border-gray-300 text-gray-400'
                : addedAnimation
                ? 'bg-emerald-800 text-white border-emerald-800'
                : 'border-[#1c1a17] text-[#1c1a17] hover:bg-[#1c1a17] hover:text-white'
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
            className={`flex items-center justify-center gap-1.5 py-2 px-2 text-xs tracking-wider uppercase font-medium rounded-sm transition-all duration-200 ${
              isOutOfStock
                ? 'opacity-40 cursor-not-allowed bg-gray-300 text-gray-500'
                : 'bg-[#b88b42] text-white hover:bg-[#9e7135] shadow-sm'
            }`}
          >
            <Zap className="w-3.5 h-3.5 fill-current" /> Buy Now
          </button>
        </div>
      </div>
    </article>
  );
}
