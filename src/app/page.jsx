import prisma from '@/lib/prisma';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { Sparkles, Shield, Gem, Clock } from 'lucide-react';

export const revalidate = 0; // Dynamic server component to always show live stock & products

export default async function HomePage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative min-h-[75vh] flex items-center justify-center text-center px-4 py-20 bg-cover bg-center overflow-hidden"
          style={{
            backgroundImage: `linear-gradient(rgba(22, 21, 19, 0.5), rgba(22, 21, 19, 0.6)), url('https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1920&q=80')`
          }}
        >
          <div className="relative z-10 max-w-3xl mx-auto text-white space-y-5 animate-in fade-in duration-700">
            <span className="inline-block text-[11px] tracking-[0.3em] uppercase text-[#e5ca9f] font-medium border border-[#e5ca9f]/40 px-3 py-1 rounded-xs backdrop-blur-xs">
              The Atelier Collection
            </span>
            <h1 className="font-serif text-4xl sm:text-6xl font-normal leading-tight tracking-wide">
              Timeless Grace, <br />
              <span className="italic font-light">Sculpted in Light</span>
            </h1>
            <p className="text-sm sm:text-base text-[#e2ded6] max-w-xl mx-auto font-light leading-relaxed">
              Meticulously handcrafted using ethically sourced gemstones, conflict-free diamonds, and recycled fine metals in Bangladesh.
            </p>
            <div className="pt-4 flex items-center justify-center gap-4 flex-wrap">
              <a
                href="#collection"
                className="px-8 py-3.5 bg-[#b88b42] text-white text-xs uppercase tracking-widest font-medium hover:bg-[#9e7135] transition-all duration-300 rounded-xs shadow-lg"
              >
                Explore Collection
              </a>
              <a
                href="#about"
                className="px-8 py-3.5 border border-white/80 text-white text-xs uppercase tracking-widest font-medium hover:bg-white hover:text-[#1c1a17] transition-all duration-300 rounded-xs"
              >
                Our Atelier
              </a>
            </div>
          </div>
        </section>

        {/* Brand Values */}
        <section className="py-14 bg-white border-b border-[#eae5de]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="p-6 space-y-2.5">
                <div className="w-10 h-10 mx-auto rounded-full bg-[#fbf8f1] flex items-center justify-center text-[#b88b42]">
                  <Gem className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-lg font-medium text-[#1c1a17]">
                  Ethically Sourced
                </h3>
                <p className="text-xs text-[#6b665f] leading-relaxed">
                  Every natural and lab gemstone is verified conflict-free and procured with complete transparency.
                </p>
              </div>

              <div className="p-6 space-y-2.5">
                <div className="w-10 h-10 mx-auto rounded-full bg-[#fbf8f1] flex items-center justify-center text-[#b88b42]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-lg font-medium text-[#1c1a17]">
                  Master Craftsmanship
                </h3>
                <p className="text-xs text-[#6b665f] leading-relaxed">
                  Finished by master artisans with generational precision in microscopic diamond setting.
                </p>
              </div>

              <div className="p-6 space-y-2.5">
                <div className="w-10 h-10 mx-auto rounded-full bg-[#fbf8f1] flex items-center justify-center text-[#b88b42]">
                  <Shield className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-lg font-medium text-[#1c1a17]">
                  Lifetime Care & Authenticity
                </h3>
                <p className="text-xs text-[#6b665f] leading-relaxed">
                  Complimentary annual inspection, cleaning, resizing, and certificate of appraisal.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Products Section */}
        <section id="collection" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-14 space-y-3">
            <span className="text-[11px] tracking-[0.25em] text-[#b88b42] uppercase font-semibold">
              Curated Creations
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#1c1a17]">
              Fine Jewelry Selection
            </h2>
            <p className="text-xs sm:text-sm text-[#6b665f]">
              Designed to be cherished today and passed down through generations. Hover to view alternative angles.
            </p>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {products.length === 0 && (
            <div className="text-center py-16">
              <p className="text-sm text-[#6b665f]">No products available at the moment.</p>
            </div>
          )}
        </section>

        {/* About Section */}
        <section id="about" className="py-20 bg-white border-t border-b border-[#eae5de]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-5">
                <span className="text-[11px] tracking-[0.25em] text-[#b88b42] uppercase font-semibold">
                  Our Philosophy
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#1c1a17]">
                  Jewelry with a Soul
                </h2>
                <p className="text-sm text-[#6b665f] leading-relaxed">
                  At Ealetas, we believe true luxury honors both beauty and provenance. Every silhouette is conceived in our private atelier, blending architectural proportions with organic contours.
                </p>
                <p className="text-sm text-[#6b665f] leading-relaxed">
                  Whether celebrating a milestone or marking an everyday quiet triumph, our pieces are made to live with you through every journey.
                </p>
                <div className="pt-2">
                  <a
                    href="#collection"
                    className="inline-block px-7 py-3 border border-[#b88b42] text-[#b88b42] text-xs uppercase tracking-widest font-medium hover:bg-[#b88b42] hover:text-white transition-colors"
                  >
                    View Signature Pieces
                  </a>
                </div>
              </div>

              <div className="relative aspect-4/3 overflow-hidden rounded-xs border border-[#eae5de]">
                <img
                  src="https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1000&q=80"
                  alt="Jewelry atelier workshop"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
