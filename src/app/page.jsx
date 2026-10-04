import prisma from '@/lib/prisma';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';
import {
  Sparkles,
  Shield,
  Gem,
  Truck,
  Gift,
  Heart,
  Waves,
  ArrowRight,
  ChevronDown,
  Star,
  CheckCircle2,
} from 'lucide-react';

export const revalidate = 0; // Dynamic server component to always show live stock & products

export default async function HomePage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
  });

  // Six visual categories matching the theme design
  const categories = [
    {
      title: 'Necklaces',
      subtitle: 'Deep. Elegant. Endless.',
      image: '/theme/cat-necklaces.png',
      tag: 'Necklaces',
    },
    {
      title: 'Earrings',
      subtitle: 'Classic. Soft. Forever.',
      image: '/theme/cat-earrings.png',
      tag: 'Earrings',
    },
    {
      title: 'Rings',
      subtitle: 'Nature in every detail.',
      image: '/theme/cat-rings.png',
      tag: 'Rings',
    },
    {
      title: 'Bracelets',
      subtitle: 'Simple. Beautiful. You.',
      image: '/theme/cat-bracelets.png',
      tag: 'Bracelets',
    },
    {
      title: 'Pearl Collection',
      subtitle: 'Lustrous ocean pearls.',
      image: '/theme/cat-pearls.png',
      tag: 'Pearls',
    },
    {
      title: 'Gifting Edit',
      subtitle: 'Because they deserve the best.',
      image: '/theme/cat-gifting.png',
      tag: 'Gifting',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#fcfdff] text-[#0d2342]">
      <Navbar />

      <main className="flex-grow">
        {/* 1. HERO SECTION */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#eaf3fc] via-[#f4f8fe] to-[#ffffff] border-b border-[#e2edf8]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column: Headlines & CTAs */}
              <div className="lg:col-span-6 space-y-6 text-center lg:text-left z-10">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-[#cde0f8] shadow-xs backdrop-blur-xs">
                  <Sparkles className="w-3.5 h-3.5 text-[#0f388a]" />
                  <span className="text-[11px] tracking-[0.25em] uppercase font-semibold text-[#0f388a]">
                    Ocean ✦ Nature ✦ Timeless Beauty
                  </span>
                </div>

                <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#0d2342] leading-[1.15] font-normal">
                  Jewelry that feels like a{' '}
                  <span className="font-script text-5xl sm:text-6xl lg:text-7xl text-[#0f388a] font-normal not-italic block sm:inline">
                    memory.
                  </span>
                </h1>

                <p className="text-sm sm:text-base text-[#4a617c] max-w-xl mx-auto lg:mx-0 font-light leading-relaxed">
                  Inspired by the treasures of the sea, crafted for the moments that matter. Discover fine ocean sapphire pendants, luminous pearls, and conflict-free gemstones.
                </p>

                <div className="pt-2 flex items-center justify-center lg:justify-start gap-4 flex-wrap">
                  <a
                    href="#collection"
                    className="px-8 py-3.5 bg-[#0f388a] hover:bg-[#0a2561] text-white text-xs uppercase tracking-widest font-medium rounded-full shadow-lg shadow-[#0f388a]/20 hover:shadow-xl transition-all duration-300 flex items-center gap-2 group"
                  >
                    <span>Shop Now</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </a>
                  <a
                    href="#story"
                    className="px-8 py-3.5 bg-white border border-[#cde0f8] text-[#0f388a] text-xs uppercase tracking-widest font-medium rounded-full hover:bg-[#f0f6fd] transition-all duration-300"
                  >
                    Our Story
                  </a>
                </div>

                {/* Sub-note */}
                <div className="pt-4 flex items-center justify-center lg:justify-start gap-6 text-xs text-[#5e7692]">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#0f388a]" />
                    <span>Nationwide Delivery</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#0f388a]" />
                    <span>Gift Packaging</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Hero Visual from Theme */}
              <div className="lg:col-span-6 relative">
                <div className="relative mx-auto max-w-lg lg:max-w-none">
                  {/* Outer subtle glow */}
                  <div className="absolute -inset-2 bg-gradient-to-r from-[#bde0fe] to-[#d0e6fd] rounded-2xl filter blur-xl opacity-60" />
                  
                  {/* Main Hero Visual Card */}
                  <div className="relative rounded-2xl overflow-hidden border border-[#d2e2f6] shadow-2xl bg-white group">
                    <img
                      src="/theme/hero-full.png"
                      alt="Eletas Jewels ocean sapphire jewelry collection"
                      className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-102"
                      priority="true"
                    />

                    {/* Floating badge */}
                    <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-md px-4 py-2 rounded-xl border border-[#cde0f8] shadow-md flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#0f388a] animate-pulse" />
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-[#6e85a0] font-medium">Collection</p>
                        <p className="text-xs font-semibold text-[#0d2342]">Ocean Jewels</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Scroll Indicator */}
            <div className="pt-10 flex flex-col items-center justify-center text-center text-[#7a93b0]">
              <span className="text-[10px] uppercase tracking-[0.25em] font-medium">Scroll to Discover</span>
              <ChevronDown className="w-4 h-4 animate-bounce mt-1 text-[#0f388a]" />
            </div>
          </div>
        </section>

        {/* 2. FIVE PILLARS VALUE PROPOSITION BAR (FROM THEME) */}
        <section className="py-8 bg-white border-b border-[#e4edf8]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-[#edf4fc]">
              {/* Pillar 1 */}
              <div className="pt-4 md:pt-0 px-2 space-y-1.5 flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-[#f0f6fd] text-[#0f388a] flex items-center justify-center mb-1">
                  <Waves className="w-5 h-5 stroke-[1.8]" />
                </div>
                <h4 className="text-xs uppercase tracking-wider font-semibold text-[#0d2342]">
                  Ocean Inspired
                </h4>
                <p className="text-[11px] text-[#6e85a0] leading-snug">
                  Finest materials & sea treasures
                </p>
              </div>

              {/* Pillar 2 */}
              <div className="pt-4 md:pt-0 px-2 space-y-1.5 flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-[#f0f6fd] text-[#0f388a] flex items-center justify-center mb-1">
                  <Gem className="w-5 h-5 stroke-[1.8]" />
                </div>
                <h4 className="text-xs uppercase tracking-wider font-semibold text-[#0d2342]">
                  Nature Inspired
                </h4>
                <p className="text-[11px] text-[#6e85a0] leading-snug">
                  Ocean • Flora • Elegance
                </p>
              </div>

              {/* Pillar 3 */}
              <div className="pt-4 md:pt-0 px-2 space-y-1.5 flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-[#f0f6fd] text-[#0f388a] flex items-center justify-center mb-1">
                  <Heart className="w-5 h-5 stroke-[1.8]" />
                </div>
                <h4 className="text-xs uppercase tracking-wider font-semibold text-[#0d2342]">
                  Handpicked with Love
                </h4>
                <p className="text-[11px] text-[#6e85a0] leading-snug">
                  Every piece, a unique story
                </p>
              </div>

              {/* Pillar 4 */}
              <div className="pt-4 md:pt-0 px-2 space-y-1.5 flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-[#f0f6fd] text-[#0f388a] flex items-center justify-center mb-1">
                  <Truck className="w-5 h-5 stroke-[1.8]" />
                </div>
                <h4 className="text-xs uppercase tracking-wider font-semibold text-[#0d2342]">
                  Fast & Secure Shipping
                </h4>
                <p className="text-[11px] text-[#6e85a0] leading-snug">
                  Dhaka 80৳ • Outside 120৳
                </p>
              </div>

              {/* Pillar 5 */}
              <div className="pt-4 md:pt-0 px-2 space-y-1.5 flex flex-col items-center col-span-2 md:col-span-1">
                <div className="w-10 h-10 rounded-full bg-[#f0f6fd] text-[#0f388a] flex items-center justify-center mb-1">
                  <Gift className="w-5 h-5 stroke-[1.8]" />
                </div>
                <h4 className="text-xs uppercase tracking-wider font-semibold text-[#0d2342]">
                  Beautiful Packaging
                </h4>
                <p className="text-[11px] text-[#6e85a0] leading-snug">
                  Signature gift presentation
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. EXPLORE OUR COLLECTIONS / SHOP BY CATEGORY (6 ARCHED CARDS) */}
        <section id="categories" className="py-16 bg-[#fcfdff]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
              <span className="text-[11px] tracking-[0.25em] text-[#0f388a] uppercase font-semibold">
                Explore Our
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#0d2342]">
                <span className="font-script text-4xl sm:text-5xl text-[#0f388a]">Collections</span>
              </h2>
              <div className="w-16 h-0.5 bg-[#cde0f8] mx-auto mt-2" />
              <p className="text-xs sm:text-sm text-[#5e7692] pt-1">
                Discover ocean-born pieces meticulously handcrafted for every milestone.
              </p>
            </div>

            {/* 6 Arched Category Cards from Theme */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
              {categories.map((cat, idx) => (
                <a
                  key={idx}
                  href="#collection"
                  className="group flex flex-col items-center text-center p-3 rounded-2xl bg-white border border-[#e2edf8] shadow-xs hover:shadow-xl hover:border-[#b8d4f7] hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Arched image shape */}
                  <div className="relative w-full aspect-[4/5] rounded-t-full rounded-b-lg overflow-hidden bg-[#f0f6fd] border border-[#dce9f8] mb-3">
                    <img
                      src={cat.image}
                      alt={cat.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                  </div>
                  <h3 className="font-serif text-sm font-semibold text-[#0d2342] group-hover:text-[#0f388a] transition-colors">
                    {cat.title}
                  </h3>
                  <p className="text-[10px] text-[#7a93b0] mt-0.5 line-clamp-1">{cat.subtitle}</p>
                  <span className="text-[10px] text-[#0f388a] font-medium mt-1.5 inline-flex items-center gap-0.5 opacity-90 group-hover:translate-x-0.5 transition-transform">
                    Shop Now <span>→</span>
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* 4. OUR BRAND STORY SECTION */}
        <section id="story" className="py-20 bg-gradient-to-r from-[#f4f9fe] via-[#fbfdff] to-[#f4f9fe] border-t border-b border-[#e2edf8]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Column: Arched Image with Seashell, Pearl & Flowers */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="relative w-full max-w-sm">
                  <div className="absolute -inset-3 bg-gradient-to-b from-[#c5def7] to-[#e0edfb] rounded-t-full rounded-b-2xl filter blur-lg opacity-70" />
                  <div className="relative rounded-t-full rounded-b-2xl overflow-hidden border-2 border-white shadow-2xl bg-white">
                    <img
                      src="/theme/brand-story-shell.png"
                      alt="Eletas Jewels brand story - oceanic pearls and florals"
                      className="w-full h-auto object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Story Copy & Accents */}
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                <span className="text-[11px] tracking-[0.25em] text-[#0f388a] uppercase font-semibold">
                  Our Brand Story
                </span>

                <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#0d2342] leading-tight">
                  A Story Born from the{' '}
                  <span className="font-script text-4xl sm:text-5xl text-[#0f388a] block sm:inline">
                    Beauty of the Ocean
                  </span>
                </h2>

                <div className="space-y-4 text-xs sm:text-sm text-[#4a617c] leading-relaxed font-light">
                  <p>
                    At Eletas Jewels, we believe jewelry is more than an accessory — it is a memory, a celebration, and a reflection of timeless elegance.
                  </p>
                  <p>
                    Inspired by the serenity of the ocean, delicate blue florals, and nature's hidden treasures, every piece is chosen to bring beauty to everyday moments. Eletas is for every woman who finds strength, grace, and confidence in the little details.
                  </p>
                </div>

                {/* Calligraphic Quote from Theme */}
                <div className="py-2 border-y border-[#e2edf8]">
                  <p className="font-script text-2xl sm:text-3xl text-[#0f388a]">
                    "Timeless beauty inspired by the treasures of the sea." ♡
                  </p>
                </div>

                {/* 4 Feature Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2 text-center">
                  <div className="p-3 bg-white border border-[#e2edf8] rounded-xl">
                    <Waves className="w-5 h-5 mx-auto text-[#0f388a] mb-1" />
                    <p className="text-[11px] font-semibold text-[#0d2342]">Nature</p>
                    <p className="text-[9px] text-[#7a93b0]">in every detail</p>
                  </div>
                  <div className="p-3 bg-white border border-[#e2edf8] rounded-xl">
                    <Sparkles className="w-5 h-5 mx-auto text-[#0f388a] mb-1" />
                    <p className="text-[11px] font-semibold text-[#0d2342]">Elegance</p>
                    <p className="text-[9px] text-[#7a93b0]">in every piece</p>
                  </div>
                  <div className="p-3 bg-white border border-[#e2edf8] rounded-xl">
                    <Gem className="w-5 h-5 mx-auto text-[#0f388a] mb-1" />
                    <p className="text-[11px] font-semibold text-[#0d2342]">Inspired</p>
                    <p className="text-[9px] text-[#7a93b0]">by the ocean</p>
                  </div>
                  <div className="p-3 bg-white border border-[#e2edf8] rounded-xl">
                    <Heart className="w-5 h-5 mx-auto text-[#0f388a] mb-1" />
                    <p className="text-[11px] font-semibold text-[#0d2342]">Cherished</p>
                    <p className="text-[9px] text-[#7a93b0]">made to last</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. SIGNATURE OCEAN COLLECTION PANORAMIC BANNER */}
        <section className="relative overflow-hidden bg-[#e0edfb] border-b border-[#cde0f8]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="relative rounded-2xl overflow-hidden shadow-lg border border-[#cde0f8]">
              <img
                src="/theme/ocean-banner.png"
                alt="Signature Ocean Collection"
                className="w-full h-auto object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0d2342]/40 via-transparent to-transparent flex items-center px-6 sm:px-12">
                <div className="max-w-md space-y-2 text-white">
                  <span className="font-script text-2xl sm:text-3xl text-sky-200">Signature</span>
                  <h3 className="font-serif text-xl sm:text-3xl uppercase tracking-wider font-semibold">
                    Ocean Collection
                  </h3>
                  <p className="text-xs sm:text-sm text-sky-100 font-light hidden sm:block">
                    A blend of ocean hues, delicate florals, and timeless charm.
                  </p>
                  <a
                    href="#collection"
                    className="inline-block mt-2 px-5 py-2.5 bg-white text-[#0f388a] text-xs font-semibold uppercase tracking-wider rounded-full hover:bg-[#0f388a] hover:text-white transition-colors shadow-md"
                  >
                    Shop the Collection →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. BEST SELLERS / PRODUCT CATALOG */}
        <section id="collection" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-14 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f0f6fd] border border-[#d2e2f6]">
              <Sparkles className="w-3.5 h-3.5 text-[#0f388a]" />
              <span className="text-[10px] tracking-[0.25em] text-[#0f388a] uppercase font-semibold">
                Best Sellers & Curated Creations
              </span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#0d2342]">
              Fine Jewelry Selection
            </h2>
            <p className="text-xs sm:text-sm text-[#5e7692]">
              Hover over any item to preview alternative angles. Real-time stock tracked across Dhaka and all Bangladesh districts.
            </p>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {products.length === 0 && (
            <div className="text-center py-16 bg-white border border-[#e2edf8] rounded-xl">
              <p className="text-sm text-[#5e7692]">No jewelry products found.</p>
            </div>
          )}
        </section>

        {/* 7. WHY CHOOSE ELETAS JEWELS */}
        <section id="why-choose" className="py-16 bg-white border-t border-b border-[#e2edf8]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <span className="text-[11px] tracking-[0.25em] text-[#0f388a] uppercase font-semibold">
              The Eletas Standard
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#0d2342] mt-1 mb-10">
              Why Choose Eletas Jewels?
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Feature 1 */}
              <div className="p-6 bg-[#f8fbfe] border border-[#e2edf8] rounded-xl space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-white shadow-xs text-[#0f388a] flex items-center justify-center border border-[#d2e2f6]">
                  <Gem className="w-6 h-6 stroke-[1.8]" />
                </div>
                <h3 className="font-serif text-base font-semibold text-[#0d2342]">
                  Curated with Care
                </h3>
                <p className="text-xs text-[#5e7692] leading-relaxed">
                  Handpicked pieces inspected for lasting luster, gemstone clarity, and artisanal finish.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-6 bg-[#f8fbfe] border border-[#e2edf8] rounded-xl space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-white shadow-xs text-[#0f388a] flex items-center justify-center border border-[#d2e2f6]">
                  <Waves className="w-6 h-6 stroke-[1.8]" />
                </div>
                <h3 className="font-serif text-base font-semibold text-[#0d2342]">
                  Inspired by Nature
                </h3>
                <p className="text-xs text-[#5e7692] leading-relaxed">
                  Designs that capture the quiet majesty of ocean waves, pearls, and coastal wildflowers.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-6 bg-[#f8fbfe] border border-[#e2edf8] rounded-xl space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-white shadow-xs text-[#0f388a] flex items-center justify-center border border-[#d2e2f6]">
                  <Heart className="w-6 h-6 stroke-[1.8]" />
                </div>
                <h3 className="font-serif text-base font-semibold text-[#0d2342]">
                  Made For You
                </h3>
                <p className="text-xs text-[#5e7692] leading-relaxed">
                  Because every woman deserves to celebrate herself with pieces that feel truly special.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="p-6 bg-[#f8fbfe] border border-[#e2edf8] rounded-xl space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-white shadow-xs text-[#0f388a] flex items-center justify-center border border-[#d2e2f6]">
                  <Gift className="w-6 h-6 stroke-[1.8]" />
                </div>
                <h3 className="font-serif text-base font-semibold text-[#0d2342]">
                  Perfect for Gifting
                </h3>
                <p className="text-xs text-[#5e7692] leading-relaxed">
                  Every order arrives nestled in an elegant keepsake presentation box ready to delight.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 8. TESTIMONIALS & SOCIAL GALLERY */}
        <section className="py-16 bg-[#fcfdff]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Customer Testimonial Quote from Theme */}
              <div className="lg:col-span-6 space-y-4 p-8 bg-white border border-[#e2edf8] rounded-2xl shadow-xs">
                <div className="flex items-center gap-1 text-[#c59b3f] text-sm">
                  ★★★★★
                </div>
                <blockquote className="font-serif text-lg sm:text-xl text-[#0d2342] italic leading-relaxed">
                  "Such beautiful pieces! The quality, packaging and attention to detail are just amazing. Eletas has become my favorite!"
                </blockquote>
                <div className="flex items-center justify-between pt-2 border-t border-[#edf4fc]">
                  <span className="text-xs text-[#0f388a] font-semibold">— A Happy Customer ♡</span>
                  <span className="text-[10px] text-[#7a93b0]">Verified Buyer</span>
                </div>
              </div>

              {/* Real Customer Photos from Theme */}
              <div className="lg:col-span-6">
                <div className="text-center lg:text-left mb-4">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-[#0f388a] font-semibold">
                    Follow Our Journey
                  </p>
                  <p className="font-script text-3xl text-[#0d2342]">@eletas.jewels</p>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  <img
                    src="/theme/review-1.png"
                    alt="Customer review 1"
                    className="w-full aspect-square object-cover rounded-xl border border-[#d2e2f6] shadow-xs hover:scale-105 transition-transform"
                  />
                  <img
                    src="/theme/review-2.png"
                    alt="Customer review 2"
                    className="w-full aspect-square object-cover rounded-xl border border-[#d2e2f6] shadow-xs hover:scale-105 transition-transform"
                  />
                  <img
                    src="/theme/review-3.png"
                    alt="Customer review 3"
                    className="w-full aspect-square object-cover rounded-xl border border-[#d2e2f6] shadow-xs hover:scale-105 transition-transform"
                  />
                  <img
                    src="/theme/review-4.png"
                    alt="Customer review 4"
                    className="w-full aspect-square object-cover rounded-xl border border-[#d2e2f6] shadow-xs hover:scale-105 transition-transform"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 9. STAY CONNECTED NEWSLETTER BANNER */}
        <section className="py-14 bg-gradient-to-r from-[#0f388a] via-[#12429f] to-[#0a2561] text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#d2e6fc] font-medium">
              Stay Connected
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-normal">
              Let's Stay Connected
            </h3>
            <p className="text-xs sm:text-sm text-[#c5def7] max-w-lg mx-auto font-light">
              Be the first to know about new ocean collections, special subscriber offers, and behind-the-scenes stories.
            </p>

            <form
              action="#"
              className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                placeholder="Enter your email address"
                className="w-full px-4 py-2.5 rounded-full bg-white/95 text-[#0d2342] text-xs focus:outline-none shadow-sm"
              />
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-white text-[#0f388a] hover:bg-[#e0edfb] text-xs uppercase tracking-wider font-semibold shadow-md transition-colors"
              >
                Subscribe →
              </button>
            </form>

            <p className="font-script text-xl text-[#d2e6fc] pt-2">
              Let's keep in touch ♡
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
