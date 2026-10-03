import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const customers = await prisma.customer.findMany({
      include: {
        orders: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            orderNumber: true,
            totalAmount: true,
            status: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = customers.map((c) => {
      const totalSpent = c.orders
        .filter((o) => o.status !== 'cancelled' && o.status !== 'returned')
        .reduce((sum, o) => sum + o.totalAmount, 0);

      return {
        id: c.id,
        phone: c.phone,
        name: c.name,
        division: c.division,
        district: c.district,
        upazila: c.upazila,
        fullAddress: c.fullAddress,
        ordersCount: c.orders.length,
        totalSpent,
        orders: c.orders,
        createdAt: c.createdAt,
      };
    });

    return NextResponse.json({ customers: formatted });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}
