'use client';

import React, { useEffect, useRef } from 'react';
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

  const timerRef = useRef(null);

  // Clear any existing timer
  const clearAutoCloseTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  // Start auto-dismiss timer (e.g., 3.5 seconds)
  const startAutoCloseTimer = () => {
    clearAutoCloseTimer();
    timerRef.current = setTimeout(() => {
      setIsCartOpen(false);
    }, 3500);
  };

  // Whenever drawer opens, start the auto-dismiss countdown
  useEffect(() => {
    if (isCartOpen) {
      startAutoCloseTimer();
    } else {
      clearAutoCloseTimer();
    }

    return () => clearAutoCloseTimer();
  }, [isCartOpen]);

  // If clicked OUTSIDE the shopping bag (on backdrop), slide off IMMEDIATELY
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      clearAutoCloseTimer();
      setIsCartOpen(false);
    }
  };

  // Pause auto-close when user moves mouse inside the drawer
  const handleDrawerMouseEnter = () => {
    clearAutoCloseTimer();
  };

  // Resume auto-close when mouse leaves the drawer
  const handleDrawerMouseLeave = () => {
    if (isCartOpen) {
      startAutoCloseTimer();
    }
  };

  const handleCheckoutClick = () => {
    clearAutoCloseTimer();
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleCloseButtonClick = () => {
    clearAutoCloseTimer();
    setIsCartOpen(false);
  };

  return (
    <div
      onClick={handleBackdropClick}
      className={`fixed inset-0 z-[140] flex justify-end bg-black/50 backdrop-blur-xs transition-opacity duration-300 ease-out ${
        isCartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Sliding Drawer Container */}
      <div
        onClick={(e) => e.stopPropagation()}
        onMouseEnter={handleDrawerMouseEnter}
        onMouseLeave={handleDrawerMouseLeave}
        className={`relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-[#eae5de] transform transition-transform duration-300 ease-in-out ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Subtle Auto-Close Progress Bar */}
        {isCartOpen && (
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#e4edf8] overflow-hidden z-20">
            <div className="h-full bg-[#0f388a] animate-[autoDismiss_3.5s_linear_forwards]" />
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#e4edf8] bg-[#f8fbfe]">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#0f388a]" />
            <h2 className="font-serif text-lg font-medium text-[#0d2342]">
              Shopping Bag ({items.length})
            </h2>
          </div>
          <button
            onClick={handleCloseButtonClick}
            className="p-1.5 text-gray-400 hover:text-[#0d2342] transition-colors"
            aria-label="Close bag"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Item List */}
        <div className="flex-grow overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <ShoppingBag className="w-12 h-12 mx-auto text-[#c9dbf2]" />
              <p className="text-sm text-[#5e7692]">Your shopping bag is empty.</p>
              <button
                onClick={handleCloseButtonClick}
                className="inline-block mt-2 px-4 py-2 border border-[#0f388a] text-xs uppercase tracking-wider text-[#0f388a] hover:bg-[#0f388a] hover:text-white rounded-md transition-colors"
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
                  key={item.cartKey || item.id}
                  className="flex gap-3.5 pb-4 border-b border-[#edf4fc] last:border-b-0"
                >
                  <img
                    src={item.variantImage || imgUrl}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg border border-[#e4edf8] bg-[#f4f8fd]"
                  />
                  <div className="flex-grow">
                    <h4 className="text-xs font-medium text-[#0d2342] line-clamp-1">{item.name}</h4>
                    {item.colorVariantName && (
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {item.colorCode && (
                          <span
                            className="w-2 h-2 rounded-full border border-black/10 inline-block"
                            style={{ backgroundColor: item.colorCode }}
                          />
                        )}
                        <span className="text-[10px] text-[#5e7692] font-medium">
                          Color: {item.colorVariantName}
                        </span>
                      </div>
                    )}
                    <span className="text-[11px] text-[#0f388a] font-semibold block mb-2 mt-1">
                      ৳{Number(item.price).toLocaleString()}
                    </span>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center border border-[#d2e2f6] rounded-md overflow-hidden">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.cartKey || item.id, item.quantity - 1)}
                          className="px-2 py-0.5 text-xs text-gray-600 hover:bg-[#e8f2fc]"
                        >
                          -
                        </button>
                        <span className="px-2.5 py-0.5 text-xs font-medium text-[#0d2342]">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.cartKey || item.id, item.quantity + 1)}
                          className="px-2 py-0.5 text-xs text-gray-600 hover:bg-[#e8f2fc]"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.cartKey || item.id)}
                        className="text-gray-400 hover:text-rose-600 transition-colors p-1"
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
          <div className="p-5 border-t border-[#e4edf8] bg-[#f8fbfe] space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-[#5e7692]">Subtotal</span>
              <span className="font-semibold text-base text-[#0d2342]">
                ৳{subtotal.toLocaleString()}
              </span>
            </div>
            <p className="text-[11px] text-[#7a93b0]">
              Delivery fee automatically calculated at checkout (৳80 in Dhaka City Corp / ৳120 outside).
            </p>
            <button
              onClick={handleCheckoutClick}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#0f388a] text-white text-xs uppercase tracking-widest font-medium hover:bg-[#0a2561] transition-colors rounded-md shadow-md"
            >
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
