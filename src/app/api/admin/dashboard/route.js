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

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'month'; // 'today', 'week', 'month', or 'YYYY-MM-DD'

    const now = new Date();
    let startDate;
    let endDate = new Date();

    if (filter === 'today') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (filter === 'week') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (filter === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (/^\d{4}-\d{2}-\d{2}$/.test(filter)) {
      startDate = new Date(`${filter}T00:00:00.000Z`);
      endDate = new Date(`${filter}T23:59:59.999Z`);
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // 1. Orders in date range
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Income (revenue excluding cancelled & returned)
    const validOrders = orders.filter(
      (o) => o.status !== 'cancelled' && o.status !== 'returned'
    );
    const totalIncome = validOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    // Status counts
    const statusCounts = {
      pending: orders.filter((o) => o.status === 'pending').length,
      confirmed: orders.filter((o) => o.status === 'confirmed').length,
      in_transit: orders.filter((o) => o.status === 'in_transit').length,
      delivered: orders.filter((o) => o.status === 'delivered').length,
      cancelled: orders.filter((o) => o.status === 'cancelled').length,
      returned: orders.filter((o) => o.status === 'returned').length,
    };

    // 2. Inventory tracking (low stock products)
    const lowStockProducts = await prisma.product.findMany({
      where: { quantity: { lte: 5 } },
      orderBy: { quantity: 'asc' },
      take: 10,
    });

    const allProducts = await prisma.product.findMany({
      select: { quantity: true, wholesaleCost: true, price: true },
    });
    const totalInventoryUnits = allProducts.reduce((sum, p) => sum + p.quantity, 0);
    const totalWholesaleValue = allProducts.reduce(
      (sum, p) => sum + p.quantity * p.wholesaleCost,
      0
    );

    // 3. Procurement expenditure in date range
    const procurementLogs = await prisma.procurementLog.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });
    const totalProcurementCost = procurementLogs.reduce(
      (sum, l) => sum + l.totalCost,
      0
    );

    return NextResponse.json({
      filter,
      totalIncome,
      totalOrders: orders.length,
      statusCounts,
      totalInventoryUnits,
      totalWholesaleValue,
      totalProcurementCost,
      recentOrders: orders.slice(0, 8),
      lowStockProducts,
    });
  } catch (error) {
    console.error('Error in dashboard metrics API:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard metrics' }, { status: 500 });
  }
}
