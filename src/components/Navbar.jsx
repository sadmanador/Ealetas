'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { ShoppingBag, Sparkles } from 'lucide-react';

export default function Navbar() {
  const { totalItemsCount, setIsCartOpen } = useCart();

  return (
    <>
      {/* Top Banner */}
      <div className="bg-[#161513] text-[#d8d3cb] text-center text-[11px] tracking-widest uppercase py-2 px-4 flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-[#b88b42]" />
        <span>Complimentary insured shipping & signature gift packaging across Bangladesh</span>
      </div>

      {/* Main Navbar */}
      <header className="sticky top-0 bg-[#faf8f5]/95 backdrop-blur-md border-b border-[#eae5de] z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="#collection"
              className="text-xs uppercase tracking-widest text-[#1c1a17] hover:text-[#b88b42] transition-colors"
            >
              Collection
            </Link>
            <Link
              href="#rings"
              className="text-xs uppercase tracking-widest text-[#1c1a17] hover:text-[#b88b42] transition-colors"
            >
              Rings
            </Link>
            <Link
              href="#necklaces"
              className="text-xs uppercase tracking-widest text-[#1c1a17] hover:text-[#b88b42] transition-colors"
            >
              Necklaces
            </Link>
            <Link
              href="#about"
              className="text-xs uppercase tracking-widest text-[#1c1a17] hover:text-[#b88b42] transition-colors"
            >
              Our Story
            </Link>
          </nav>

          {/* Brand Logo */}
          <Link href="/" className="flex flex-col items-center">
            <span className="font-serif text-2xl sm:text-3xl tracking-[0.25em] font-medium text-[#1c1a17]">
              EALETAS
            </span>
            <span className="font-sans text-[8px] tracking-[0.4em] text-[#b88b42] -mt-1 uppercase">
              FINE JEWELRY
            </span>
          </Link>

          {/* Right Actions */}
          <div className="flex items-center space-x-5">
            {/* Shopping Bag Button */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              aria-label="Shopping Bag"
              className="relative p-2 text-[#1c1a17] hover:text-[#b88b42] transition-colors"
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.8]" />
              {totalItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#b88b42] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
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
