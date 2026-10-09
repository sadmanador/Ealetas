import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { Sparkles, ArrowLeft } from 'lucide-react';

export const revalidate = 0;

export default async function FounderPage() {
  let page = await prisma.cmsPage.findUnique({
    where: { slug: 'words-from-founder' },
  });

  const defaultContent = `
    <h1>A Vision of Serenity & Timeless Elegance</h1>
    <p>Welcome to Eletas Jewels. When we founded this jewelry house, our inspiration began at the shores of the Bay of Bengal, where the ocean meets gentle coastal breezes and iridescent pearls are formed quietly over years of patience.</p>
    <blockquote>"Jewelry is more than precious metal and gemstone. It is memory sculpted into light, designed to outlive trends and walk with you through the sacred milestones of life."</blockquote>
    <img src="/brand/ealetas-cover.webp" alt="Eletas atelier workshop" />
    <h2>Our Sacred Promise to You</h2>
    <p>Every gem is verified conflict-free, hand-inspected, and crafted by generational artisans. Whether you are adorning yourself for everyday grace or commemorating a quiet triumph, we invite you to cherish the beauty of the sea.</p>
    <p>Warmest regards,<br /><strong>The Founder & Master Artisans</strong><br /><em>Eletas Jewels</em></p>
  `;

  const title = page?.title || 'Words from the Founder';
  const htmlContent = page?.content || defaultContent;

  return (
    <div className="flex flex-col min-h-screen bg-[#fcfdff] text-[#0d2342]">
      <Navbar />

      <main className="flex-grow py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb / Back */}
          <div className="mb-8 flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-[#0f388a] hover:text-[#0a2561] font-semibold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Storefront
            </Link>
            <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-[#6e85a0]">
              <Sparkles className="w-3.5 h-3.5 text-[#0f388a]" />
              <span>Founder's Atelier</span>
            </div>
          </div>

          {/* Article Container */}
          <article className="bg-white border border-[#e2edf8] rounded-2xl p-6 sm:p-12 shadow-sm">
            <div className="border-b border-[#edf4fc] pb-6 mb-8 text-center sm:text-left">
              <span className="text-[11px] tracking-[0.25em] uppercase font-semibold text-[#0f388a] block mb-2">
                Eletas Manifesto
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl text-[#0d2342] font-medium leading-tight">
                {title}
              </h1>
            </div>

            {/* Dynamic Content rendered from TipTap */}
            <div
              className="tiptap-content max-w-none"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
}
