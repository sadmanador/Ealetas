import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { formatBangladeshiNumber } from '@/lib/sms';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawPhone = searchParams.get('phone');

    if (!rawPhone || rawPhone.trim().length < 8) {
      return NextResponse.json({ customer: null });
    }

    const cleanInput = rawPhone.trim().replace(/[^0-9]/g, '');
    const standardNumber = formatBangladeshiNumber(cleanInput);

    // Look for customer by phone, either exact, standard (880...) or local (01...)
    const customer = await prisma.customer.findFirst({
      where: {
        OR: [
          { phone: cleanInput },
          { phone: standardNumber },
          { phone: { endsWith: cleanInput.slice(-10) } },
        ],
      },
      select: {
        id: true,
        phone: true,
        name: true,
        division: true,
        district: true,
        upazila: true,
        fullAddress: true,
      },
    });

    return NextResponse.json({ customer: customer || null });
  } catch (error) {
    console.error('Error looking up customer:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
