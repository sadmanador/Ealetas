import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = await prisma.adminUser.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, name: true, phone: true, role: true },
    });

    return NextResponse.json({ admin });
  } catch (error) {
    console.error('Error fetching admin profile:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone, currentPassword, newPassword } = body;

    const admin = await prisma.adminUser.findUnique({
      where: { id: session.user.id },
    });

    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }

    let updatedData = {};
    if (name) updatedData.name = name.trim();
    if (phone) updatedData.phone = phone.trim();

    // If changing password, verify current password first
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'Current password required' }, { status: 400 });
      }
      const match = await bcrypt.compare(currentPassword, admin.password);
      if (!match) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
      }
      updatedData.password = await bcrypt.hash(newPassword, 10);
    }

    const updatedAdmin = await prisma.adminUser.update({
      where: { id: session.user.id },
      data: updatedData,
      select: { id: true, email: true, name: true, phone: true, role: true },
    });

    return NextResponse.json({ success: true, admin: updatedAdmin });
  } catch (error) {
    console.error('Error updating admin profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
