import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const revalidate = 60; // ISR: revalidate every 60s

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
      select: { id: true, title: true, description: true, icon: true, features: true, order: true },
    });
    return NextResponse.json({ data: services, success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
