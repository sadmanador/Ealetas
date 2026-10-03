import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { packagingItemId, quantity, unitPrice, supplier, notes, receivedDate } = body;

    if (!packagingItemId) {
      return NextResponse.json({ error: 'Please select a packaging item / SKU.' }, { status: 400 });
    }

    const item = await prisma.packagingItem.findUnique({
      where: { id: packagingItemId },
    });

    if (!item) {
      return NextResponse.json({ error: 'Packaging item not found.' }, { status: 404 });
    }

    const batchQty = Math.max(1, Number(quantity) || 1);
    const batchPrice = Math.max(0, Number(unitPrice) || item.unitPrice || 0);
    const totalCost = batchQty * batchPrice;

    // Use transaction to add shipment and update master item
    const [batch, updatedItem] = await prisma.$transaction([
      prisma.packagingBatch.create({
        data: {
          packagingItemId,
          quantity: batchQty,
          unitPrice: batchPrice,
          totalCost,
          supplier: supplier ? supplier.trim() : null,
          notes: notes ? notes.trim() : null,
          receivedDate: receivedDate ? new Date(receivedDate) : new Date(),
        },
      }),
      prisma.packagingItem.update({
        where: { id: packagingItemId },
        data: {
          quantity: { increment: batchQty },
          unitPrice: batchPrice, // update latest unit price
        },
        include: {
          batches: {
            orderBy: { receivedDate: 'desc' },
          },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      batch,
      item: updatedItem,
    });
  } catch (error) {
    console.error('Error adding packaging shipment batch:', error);
    return NextResponse.json({ error: 'Failed to record shipment batch' }, { status: 500 });
  }
}
