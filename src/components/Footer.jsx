import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#161513] text-[#d1cbc2] pt-16 pb-8 border-t border-[#262420]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand info */}
          <div className="space-y-4 md:col-span-1">
            <span className="font-serif text-2xl tracking-[0.2em] text-white block">
              EALETAS
            </span>
            <p className="text-xs text-[#9c978f] leading-relaxed">
              Exquisite modern jewelry handcrafted with ethical gemstones and rare metals for the moments that define you.
            </p>
            <div className="text-[11px] text-[#b88b42]">
              Dhaka, Bangladesh • Nationwide Express Delivery
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-white font-medium mb-4">
              Collections
            </h4>
            <ul className="space-y-2.5 text-xs text-[#9c978f]">
              <li><a href="#collection" className="hover:text-white transition-colors">Solitaire Rings</a></li>
              <li><a href="#collection" className="hover:text-white transition-colors">Diamond Necklaces</a></li>
              <li><a href="#collection" className="hover:text-white transition-colors">Pearl Drop Earrings</a></li>
              <li><a href="#collection" className="hover:text-white transition-colors">Bespoke Bridal</a></li>
            </ul>
          </div>

          {/* Service */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-white font-medium mb-4">
              Care & Service
            </h4>
            <ul className="space-y-2.5 text-xs text-[#9c978f]">
              <li><span className="text-[#9c978f]">Inside Dhaka City Corp (80 ৳)</span></li>
              <li><span className="text-[#9c978f]">Outside Dhaka Delivery (120 ৳)</span></li>
              <li><span className="text-[#9c978f]">Complimentary Cleaning & Care</span></li>
              <li><span className="text-[#9c978f]">100% Insured Transit</span></li>
            </ul>
          </div>

          {/* Consultations */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-white font-medium mb-4">
              Private Concierge
            </h4>
            <ul className="space-y-2.5 text-xs text-[#9c978f]">
              <li><span className="text-[#9c978f]">Bespoke Ring Designing</span></li>
              <li><span className="text-[#9c978f]">Diamond Consultation</span></li>
              <li><span className="text-[#9c978f]">Private Atelier Viewing</span></li>
              <li><span className="text-[#9c978f]">Certificate of Authenticity</span></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-[#262420] text-center text-xs text-[#7d7870]">
          <p>© {new Date().getFullYear()} Ealetas Fine Jewelry. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
