import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#081a38] text-[#c0d3eb] pt-16 pb-8 border-t border-[#122e5a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand info */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="inline-block">
              <img
                src="/theme/logo.png"
                alt="Eletas Jewels"
                className="h-14 w-auto object-contain brightness-0 invert opacity-95"
              />
            </Link>
            <p className="text-xs text-[#9bb7d9] leading-relaxed">
              Inspired by the serenity of the ocean, delicate florals, and nature's hidden treasures. Handcrafted for the moments that matter.
            </p>
            <div className="text-[11px] text-[#e0edfb] font-medium">
              Dhaka, Bangladesh • Fast Delivery Across Bangladesh
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-white font-semibold mb-4">
              Shop Collections
            </h4>
            <ul className="space-y-2.5 text-xs text-[#9bb7d9]">
              <li><a href="#collection" className="hover:text-white transition-colors">Ocean Blue Pendants</a></li>
              <li><a href="#collection" className="hover:text-white transition-colors">Pearl Bloom Earrings</a></li>
              <li><a href="#collection" className="hover:text-white transition-colors">Floral Crystal Rings</a></li>
              <li><a href="#collection" className="hover:text-white transition-colors">Sea Whisper Bracelets</a></li>
              <li><a href="#collection" className="hover:text-white transition-colors">Signature Gifting Edit</a></li>
            </ul>
          </div>

          {/* Help & Shipping */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-white font-semibold mb-4">
              Help & Delivery
            </h4>
            <ul className="space-y-2.5 text-xs text-[#9bb7d9]">
              <li><span className="text-[#e0edfb] font-medium">Inside Dhaka City Corp (80 ৳)</span></li>
              <li><span className="text-[#e0edfb] font-medium">Outside Dhaka / Nationwide (120 ৳)</span></li>
              <li><span>Cash on Delivery Available</span></li>
              <li><span>Complimentary Jewelry Care Guide</span></li>
              <li><span>Insured Transit & Safe Packaging</span></li>
            </ul>
          </div>

          {/* About & Social */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-white font-semibold mb-4">
              Follow Our Journey
            </h4>
            <p className="font-script text-2xl text-[#8bb9ee] leading-tight mb-2">
              Timeless beauty inspired by the treasures of the sea. ♡
            </p>
            <div className="pt-2 text-xs text-[#9bb7d9] space-y-1.5">
              <p className="font-medium text-white">#EletasJewels</p>
              <p className="text-[11px]">Instagram • Facebook • Pinterest • TikTok</p>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-[#122e5a] flex flex-col sm:flex-row items-center justify-between text-xs text-[#7a9abf] gap-3">
          <p>© {new Date().getFullYear()} Eletas Jewels. All rights reserved.</p>
          <p className="text-[#8bb9ee]">Designed with ♡ for ocean lovers.</p>
        </div>
      </div>
    </footer>
  );
}
