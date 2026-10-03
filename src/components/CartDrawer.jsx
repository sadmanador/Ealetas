'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';
import { X, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

export default function CartDrawer() {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    subtotal,
    setIsCheckoutOpen,
  } = useCart();

  if (!isCartOpen) return null;

  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="fixed inset-0 z-[140] flex justify-end bg-black/50 backdrop-blur-xs transition-opacity duration-300">
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-[#eae5de] animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#eae5de] bg-[#faf8f5]">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#b88b42]" />
            <h2 className="font-serif text-lg font-medium text-[#1c1a17]">
              Shopping Bag ({items.length})
            </h2>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-1.5 text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Item List */}
        <div className="flex-grow overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <ShoppingBag className="w-12 h-12 mx-auto text-[#dcd5cb]" />
              <p className="text-sm text-[#6b665f]">Your shopping bag is empty.</p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="inline-block mt-2 px-4 py-2 border border-[#1c1a17] text-xs uppercase tracking-wider text-[#1c1a17] hover:bg-[#1c1a17] hover:text-white transition-colors"
              >
                Explore Collection
              </button>
            </div>
          ) : (
            items.map((item) => {
              let imgUrl = '';
              try {
                const parsed = typeof item.images === 'string' ? JSON.parse(item.images) : item.images;
                imgUrl = Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : '';
              } catch (e) {
                imgUrl = '';
              }
              if (!imgUrl) {
                imgUrl = 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=400&q=80';
              }

              return (
                <div
                  key={item.id}
                  className="flex gap-3.5 pb-4 border-b border-[#f0ece5] last:border-b-0"
                >
                  <img
                    src={imgUrl}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-xs border border-[#eae5de] bg-[#f7f5f2]"
                  />
                  <div className="flex-grow">
                    <h4 className="text-xs font-medium text-[#1c1a17] line-clamp-1">{item.name}</h4>
                    <span className="text-[11px] text-[#b88b42] font-semibold block mb-2">
                      ৳{Number(item.price).toLocaleString()}
                    </span>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center border border-[#dcd5cb] rounded-xs">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2 py-0.5 text-xs text-gray-600 hover:bg-gray-100"
                        >
                          -
                        </button>
                        <span className="px-2.5 py-0.5 text-xs font-medium text-gray-800">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2 py-0.5 text-xs text-gray-600 hover:bg-gray-100"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors p-1"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-5 border-t border-[#eae5de] bg-[#faf8f5] space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-[#6b665f]">Subtotal</span>
              <span className="font-semibold text-base text-[#1c1a17]">
                ৳{subtotal.toLocaleString()}
              </span>
            </div>
            <p className="text-[11px] text-[#8e8880]">
              Delivery fee calculated at next step (৳80 inside Dhaka City Corp, ৳120 outside).
            </p>
            <button
              onClick={handleCheckoutClick}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#1c1a17] text-white text-xs uppercase tracking-widest font-medium hover:bg-[#b88b42] transition-colors rounded-sm shadow-md"
            >
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
