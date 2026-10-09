import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET public or admin CMS pages by slug or list all
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (slug) {
      let page = await prisma.cmsPage.findUnique({
        where: { slug },
      });

      // Default fallback content if not yet customized
      if (!page) {
        if (slug === 'words-from-founder') {
          page = {
            slug: 'words-from-founder',
            title: 'Words from the Founder',
            content: `
              <h1>A Vision of Serenity & Timeless Elegance</h1>
              <p>Welcome to Eletas Jewels. When we founded this jewelry house, our inspiration began at the shores of the Bay of Bengal, where the ocean meets gentle coastal breezes and iridescent pearls are formed quietly over years of patience.</p>
              <blockquote>"Jewelry is more than precious metal and gemstone. It is memory sculpted into light, designed to outlive trends and walk with you through the sacred milestones of life."</blockquote>
              <img src="/brand/ealetas-cover.webp" alt="Eletas atelier workshop" />
              <h2>Our Sacred Promise to You</h2>
              <p>Every gem is verified conflict-free, hand-inspected, and crafted by generational artisans. Whether you are adorning yourself for everyday grace or commemorating a quiet triumph, we invite you to cherish the beauty of the sea.</p>
              <p>Warmest regards,<br /><strong>The Founder & Master Artisans</strong><br /><em>Eletas Jewels</em></p>
            `,
          };
        } else if (slug === 'terms-and-conditions') {
          page = {
            slug: 'terms-and-conditions',
            title: 'Terms & Conditions',
            content: `
              <h1>Terms of Service</h1>
              <p>All orders placed through Eletas Jewels are subject to product availability and cash on delivery verification.</p>
              <h2>Delivery Charges</h2>
              <p>Inside Dhaka City Corporation is standard 80 BDT. Nationwide outside Dhaka delivery is 120 BDT. Delivery charges are non-refundable once an order has been dispatched.</p>
            `,
          };
        } else if (slug === 'return-policy') {
          page = {
            slug: 'return-policy',
            title: 'Return & Exchange Policy',
            content: `
              <h1>Hassle-Free Returns & Exchanges</h1>
              <p>We want you to treasure every piece. If your jewelry arrives damaged or defective, notify us within 24 hours of delivery with photo proof.</p>
              <p>Due to the personal nature of fine jewelry, items must be unworn and in original signature packaging.</p>
            `,
          };
        }
      }

      return NextResponse.json({ page });
    }

    const pages = await prisma.cmsPage.findMany({
      orderBy: { updatedAt: 'desc' },
    });
    return NextResponse.json({ pages });
  } catch (error) {
    console.error('Error in CMS page GET:', error);
    return NextResponse.json({ error: 'Failed to fetch CMS page' }, { status: 500 });
  }
}

// POST/PUT save CMS page
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { slug, title, content } = body;

    if (!slug || !title) {
      return NextResponse.json({ error: 'Slug and title are required' }, { status: 400 });
    }

    const page = await prisma.cmsPage.upsert({
      where: { slug },
      update: { title, content: content || '' },
      create: { slug, title, content: content || '' },
    });

    return NextResponse.json({ success: true, page });
  } catch (error) {
    console.error('Error saving CMS page:', error);
    return NextResponse.json({ error: 'Failed to save CMS page' }, { status: 500 });
  }
}
