import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { status } = body;

    const validStatuses = ['pending', 'confirmed', 'in_transit', 'delivered', 'cancelled', 'returned'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid order status' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    let shouldDeductInventory = status === 'delivered' && !order.inventoryAdjusted;
    let shouldRestockInventory = (status === 'cancelled' || status === 'returned') && order.inventoryAdjusted;

    // Transaction for order update and inventory adjustment
    await prisma.$transaction(async (tx) => {
      // 1. If delivering and not yet deducted, reduce stock
      if (shouldDeductInventory) {
        for (const item of order.items) {
          if (item.productId) {
            await tx.product.update({
              where: { id: item.productId },
              data: {
                quantity: {
                  decrement: item.quantity,
                },
              },
            });
          }
        }
      }

      // 2. If cancelled/returned and was deducted previously, restore stock
      if (shouldRestockInventory) {
        for (const item of order.items) {
          if (item.productId) {
            await tx.product.update({
              where: { id: item.productId },
              data: {
                quantity: {
                  increment: item.quantity,
                },
              },
            });
          }
        }
      }

      // 3. Update Order
      await tx.order.update({
        where: { id },
        data: {
          status,
          inventoryAdjusted: shouldDeductInventory ? true : shouldRestockInventory ? false : order.inventoryAdjusted,
        },
      });
    });

    const updatedOrder = await prisma.order.findUnique({
      where: { id },
      include: { items: true, customer: true },
    });

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
  }
}
