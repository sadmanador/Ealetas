import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      procurementItemId,
      existingProductId, // if linking to existing product to restock
      name,
      category,
      retailPrice,
      description,
      commonImages,
      images,
    } = body;

    if (!procurementItemId) {
      return NextResponse.json({ error: 'procurementItemId is required' }, { status: 400 });
    }

    const item = await prisma.procurementItem.findUnique({
      where: { id: procurementItemId },
      include: { procurementLog: true },
    });

    if (!item) {
      return NextResponse.json({ error: 'Procurement item not found' }, { status: 404 });
    }

    // 1. Restock an existing product
    if (existingProductId) {
      const existingProduct = await prisma.product.findUnique({
        where: { id: existingProductId },
        include: { variants: true },
      });

      if (!existingProduct) {
        return NextResponse.json({ error: 'Existing product not found' }, { status: 404 });
      }

      let matchedVariant = null;
      if (item.colorName) {
        matchedVariant = existingProduct.variants.find(
          (v) => v.colorName.toLowerCase() === item.colorName.toLowerCase()
        );
      }

      if (matchedVariant) {
        // Restock variant quantity
        await prisma.productVariant.update({
          where: { id: matchedVariant.id },
          data: {
            quantity: { increment: item.quantity },
          },
        });
      }

      // Restock overall product quantity
      const updatedProduct = await prisma.product.update({
        where: { id: existingProduct.id },
        data: {
          quantity: { increment: item.quantity },
          wholesaleCost: item.unitPrice, // update to latest procured wholesale cost
        },
      });

      // Mark procurement item as enlisted
      await prisma.procurementItem.update({
        where: { id: procurementItemId },
        data: {
          isEnlisted: true,
          productId: existingProduct.id,
          productVariantId: matchedVariant ? matchedVariant.id : null,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Restocked ${item.quantity} units to "${existingProduct.name}"`,
        product: updatedProduct,
      });
    }

    // 2. Enlist as a brand NEW product
    const productName = (name || item.name).trim();
    const cleanSlug = `${productName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`;
    const sellingPrice = Math.max(0, Number(retailPrice) || item.unitPrice * 2); // default 2x markup if not given

    const parsedImages = images && Array.isArray(images) && images.length > 0
      ? JSON.stringify(images)
      : JSON.stringify(['https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80']);

    const parsedCommonImages = commonImages && Array.isArray(commonImages)
      ? JSON.stringify(commonImages)
      : '[]';

    const newProduct = await prisma.product.create({
      data: {
        name: productName,
        slug: cleanSlug,
        description: description || `Fine handcrafted ${item.category.toLowerCase()} sourced with genuine quality materials.`,
        price: sellingPrice,
        wholesaleCost: item.unitPrice, // AUTO-INHERITED from procurement!
        category: category || item.category || 'Jewelry',
        tags: tags || 'Procured,New Arrival',
        quantity: item.quantity,
        images: parsedImages,
        commonImages: parsedCommonImages,
        isFeatured: false,
        variants: item.colorName
          ? {
              create: [
                {
                  colorName: item.colorName,
                  colorCode: item.colorCode || '#0f388a',
                  quantity: item.quantity,
                  images: parsedImages,
                },
              ],
            }
          : undefined,
      },
      include: {
        variants: true,
      },
    });

    // Mark procurement item as enlisted
    await prisma.procurementItem.update({
      where: { id: procurementItemId },
      data: {
        isEnlisted: true,
        productId: newProduct.id,
        productVariantId: newProduct.variants && newProduct.variants.length > 0 ? newProduct.variants[0].id : null,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Enlisted "${newProduct.name}" successfully into catalog with auto-inherited wholesale cost ৳${item.unitPrice}!`,
      product: newProduct,
    });
  } catch (error) {
    console.error('Error enlisting procurement item:', error);
    return NextResponse.json({ error: 'Failed to enlist: ' + error.message }, { status: 500 });
  }
}
