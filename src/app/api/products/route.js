import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function generateSlug(name) {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') +
      '-' +
      Math.random().toString(36).substring(2, 6)
  );
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');

    let whereClause = {};
    if (category && category !== 'All') {
      whereClause.category = category;
    }
    if (featured === 'true') {
      whereClause.isFeatured = true;
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        variants: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
      variants = [],
    } = body;

    if (!name || price === undefined) {
      return NextResponse.json({ error: 'Name and Price are required' }, { status: 400 });
    }

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

    // Legacy/preview images
    let imageArray = [];
    if (Array.isArray(images) && images.length > 0) {
      imageArray = images;
    } else if (commonImageArray.length > 0) {
      imageArray = commonImageArray;
    } else if (variants.length > 0) {
      // Pick first variant's first image if available
      for (const v of variants) {
        let vImgs = [];
        try {
          vImgs = Array.isArray(v.images) ? v.images : JSON.parse(v.images || '[]');
        } catch (e) {
          vImgs = [];
        }
        if (vImgs.length > 0) {
          imageArray.push(vImgs[0]);
          break;
        }
      }
    }

    // Calculate total quantity across color variants if provided, otherwise base quantity
    let totalQty = Number(quantity) || 0;
    if (Array.isArray(variants) && variants.length > 0) {
      const sumVariantQty = variants.reduce((acc, v) => acc + (Number(v.quantity) || 0), 0);
      if (sumVariantQty > 0 || totalQty === 0) {
        totalQty = sumVariantQty;
      }
    }

    const slug = generateSlug(name);

    const product = await prisma.$transaction(async (tx) => {
      const created = await tx.product.create({
        data: {
          name: name.trim(),
          slug,
          description: description || '',
          price: Number(price),
          wholesaleCost: Number(wholesaleCost) || 0,
          category: category || 'Rings',
          tags: tags || '',
          quantity: Math.max(0, totalQty),
          images: JSON.stringify(imageArray),
          commonImages: JSON.stringify(commonImageArray),
        },
      });

      if (Array.isArray(variants) && variants.length > 0) {
        for (const v of variants) {
          if (v.colorName && v.colorName.trim()) {
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
                productId: created.id,
                colorName: v.colorName.trim(),
                colorCode: v.colorCode || null,
                quantity: Math.max(0, Number(v.quantity) || 0),
                images: JSON.stringify(vImages),
              },
            });
          }
        }
      }

      return await tx.product.findUnique({
        where: { id: created.id },
        include: { variants: true },
      });
    });

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
