import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

export const revalidate = 0;

export default async function TermsPage() {
  let page = await prisma.cmsPage.findUnique({
    where: { slug: 'terms-and-conditions' },
  });

  const defaultContent = `
    <h1>Terms of Service</h1>
    <p>All orders placed through Eletas Jewels are subject to product availability and cash on delivery verification.</p>
    <h2>Delivery Charges</h2>
    <p>Inside Dhaka City Corporation is standard 80 BDT. Nationwide outside Dhaka delivery is 120 BDT. Delivery charges are calculated automatically based on official administrative upazila locations.</p>
    <h2>Product Authenticity</h2>
    <p>Every jewelry piece undergoes meticulous quality appraisal prior to insured dispatch.</p>
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
              <ShieldCheck className="w-3.5 h-3.5 text-[#0f388a]" />
              <span>Legal & Policies</span>
            </div>
          </div>

          <article className="bg-white border border-[#e2edf8] rounded-2xl p-6 sm:p-12 shadow-sm">
            <h1 className="font-serif text-3xl sm:text-4xl text-[#0d2342] font-medium leading-tight border-b border-[#edf4fc] pb-6 mb-8">
              {page?.title || 'Terms & Conditions'}
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
