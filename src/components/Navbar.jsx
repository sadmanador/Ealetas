'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { ShoppingBag, Sparkles } from 'lucide-react';

export default function Navbar() {
  const { totalItemsCount, setIsCartOpen } = useCart();

  return (
    <>
      {/* Top Announcement Banner */}
      <div className="bg-[#0f388a] text-white text-center text-[11px] tracking-wider py-2 px-4 flex items-center justify-center gap-3 font-medium">
        <Sparkles className="w-3.5 h-3.5 text-[#f5eedd]" />
        <span>Timeless Beauty Inspired by the Treasures of the Sea ✦ Delivery: Dhaka ৳80 | Nationwide ৳120</span>
      </div>

      {/* Main Navbar */}
      <header className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-[#e4edf8] z-50 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-7">
            <Link
              href="/"
              className="text-xs uppercase tracking-widest text-[#0d2342] hover:text-[#0f388a] font-medium transition-colors"
            >
              Home
            </Link>
            <Link
              href="#categories"
              className="text-xs uppercase tracking-widest text-[#0d2342] hover:text-[#0f388a] font-medium transition-colors"
            >
              Shop
            </Link>
            <Link
              href="#collection"
              className="text-xs uppercase tracking-widest text-[#0d2342] hover:text-[#0f388a] font-medium transition-colors"
            >
              Collections
            </Link>
            <Link
              href="#about"
              className="text-xs uppercase tracking-widest text-[#0d2342] hover:text-[#0f388a] font-medium transition-colors"
            >
              Our Story
            </Link>
            <Link
              href="#why-choose"
              className="text-xs uppercase tracking-widest text-[#0d2342] hover:text-[#0f388a] font-medium transition-colors"
            >
              Care Guide
            </Link>
          </nav>

          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2 group py-1">
            <img
              src="/theme/logo.png"
              alt="Eletas Jewels"
              className="h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </Link>

          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            <a
              href="#collection"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs text-[#0f388a] hover:text-[#0a2561] font-medium px-3 py-1.5 rounded-full bg-[#f0f6fd] hover:bg-[#e0edfb] transition-colors"
            >
              <span>Explore</span>
              <span className="text-[10px]">→</span>
            </a>

            {/* Shopping Bag Button */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              aria-label="Shopping Bag"
              className="relative p-2.5 text-[#0d2342] hover:text-[#0f388a] hover:bg-[#f0f6fd] rounded-full transition-colors"
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.8]" />
              {totalItemsCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#0f388a] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-in zoom-in-50">
                  {totalItemsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
