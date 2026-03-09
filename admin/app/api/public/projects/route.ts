import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const revalidate = 60;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || undefined;
    const featured = searchParams.get('featured') === 'true' ? true : undefined;

    const where: any = { active: true };
    if (category) where.category = category.toUpperCase();
    if (featured !== undefined) where.featured = featured;

    const projects = await prisma.project.findMany({
      where,
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      select: { id: true, title: true, category: true, description: true, tech: true, imageUrl: true, imageAlt: true, featured: true, slug: true },
    });
    return NextResponse.json({ data: projects, success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
