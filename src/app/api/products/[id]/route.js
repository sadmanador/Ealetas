import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const {
      name,
      description,
      price,
      wholesaleCost,
      category,
      tags,
      quantity,
      images,
      commonImages,
      variants,
    } = body;

    let commonImageArray = [];
    if (commonImages !== undefined) {
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
    }

    let imageArray = [];
    if (images !== undefined) {
      if (Array.isArray(images)) {
        imageArray = images;
      } else if (typeof images === 'string') {
        try {
          const parsed = JSON.parse(images);
          imageArray = Array.isArray(parsed) ? parsed : [images];
        } catch (e) {
          imageArray = images.split(',').map((s) => s.trim()).filter(Boolean);
        }
      }
    }

    const updated = await prisma.$transaction(async (tx) => {
      // If variants are supplied, compute total quantity
      let finalQuantity = quantity !== undefined ? Math.max(0, Number(quantity)) : undefined;

      if (Array.isArray(variants)) {
        // Replace or update variants
        await tx.productVariant.deleteMany({
          where: { productId: id },
        });

        let sumVariantQty = 0;
        for (const v of variants) {
          if (v.colorName && v.colorName.trim()) {
            const vQty = Math.max(0, Number(v.quantity) || 0);
            sumVariantQty += vQty;

            let vImages = [];
            if (Array.isArray(v.images)) {
              vImages = v.images;
            } else if (typeof v.images === 'string') {
              try {
                vImages = JSON.parse(v.images);
              } catch (e) {
                vImages = [v.images];
              }
            }

            await tx.productVariant.create({
              data: {
                productId: id,
                colorName: v.colorName.trim(),
                colorCode: v.colorCode || null,
                quantity: vQty,
                images: JSON.stringify(vImages),
              },
            });
          }
        }
        if (variants.length > 0) {
          finalQuantity = sumVariantQty;
        }
      }

      await tx.product.update({
        where: { id },
        data: {
          ...(name ? { name: name.trim() } : {}),
          ...(description !== undefined ? { description } : {}),
          ...(price !== undefined ? { price: Number(price) } : {}),
          ...(wholesaleCost !== undefined ? { wholesaleCost: Number(wholesaleCost) } : {}),
          ...(category ? { category } : {}),
          ...(tags !== undefined ? { tags } : {}),
          ...(finalQuantity !== undefined ? { quantity: finalQuantity } : {}),
          ...(images !== undefined ? { images: JSON.stringify(imageArray) } : {}),
          ...(commonImages !== undefined ? { commonImages: JSON.stringify(commonImageArray) } : {}),
        },
      });

      return await tx.product.findUnique({
        where: { id },
        include: { variants: true },
      });
    });

    return NextResponse.json({ success: true, product: updated });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
