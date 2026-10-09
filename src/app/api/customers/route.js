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
        .filter((o) => o.status === 'delivered')
        .reduce((sum, o) => sum + o.totalAmount, 0);

      return {
        id: c.id,
        phone: c.phone,
        name: c.name,
        division: c.division,
        district: c.district,
        upazila: c.upazila,
        fullAddress: c.fullAddress,
        isBlacklisted: Boolean(c.isBlacklisted),
        isFraudRisk: Boolean(c.isFraudRisk),
        fraudNotes: c.fraudNotes || '',
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

export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, isBlacklisted, isFraudRisk, fraudNotes } = body;

    if (!id) {
      return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 });
    }

    const updated = await prisma.customer.update({
      where: { id },
      data: {
        ...(typeof isBlacklisted === 'boolean' ? { isBlacklisted } : {}),
        ...(typeof isFraudRisk === 'boolean' ? { isFraudRisk } : {}),
        ...(typeof fraudNotes === 'string' ? { fraudNotes } : {}),
      },
    });

    return NextResponse.json({ success: true, customer: updated });
  } catch (error) {
    console.error('Error updating customer risk/blacklist status:', error);
    return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 });
  }
}
