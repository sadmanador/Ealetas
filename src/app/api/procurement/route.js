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

    const logs = await prisma.procurementLog.findMany({
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, slug: true, price: true } },
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    const totalExpenditure = logs.reduce((acc, log) => acc + (log.totalCost || 0), 0);
    const totalWholesaleSourced = logs.reduce((acc, log) => acc + (log.wholesaleProductCost || 0), 0);
    const totalTravelCosts = logs.reduce(
      (acc, log) => acc + (log.transportCost || 0) + (log.foodCost || 0) + (log.otherCost || 0),
      0
    );

    return NextResponse.json({
      logs,
      totalExpenditure,
      totalWholesaleSourced,
      totalTravelCosts,
    });
  } catch (error) {
    console.error('Error fetching procurement logs:', error);
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, date, transportCost, foodCost, otherCost, supplier, notes, items } = body;

    const transport = Math.max(0, Number(transportCost) || 0);
    const food = Math.max(0, Number(foodCost) || 0);
    const other = Math.max(0, Number(otherCost) || 0);

    // Auto-calculate wholesale total from item batches
    let autoWholesaleProductCost = 0;
    const itemsData = [];

    if (Array.isArray(items) && items.length > 0) {
      for (const item of items) {
        if (!item.name || !item.name.trim()) continue;
        const qty = Math.max(1, Number(item.quantity) || 1);
        const unitCost = Math.max(0, Number(item.unitPrice) || 0);
        const lineTotal = qty * unitCost;

        autoWholesaleProductCost += lineTotal;

        itemsData.push({
          name: item.name.trim(),
          category: item.category ? item.category.trim() : 'Jewelry',
          colorName: item.colorName ? item.colorName.trim() : null,
          colorCode: item.colorCode ? item.colorCode.trim() : null,
          quantity: qty,
          unitPrice: unitCost,
          totalCost: lineTotal,
          productId: item.productId || null,
        });
      }
    }

    const total = transport + food + other + autoWholesaleProductCost;

    const log = await prisma.procurementLog.create({
      data: {
        title: title ? title.trim() : 'Jewelry Procurement Trip',
        date: date ? new Date(date) : new Date(),
        transportCost: transport,
        foodCost: food,
        wholesaleProductCost: autoWholesaleProductCost,
        otherCost: other,
        totalCost: total,
        supplier: supplier ? supplier.trim() : null,
        notes: notes ? notes.trim() : null,
        items: {
          create: itemsData,
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json({ success: true, log });
  } catch (error) {
    console.error('Error creating procurement log:', error);
    return NextResponse.json({ error: 'Failed to save log: ' + error.message }, { status: 500 });
  }
}
