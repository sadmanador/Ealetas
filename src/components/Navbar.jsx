'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { ShoppingBag, Sparkles } from 'lucide-react';

export default function Navbar() {
  const { totalItemsCount, setIsCartOpen } = useCart();
  const [notice, setNotice] = useState({
    enabled: true,
    text: 'Timeless Beauty Inspired by the Treasures of the Sea ✦ Fast & Insured Delivery across Bangladesh (Dhaka ৳80 | Nationwide ৳120)',
  });

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.noticeBannerText !== undefined) {
          setNotice({
            enabled: data.noticeBannerEnabled !== false,
            text: data.noticeBannerText,
          });
        }
      })
      .catch((err) => console.error('Failed to load notice banner:', err));
  }, []);

  return (
    <>
      {/* Top Announcement Marquee Banner (Admin controlled) */}
      {notice.enabled && (
        <div className="bg-[#0f388a] text-white overflow-hidden py-2 border-b border-[#1349ab] relative z-50">
          <div className="flex animate-marquee whitespace-nowrap">
            <div className="flex items-center gap-8 mx-4 text-xs tracking-wider font-medium">
              <span className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#f5eedd]" />
                {notice.text}
              </span>
              <span className="text-white/40">✦</span>
              <span className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#f5eedd]" />
                {notice.text}
              </span>
              <span className="text-white/40">✦</span>
            </div>
            <div className="flex items-center gap-8 mx-4 text-xs tracking-wider font-medium">
              <span className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#f5eedd]" />
                {notice.text}
              </span>
              <span className="text-white/40">✦</span>
              <span className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#f5eedd]" />
                {notice.text}
              </span>
              <span className="text-white/40">✦</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <header className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-[#e4edf8] z-40 transition-all shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* TOP-LEFT: Brand Logo */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3 group py-1">
              <img
                src="/brand/ealetas-logo.png"
                alt="Eletas Jewels"
                className="h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </Link>

            {/* Navigation Links (placed beside logo on desktop) */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                href="/"
                className="text-xs uppercase tracking-widest text-[#0d2342] hover:text-[#0f388a] font-medium transition-colors"
              >
                Home
              </Link>
              <Link
                href="/#categories"
                className="text-xs uppercase tracking-widest text-[#0d2342] hover:text-[#0f388a] font-medium transition-colors"
              >
                Categories
              </Link>
              <Link
                href="/#collection"
                className="text-xs uppercase tracking-widest text-[#0d2342] hover:text-[#0f388a] font-medium transition-colors"
              >
                Jewelry
              </Link>
              <Link
                href="/founder"
                className="text-xs uppercase tracking-widest text-[#0d2342] hover:text-[#0f388a] font-medium transition-colors"
              >
                Words From Founder
              </Link>
              <Link
                href="/#story"
                className="text-xs uppercase tracking-widest text-[#0d2342] hover:text-[#0f388a] font-medium transition-colors"
              >
                Our Story
              </Link>
              <Link
                href="/#faq"
                className="text-xs uppercase tracking-widest text-[#0d2342] hover:text-[#0f388a] font-medium transition-colors"
              >
                FAQ
              </Link>
            </nav>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            <a
              href="/#collection"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs text-[#0f388a] hover:text-[#0a2561] font-medium px-4 py-2 rounded-full bg-[#f0f6fd] hover:bg-[#e0edfb] transition-colors"
            >
              <span>Explore Pieces</span>
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
