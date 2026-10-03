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
    const { name, description, price, wholesaleCost, category, tags, quantity, images } = body;

    if (!name || price === undefined) {
      return NextResponse.json({ error: 'Name and Price are required' }, { status: 400 });
    }

    // Limit to max 3 images as requested
    let imageArray = [];
    if (Array.isArray(images)) {
      imageArray = images.slice(0, 3);
    } else if (typeof images === 'string') {
      try {
        const parsed = JSON.parse(images);
        imageArray = Array.isArray(parsed) ? parsed.slice(0, 3) : [images];
      } catch (e) {
        imageArray = images.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 3);
      }
    }

    const slug = generateSlug(name);

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        slug,
        description: description || '',
        price: Number(price),
        wholesaleCost: Number(wholesaleCost) || 0,
        category: category || 'Rings',
        tags: tags || '',
        quantity: Math.max(0, Number(quantity) || 0),
        images: JSON.stringify(imageArray),
      },
    });

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
