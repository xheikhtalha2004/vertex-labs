import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const revalidate = 120;

export async function GET() {
  try {
    let settings = await prisma.homepageSettings.findFirst();
    if (!settings) {
      settings = await prisma.homepageSettings.create({ data: {} });
    }
    // Don't expose internal ID
    const { id: _, updatedAt: __, ...publicSettings } = settings;
    return NextResponse.json({ data: publicSettings, success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
