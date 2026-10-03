import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const body = await request.json();
    const { path, productId } = body;

    if (!path) {
      return NextResponse.json({ error: 'Path required' }, { status: 400 });
    }

    await prisma.pageView.create({
      data: {
        path: path.slice(0, 255),
        productId: productId || null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    // Non-blocking for clients
    console.error('Analytics track error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
