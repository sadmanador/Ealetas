import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Most visited pages
    const pageCounts = await prisma.pageView.groupBy({
      by: ['path'],
      _count: { path: true },
      orderBy: { _count: { path: 'desc' } },
      take: 10,
    });

    // 2. Most visited products
    const productViews = await prisma.pageView.groupBy({
      by: ['productId'],
      where: { productId: { not: null } },
      _count: { productId: true },
      orderBy: { _count: { productId: 'desc' } },
      take: 10,
    });

    // Fetch product details for these product IDs
    const productIds = productViews.map((pv) => pv.productId).filter(Boolean);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, category: true, price: true, images: true },
    });

    const topProducts = productViews.map((pv) => {
      const prod = products.find((p) => p.id === pv.productId);
      return {
        productId: pv.productId,
        name: prod?.name || 'Unknown Product',
        category: prod?.category || '',
        price: prod?.price || 0,
        views: pv._count.productId,
      };
    });

    // Total page views
    const totalViews = await prisma.pageView.count();

    return NextResponse.json({
      totalViews,
      topPages: pageCounts.map((p) => ({ path: p.path, count: p._count.path })),
      topProducts,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
