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
    const { status, packagingItems, itemAdjustments } = body;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        packagingItems: { include: { packagingItem: true } },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Strict transition definitions
    const allowedTransitions = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['packaged', 'cancelled'],
      packaged: ['in_transit', 'cancelled'],
      in_transit: ['delivered', 'returned'],
      delivered: ['returned'],
      returned: [], // Locked
      cancelled: [], // Locked
    };

    const currentStatus = order.status;
    const validTargets = allowedTransitions[currentStatus] || [];

    if (!validTargets.includes(status)) {
      return NextResponse.json(
        {
          error: `Invalid status transition from "${currentStatus}" to "${status}". Allowed transitions: ${
            validTargets.length > 0 ? validTargets.join(', ') : 'None (Order is locked)'
          }`,
        },
        { status: 400 }
      );
    }

    let shouldDeductInventory = status === 'delivered' && !order.inventoryAdjusted;
    let shouldRestockInventory = (status === 'cancelled' || status === 'returned') && order.inventoryAdjusted;

    // Transaction for order update, packaging tagging, item quantity adjustment, and inventory changes
    await prisma.$transaction(async (tx) => {
      // Transitioning to 'packaged': handle packaging items and product quantity adjustments
      if (status === 'packaged') {
        // 1. If admin adjusted any product quantities in the modal
        if (Array.isArray(itemAdjustments) && itemAdjustments.length > 0) {
          for (const adj of itemAdjustments) {
            const existingItem = order.items.find((i) => i.id === adj.orderItemId);
            if (existingItem) {
              const newQty = Math.max(1, Number(adj.quantity) || 1);
              await tx.orderItem.update({
                where: { id: existingItem.id },
                data: { quantity: newQty },
              });
            }
          }
        }

        // 2. Attach packaging items, deduct packaging stock, and compute costs
        let packagingCostSum = 0;
        if (Array.isArray(packagingItems) && packagingItems.length > 0) {
          for (const pkg of packagingItems) {
            const pkgItem = await tx.packagingItem.findUnique({
              where: { id: pkg.packagingItemId },
            });
            if (pkgItem) {
              const pkgQty = Math.max(1, Number(pkg.quantity) || 1);
              const lineCost = pkgItem.unitPrice * pkgQty;
              packagingCostSum += lineCost;

              // Record on OrderPackagingItem
              await tx.orderPackagingItem.create({
                data: {
                  orderId: id,
                  packagingItemId: pkgItem.id,
                  quantity: pkgQty,
                  unitPrice: pkgItem.unitPrice,
                  totalCost: lineCost,
                },
              });

              // Deduct Packaging stock
              await tx.packagingItem.update({
                where: { id: pkgItem.id },
                data: {
                  quantity: { decrement: pkgQty },
                },
              });
            }
          }
        }

        // Re-fetch current items to compute wholesale product cost
        const currentItems = await tx.orderItem.findMany({ where: { orderId: id } });
        const productsWholesaleTotal = currentItems.reduce(
          (sum, item) => sum + (item.wholesaleCost || 0) * item.quantity,
          0
        );

        const totalCost = productsWholesaleTotal + packagingCostSum;

        await tx.order.update({
          where: { id },
          data: {
            status,
            totalCost,
          },
        });
      } else {
        // Normal status transitions
        // If delivering and not yet deducted, reduce product stock
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

        // If cancelled/returned and was deducted previously, restore stock
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

        // Update Order
        await tx.order.update({
          where: { id },
          data: {
            status,
            inventoryAdjusted: shouldDeductInventory ? true : shouldRestockInventory ? false : order.inventoryAdjusted,
          },
        });
      }
    });

    const updatedOrder = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        customer: true,
        packagingItems: { include: { packagingItem: true } },
      },
    });

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json({ error: error.message || 'Failed to update order status' }, { status: 500 });
  }
}
