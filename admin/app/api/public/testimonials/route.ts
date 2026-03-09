import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const revalidate = 60;

export async function GET() {
  try {
    const testimonials = await prisma.testimonial.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
      select: { id: true, quote: true, authorName: true, authorRole: true, authorOrg: true, authorAvatar: true, rating: true, featured: true },
    });
    return NextResponse.json({ data: testimonials, success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
