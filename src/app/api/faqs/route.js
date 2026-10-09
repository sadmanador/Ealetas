import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET FAQs
export async function GET() {
  try {
    let faqs = await prisma.faqItem.findMany({
      orderBy: { order: 'asc' },
    });

    // Default seeded FAQs if none exist
    if (faqs.length === 0) {
      const defaults = [
        {
          question: 'What are the delivery charges across Bangladesh?',
          answer: 'Standard delivery inside Dhaka City Corporation is 80 BDT. Nationwide outside Dhaka delivery is 120 BDT. The delivery zone and fee are calculated automatically at checkout based on your administrative district and upazila.',
          order: 1,
          isActive: true,
        },
        {
          question: 'Is Cash on Delivery (COD) supported?',
          answer: 'Yes! We support cash on delivery for orders across Bangladesh. You can inspect your signature parcel at the time of delivery.',
          order: 2,
          isActive: true,
        },
        {
          question: 'Are all gemstones and pearls genuine?',
          answer: 'Every piece is verified conflict-free, handpicked, and accompanied by our signature authenticity certificate.',
          order: 3,
          isActive: true,
        },
        {
          question: 'What packaging is included with each purchase?',
          answer: 'All jewelry pieces arrive in our custom presentation jewelry box, tied with satin ribbon and secured for safe transit.',
          order: 4,
          isActive: true,
        },
      ];

      for (const d of defaults) {
        await prisma.faqItem.create({ data: d });
      }
      faqs = await prisma.faqItem.findMany({ orderBy: { order: 'asc' } });
    }

    return NextResponse.json({ faqs });
  } catch (error) {
    console.error('Error in FAQ GET:', error);
    return NextResponse.json({ error: 'Failed to fetch FAQs' }, { status: 500 });
  }
}

// POST create FAQ
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { question, answer, order, isActive } = body;

    if (!question || !answer) {
      return NextResponse.json({ error: 'Question and answer are required' }, { status: 400 });
    }

    const faq = await prisma.faqItem.create({
      data: {
        question,
        answer,
        order: Number(order || 0),
        isActive: isActive !== false,
      },
    });

    return NextResponse.json({ success: true, faq });
  } catch (error) {
    console.error('Error creating FAQ:', error);
    return NextResponse.json({ error: 'Failed to create FAQ' }, { status: 500 });
  }
}

// PATCH update FAQ
export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, question, answer, order, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const faq = await prisma.faqItem.update({
      where: { id },
      data: {
        ...(question !== undefined && { question }),
        ...(answer !== undefined && { answer }),
        ...(order !== undefined && { order: Number(order) }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json({ success: true, faq });
  } catch (error) {
    console.error('Error updating FAQ:', error);
    return NextResponse.json({ error: 'Failed to update FAQ' }, { status: 500 });
  }
}

// DELETE FAQ
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await prisma.faqItem.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting FAQ:', error);
    return NextResponse.json({ error: 'Failed to delete FAQ' }, { status: 500 });
  }
}
