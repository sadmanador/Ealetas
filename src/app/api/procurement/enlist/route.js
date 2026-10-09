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
      wholesaleCost,
      description,
      tags,
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
    const sellingPrice = Math.max(0, Number(retailPrice) || Number(body.price) || item.unitPrice * 2);
    const costPrice = wholesaleCost !== undefined && wholesaleCost !== '' ? Number(wholesaleCost) : item.unitPrice;

    // Common images: max 2
    let commonImageArray = [];
    if (Array.isArray(commonImages)) {
      commonImageArray = commonImages.slice(0, 2);
    } else if (typeof commonImages === 'string') {
      try {
        const parsed = JSON.parse(commonImages);
        commonImageArray = Array.isArray(parsed) ? parsed.slice(0, 2) : [commonImages];
      } catch (e) {
        commonImageArray = commonImages.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 2);
      }
    }

    // Determine variant list
    let variantList = [];
    if (Array.isArray(body.variants) && body.variants.length > 0) {
      variantList = body.variants;
    } else if (item.colorName) {
      variantList = [
        {
          colorName: item.colorName,
          colorCode: item.colorCode || '#0f388a',
          quantity: item.quantity,
          images: Array.isArray(images) ? images : [],
        },
      ];
    }

    // Determine overall product images
    let productImages = [];
    if (Array.isArray(images) && images.length > 0) {
      productImages = images;
    } else if (commonImageArray.length > 0) {
      productImages = commonImageArray;
    } else if (variantList.length > 0) {
      for (const v of variantList) {
        const vImgs = Array.isArray(v.images) ? v.images : [];
        if (vImgs.length > 0) {
          productImages.push(vImgs[0]);
          break;
        }
      }
    }
    if (productImages.length === 0) {
      productImages = ['https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80'];
    }

    // Total quantity
    let totalQty = Number(body.quantity) || item.quantity;
    if (variantList.length > 0) {
      const sumVariantQty = variantList.reduce((acc, v) => acc + (Number(v.quantity) || 0), 0);
      if (sumVariantQty > 0 || !body.quantity) {
        totalQty = sumVariantQty;
      }
    }

    const newProduct = await prisma.$transaction(async (tx) => {
      const created = await tx.product.create({
        data: {
          name: productName,
          slug: cleanSlug,
          description: description || `Fine handcrafted ${(category || item.category || 'jewelry').toLowerCase()} sourced with genuine quality materials.`,
          price: sellingPrice,
          wholesaleCost: costPrice,
          category: category || item.category || 'Rings',
          tags: tags || 'Procured,New Arrival',
          quantity: Math.max(0, totalQty),
          images: JSON.stringify(productImages),
          commonImages: JSON.stringify(commonImageArray),
          isFeatured: false,
        },
      });

      if (variantList.length > 0) {
        for (const v of variantList) {
          if (v.colorName && v.colorName.trim()) {
            let vImgs = [];
            if (Array.isArray(v.images)) {
              vImgs = v.images;
            } else if (typeof v.images === 'string') {
              try {
                vImgs = JSON.parse(v.images);
              } catch (e) {
                vImgs = [v.images];
              }
            }

            await tx.productVariant.create({
              data: {
                productId: created.id,
                colorName: v.colorName.trim(),
                colorCode: v.colorCode || null,
                quantity: Math.max(0, Number(v.quantity) || 0),
                images: JSON.stringify(vImgs),
              },
            });
          }
        }
      }

      await tx.procurementItem.update({
        where: { id: procurementItemId },
        data: {
          isEnlisted: true,
          productId: created.id,
        },
      });

      return await tx.product.findUnique({
        where: { id: created.id },
        include: { variants: true },
      });
    });

    return NextResponse.json({
      success: true,
      message: `Enlisted "${newProduct.name}" successfully into catalog with wholesale cost ৳${costPrice}!`,
      product: newProduct,
    });
  } catch (error) {
    console.error('Error enlisting procurement item:', error);
    return NextResponse.json({ error: 'Failed to enlist: ' + error.message }, { status: 500 });
  }
}
