import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { notifyAdminsNewOrder } from '@/lib/sms';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      phone,
      name,
      division,
      district,
      upazila,
      fullAddress,
      isDhakaCityCorp,
      items,
      notes,
    } = body;

    if (!phone || !name || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required customer or order details' },
        { status: 400 }
      );
    }

    // 1. Fetch current delivery settings
    const settings = await prisma.storeSetting.findMany({
      where: {
        key: { in: ['insideDhakaDeliveryCharge', 'outsideDhakaDeliveryCharge'] },
      },
    });

    const insideCharge = Number(
      settings.find((s) => s.key === 'insideDhakaDeliveryCharge')?.value || 80
    );
    const outsideCharge = Number(
      settings.find((s) => s.key === 'outsideDhakaDeliveryCharge')?.value || 120
    );

    const deliveryCharge = isDhakaCityCorp ? insideCharge : outsideCharge;

    // 2. Fetch products to calculate genuine subtotal and capture snapshots
    const productIds = items.map((i) => i.productId);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    let subtotal = 0;
    const orderItemsData = [];

    for (const item of items) {
      const product = dbProducts.find((p) => p.id === item.productId);
      if (!product) {
        return NextResponse.json(
          { error: `Product not found: ${item.productId}` },
          { status: 400 }
        );
      }

      const itemQty = Math.max(1, Number(item.quantity) || 1);
      const itemPrice = product.price;
      subtotal += itemPrice * itemQty;

      let firstImg = '';
      try {
        const parsed = JSON.parse(product.images);
        firstImg = Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : '';
      } catch (e) {
        firstImg = '';
      }

      orderItemsData.push({
        productId: product.id,
        productName: product.name,
        productImage: firstImg,
        price: itemPrice,
        wholesaleCost: product.wholesaleCost || 0,
        quantity: itemQty,
      });
    }

    const totalAmount = subtotal + deliveryCharge;

    // 3. Upsert Customer Record
    const cleanPhone = phone.trim();
    let customer = await prisma.customer.findUnique({
      where: { phone: cleanPhone },
    });

    if (customer) {
      customer = await prisma.customer.update({
        where: { id: customer.id },
        data: {
          name: name.trim(),
          division: division || customer.division,
          district: district || customer.district,
          upazila: upazila || customer.upazila,
          fullAddress: fullAddress || customer.fullAddress,
        },
      });
    } else {
      customer = await prisma.customer.create({
        data: {
          phone: cleanPhone,
          name: name.trim(),
          division: division || '',
          district: district || '',
          upazila: upazila || '',
          fullAddress: fullAddress || '',
        },
      });
    }

    // 4. Generate Unique Order Number
    const orderNumber = `ELT-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    // 5. Create Order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId: customer.id,
        customerName: name.trim(),
        customerPhone: cleanPhone,
        status: 'pending',
        subtotal,
        deliveryCharge,
        totalAmount,
        isDhakaCityCorp: Boolean(isDhakaCityCorp),
        deliveryAddress: `${fullAddress || ''}, ${upazila || ''}, ${district || ''}, ${division || ''}`.replace(/(, )+/g, ', ').trim(),
        notes: notes || null,
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: true,
      },
    });

    // 6. Notify Admins via BulkSMSBD asynchronously
    notifyAdminsNewOrder({
      prisma,
      orderNumber,
      totalAmount,
      customerName: name.trim(),
      customerPhone: cleanPhone,
    }).catch((err) => {
      console.error('Failed to notify admins via SMS:', err);
    });

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        subtotal: order.subtotal,
        deliveryCharge: order.deliveryCharge,
        totalAmount: order.totalAmount,
        status: order.status,
      },
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to place order. ' + error.message },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const range = searchParams.get('range'); // 'today', 'week', 'month', or specific date 'YYYY-MM-DD'

    let whereClause = {};

    if (status && status !== 'all') {
      whereClause.status = status;
    }

    if (range) {
      const now = new Date();
      if (range === 'today') {
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        whereClause.createdAt = { gte: start };
      } else if (range === 'week') {
        const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        whereClause.createdAt = { gte: start };
      } else if (range === 'month') {
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        whereClause.createdAt = { gte: start };
      } else if (/^\d{4}-\d{2}-\d{2}$/.test(range)) {
        const start = new Date(`${range}T00:00:00.000Z`);
        const end = new Date(`${range}T23:59:59.999Z`);
        whereClause.createdAt = { gte: start, lte: end };
      }
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        items: true,
        customer: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
