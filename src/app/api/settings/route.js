import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = await prisma.storeSetting.findMany();
    const settingsMap = {};
    settings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    return NextResponse.json({
      insideDhakaDeliveryCharge: Number(settingsMap.insideDhakaDeliveryCharge || 80),
      outsideDhakaDeliveryCharge: Number(settingsMap.outsideDhakaDeliveryCharge || 120),
      smsAlertsEnabled: settingsMap.smsAlertsEnabled !== 'false',
      noticeBannerText: settingsMap.noticeBannerText || 'Timeless Beauty Inspired by the Treasures of the Sea ✦ Insured Delivery across Bangladesh (Dhaka ৳80 | Nationwide ৳120)',
      noticeBannerEnabled: settingsMap.noticeBannerEnabled !== 'false',
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({
      insideDhakaDeliveryCharge: 80,
      outsideDhakaDeliveryCharge: 120,
      smsAlertsEnabled: true,
      noticeBannerText: 'Timeless Beauty Inspired by the Treasures of the Sea ✦ Insured Delivery across Bangladesh (Dhaka ৳80 | Nationwide ৳120)',
      noticeBannerEnabled: true,
    });
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
      insideDhakaDeliveryCharge,
      outsideDhakaDeliveryCharge,
      smsAlertsEnabled,
      noticeBannerText,
      noticeBannerEnabled,
    } = body;

    const updates = [];
    if (insideDhakaDeliveryCharge !== undefined) {
      updates.push(
        prisma.storeSetting.upsert({
          where: { key: 'insideDhakaDeliveryCharge' },
          update: { value: String(insideDhakaDeliveryCharge) },
          create: { key: 'insideDhakaDeliveryCharge', value: String(insideDhakaDeliveryCharge) },
        })
      );
    }

    if (outsideDhakaDeliveryCharge !== undefined) {
      updates.push(
        prisma.storeSetting.upsert({
          where: { key: 'outsideDhakaDeliveryCharge' },
          update: { value: String(outsideDhakaDeliveryCharge) },
          create: { key: 'outsideDhakaDeliveryCharge', value: String(outsideDhakaDeliveryCharge) },
        })
      );
    }

    if (smsAlertsEnabled !== undefined) {
      updates.push(
        prisma.storeSetting.upsert({
          where: { key: 'smsAlertsEnabled' },
          update: { value: String(smsAlertsEnabled) },
          create: { key: 'smsAlertsEnabled', value: String(smsAlertsEnabled) },
        })
      );
    }

    if (noticeBannerText !== undefined) {
      updates.push(
        prisma.storeSetting.upsert({
          where: { key: 'noticeBannerText' },
          update: { value: String(noticeBannerText) },
          create: { key: 'noticeBannerText', value: String(noticeBannerText) },
        })
      );
    }

    if (noticeBannerEnabled !== undefined) {
      updates.push(
        prisma.storeSetting.upsert({
          where: { key: 'noticeBannerEnabled' },
          update: { value: String(noticeBannerEnabled) },
          create: { key: 'noticeBannerEnabled', value: String(noticeBannerEnabled) },
        })
      );
    }

    await prisma.$transaction(updates);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
