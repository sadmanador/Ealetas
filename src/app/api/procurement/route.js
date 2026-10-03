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
      orderBy: { date: 'desc' },
    });

    const totalExpenditure = logs.reduce((acc, log) => acc + (log.totalCost || 0), 0);

    return NextResponse.json({ logs, totalExpenditure });
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
    const { date, transportCost, foodCost, wholesaleProductCost, otherCost, notes } = body;

    const transport = Math.max(0, Number(transportCost) || 0);
    const food = Math.max(0, Number(foodCost) || 0);
    const wholesale = Math.max(0, Number(wholesaleProductCost) || 0);
    const other = Math.max(0, Number(otherCost) || 0);
    const total = transport + food + wholesale + other;

    const log = await prisma.procurementLog.create({
      data: {
        date: date ? new Date(date) : new Date(),
        transportCost: transport,
        foodCost: food,
        wholesaleProductCost: wholesale,
        otherCost: other,
        totalCost: total,
        notes: notes || null,
      },
    });

    return NextResponse.json({ success: true, log });
  } catch (error) {
    console.error('Error creating procurement log:', error);
    return NextResponse.json({ error: 'Failed to save log' }, { status: 500 });
  }
}
