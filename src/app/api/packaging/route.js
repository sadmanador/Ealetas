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

    const items = await prisma.packagingItem.findMany({
      include: {
        batches: {
          orderBy: { receivedDate: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalStockUnits = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalAssetValue = items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );

    return NextResponse.json({
      items,
      totalStockUnits,
      totalAssetValue,
    });
  } catch (error) {
    console.error('Error fetching packaging items:', error);
    return NextResponse.json({ error: 'Failed to fetch packaging items' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { sku, name, dimensions, description, unitPrice, quantity, supplier } = body;

    if (!sku || !name) {
      return NextResponse.json({ error: 'SKU and Name are required.' }, { status: 400 });
    }

    const cleanSku = sku.trim().toUpperCase();

    // Check SKU uniqueness
    const existing = await prisma.packagingItem.findUnique({
      where: { sku: cleanSku },
    });
    if (existing) {
      return NextResponse.json({ error: `Packaging SKU "${cleanSku}" already exists.` }, { status: 400 });
    }

    const parsedQty = Math.max(0, Number(quantity) || 0);
    const parsedPrice = Math.max(0, Number(unitPrice) || 0);

    const newItem = await prisma.packagingItem.create({
      data: {
        sku: cleanSku,
        name: name.trim(),
        dimensions: dimensions ? dimensions.trim() : null,
        description: description ? description.trim() : null,
        unitPrice: parsedPrice,
        quantity: parsedQty,
      },
    });

    // If initial quantity was supplied, create opening batch record
    if (parsedQty > 0) {
      await prisma.packagingBatch.create({
        data: {
          packagingItemId: newItem.id,
          quantity: parsedQty,
          unitPrice: parsedPrice,
          totalCost: parsedQty * parsedPrice,
          supplier: supplier ? supplier.trim() : 'Opening Stock',
          notes: 'Initial inventory shipment',
        },
      });
    }

    const fullItem = await prisma.packagingItem.findUnique({
      where: { id: newItem.id },
      include: { batches: true },
    });

    return NextResponse.json({ success: true, item: fullItem });
  } catch (error) {
    console.error('Error creating packaging item:', error);
    return NextResponse.json({ error: 'Failed to create packaging item' }, { status: 500 });
  }
}
