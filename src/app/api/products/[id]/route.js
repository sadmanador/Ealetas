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
    const { name, description, price, wholesaleCost, category, tags, quantity, images } = body;

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

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(name ? { name: name.trim() } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(price !== undefined ? { price: Number(price) } : {}),
        ...(wholesaleCost !== undefined ? { wholesaleCost: Number(wholesaleCost) } : {}),
        ...(category ? { category } : {}),
        ...(tags !== undefined ? { tags } : {}),
        ...(quantity !== undefined ? { quantity: Math.max(0, Number(quantity)) } : {}),
        ...(images !== undefined ? { images: JSON.stringify(imageArray) } : {}),
      },
    });

    return NextResponse.json({ success: true, product });
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
