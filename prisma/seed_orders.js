import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Generating realistic fake orders across all statuses...');

  // 1. Fetch available products & packaging items
  const products = await prisma.product.findMany({
    include: { variants: true },
  });

  if (products.length === 0) {
    console.error('No products found in DB. Please make sure products are seeded first.');
    return;
  }

  const packagingItems = await prisma.packagingItem.findMany();

  // 2. Realistic customers
  const sampleCustomers = [
    {
      phone: '01711223344',
      name: 'Nusrat Jahan',
      division: 'Dhaka',
      district: 'Dhaka',
      upazila: 'Gulshan',
      fullAddress: 'House 14, Road 103, Block C, Gulshan-2',
      isBlacklisted: false,
      isFraudRisk: false,
    },
    {
      phone: '01819876543',
      name: 'Tahmina Akter',
      division: 'Dhaka',
      district: 'Dhaka',
      upazila: 'Dhanmondi',
      fullAddress: 'Apartment 4B, Road 8/A, Dhanmondi',
      isBlacklisted: false,
      isFraudRisk: false,
    },
    {
      phone: '01912345678',
      name: 'Sadia Islam',
      division: 'Chittagong',
      district: 'Chittagong',
      upazila: 'Panchlaish',
      fullAddress: 'Plot 45, Nasirabad Housing Society, Panchlaish',
      isBlacklisted: false,
      isFraudRisk: false,
    },
    {
      phone: '01678901234',
      name: 'Mehnaz Chowdhury',
      division: 'Sylhet',
      district: 'Sylhet',
      upazila: 'Sylhet Sadar',
      fullAddress: 'B-7 Kumarpara, Sylhet',
      isBlacklisted: false,
      isFraudRisk: false,
    },
    {
      phone: '01555667788',
      name: 'Ayesha Siddiqua',
      division: 'Dhaka',
      district: 'Dhaka',
      upazila: 'Uttara',
      fullAddress: 'Sector 4, Road 12, House 29, Uttara',
      isBlacklisted: false,
      isFraudRisk: false,
    },
    {
      phone: '01799887766',
      name: 'Farzana Karim',
      division: 'Rajshahi',
      district: 'Rajshahi',
      upazila: 'Boalia',
      fullAddress: 'Alupatti More, Boalia, Rajshahi',
      isBlacklisted: false,
      isFraudRisk: true,
      fraudNotes: 'Failed parcel collection twice previously. Flagged for verification call.',
    },
    {
      phone: '01300112233',
      name: 'Zareen Rahman',
      division: 'Dhaka',
      district: 'Dhaka',
      upazila: 'Banani',
      fullAddress: 'Road 11, Block D, Banani',
      isBlacklisted: false,
      isFraudRisk: false,
    },
    {
      phone: '01888990011',
      name: 'Sabrina Hossain',
      division: 'Dhaka',
      district: 'Narayanganj',
      upazila: 'Narayanganj Sadar',
      fullAddress: 'Chashara Central Road, Narayanganj',
      isBlacklisted: false,
      isFraudRisk: false,
    },
  ];

  // Upsert customers
  const dbCustomers = [];
  for (const c of sampleCustomers) {
    const cust = await prisma.customer.upsert({
      where: { phone: c.phone },
      update: c,
      create: c,
    });
    dbCustomers.push(cust);
  }

  // 3. Define 8 realistic orders covering every state: pending, confirmed, packaged, in_transit, delivered, cancelled, returned
  const orderBlueprints = [
    {
      customerIndex: 0,
      status: 'pending',
      isDhakaCityCorp: true,
      deliveryCharge: 80,
      productIndices: [0], // 1 item
      notes: 'Please ring bell twice upon arrival',
      createdDaysAgo: 0,
    },
    {
      customerIndex: 1,
      status: 'confirmed',
      isDhakaCityCorp: true,
      deliveryCharge: 80,
      productIndices: [1, 2], // 2 items
      notes: 'Gift wrapping requested if possible',
      createdDaysAgo: 1,
    },
    {
      customerIndex: 2,
      status: 'packaged',
      isDhakaCityCorp: false,
      deliveryCharge: 120,
      productIndices: [0, 3 % products.length],
      notes: 'Ready for courier collection',
      createdDaysAgo: 2,
      attachPackaging: true,
    },
    {
      customerIndex: 3,
      status: 'in_transit',
      isDhakaCityCorp: false,
      deliveryCharge: 120,
      productIndices: [2],
      notes: 'Paperfly tracking parcel booked',
      createdDaysAgo: 3,
      attachPackaging: true,
    },
    {
      customerIndex: 4,
      status: 'delivered',
      isDhakaCityCorp: true,
      deliveryCharge: 80,
      productIndices: [1, 0],
      notes: 'Customer loved the packaging! Cash on delivery received.',
      createdDaysAgo: 5,
      attachPackaging: true,
      inventoryAdjusted: true,
    },
    {
      customerIndex: 5,
      status: 'delivered',
      isDhakaCityCorp: false,
      deliveryCharge: 120,
      productIndices: [2 % products.length],
      notes: 'Successfully delivered by Steadfast courier',
      createdDaysAgo: 7,
      attachPackaging: true,
      inventoryAdjusted: true,
    },
    {
      customerIndex: 6,
      status: 'returned',
      isDhakaCityCorp: true,
      deliveryCharge: 80,
      productIndices: [1],
      notes: 'Customer was out of country during delivery window. Parcel returned.',
      createdDaysAgo: 4,
      attachPackaging: true,
      inventoryAdjusted: false,
    },
    {
      customerIndex: 7,
      status: 'cancelled',
      isDhakaCityCorp: false,
      deliveryCharge: 120,
      productIndices: [0],
      notes: 'Customer cancelled prior to dispatch',
      createdDaysAgo: 2,
      inventoryAdjusted: false,
    },
  ];

  for (let idx = 0; idx < orderBlueprints.length; idx++) {
    const bp = orderBlueprints[idx];
    const customer = dbCustomers[bp.customerIndex];
    const orderNumber = `ELT-ORD-${1000 + idx + 1}`;

    // Prepare items
    let subtotal = 0;
    let productsWholesaleSum = 0;
    const orderItems = [];

    for (const pIdx of bp.productIndices) {
      const prod = products[pIdx % products.length];
      const variant = prod.variants && prod.variants.length > 0 ? prod.variants[0] : null;
      const qty = 1;

      subtotal += prod.price * qty;
      productsWholesaleSum += (prod.wholesaleCost || 0) * qty;

      let firstImg = '';
      try {
        const parsed = JSON.parse(prod.images);
        firstImg = Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : '';
      } catch (e) {
        firstImg = '';
      }

      orderItems.push({
        productId: prod.id,
        productVariantId: variant ? variant.id : null,
        productName: prod.name,
        colorVariantName: variant ? variant.colorName : null,
        productImage: firstImg,
        price: prod.price,
        wholesaleCost: prod.wholesaleCost || 0,
        quantity: qty,
      });
    }

    const totalAmount = subtotal + bp.deliveryCharge;

    // Attach packaging if needed
    let packagingCostSum = 0;
    const orderPackagingData = [];
    if (bp.attachPackaging && packagingItems.length > 0) {
      const pkg = packagingItems[0];
      const pkgCost = pkg.unitPrice * 1;
      packagingCostSum += pkgCost;
      orderPackagingData.push({
        packagingItemId: pkg.id,
        quantity: 1,
        unitPrice: pkg.unitPrice,
        totalCost: pkgCost,
      });
    }

    const totalCost = productsWholesaleSum + packagingCostSum;

    // Create or update order
    const existing = await prisma.order.findUnique({
      where: { orderNumber },
    });

    const createdAtDate = new Date();
    createdAtDate.setDate(createdAtDate.getDate() - bp.createdDaysAgo);

    if (existing) {
      await prisma.order.delete({ where: { id: existing.id } });
    }

    await prisma.order.create({
      data: {
        orderNumber,
        customerId: customer.id,
        customerName: customer.name,
        customerPhone: customer.phone,
        status: bp.status,
        subtotal,
        deliveryCharge: bp.deliveryCharge,
        totalAmount,
        totalCost,
        isDhakaCityCorp: bp.isDhakaCityCorp,
        deliveryAddress: `${customer.fullAddress}, ${customer.upazila}, ${customer.district}`,
        notes: bp.notes,
        inventoryAdjusted: bp.inventoryAdjusted || false,
        createdAt: createdAtDate,
        items: {
          create: orderItems,
        },
        packagingItems: {
          create: orderPackagingData,
        },
      },
    });

    console.log(`✓ Created Order #${orderNumber} [${bp.status.toUpperCase()}] for ${customer.name}`);
  }

  console.log('🎉 Successfully seeded fake orders covering all pipeline states!');
}

main()
  .catch((e) => {
    console.error('Error seeding orders:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
