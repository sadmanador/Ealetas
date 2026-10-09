import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { RotateCcw, ArrowLeft } from 'lucide-react';

export const revalidate = 0;

export default async function ReturnPolicyPage() {
  let page = await prisma.cmsPage.findUnique({
    where: { slug: 'return-policy' },
  });

  const defaultContent = `
    <h1>Hassle-Free Returns & Exchanges</h1>
    <p>We want you to treasure every piece. If your jewelry arrives damaged or defective, notify us within 24 hours of delivery with photo proof.</p>
    <h2>Return Conditions</h2>
    <p>Due to the personal and delicate nature of fine jewelry, items must be unworn, in pristine condition, and in original signature gift packaging.</p>
    <h2>Refund Timeline</h2>
    <p>Once inspected and approved by our atelier, refunds or exchanges will be processed within 3-5 business days.</p>
  `;

  return (
    <div className="flex flex-col min-h-screen bg-[#fcfdff] text-[#0d2342]">
      <Navbar />
      <main className="flex-grow py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-[#0f388a] hover:text-[#0a2561] font-semibold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Storefront
            </Link>
            <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-[#6e85a0]">
              <RotateCcw className="w-3.5 h-3.5 text-[#0f388a]" />
              <span>Assurance & Care</span>
            </div>
          </div>

          <article className="bg-white border border-[#e2edf8] rounded-2xl p-6 sm:p-12 shadow-sm">
            <h1 className="font-serif text-3xl sm:text-4xl text-[#0d2342] font-medium leading-tight border-b border-[#edf4fc] pb-6 mb-8">
              {page?.title || 'Return & Exchange Policy'}
            </h1>
            <div
              className="tiptap-content max-w-none"
              dangerouslySetInnerHTML={{ __html: page?.content || defaultContent }}
            />
          </article>
        </div>
      </main>
      <Footer />
    </div>
  );
}
