import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { SeoMetaSchema } from '@/lib/validations';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const seoPages = await prisma.seoMeta.findMany({ orderBy: { pageSlug: 'asc' } });
    return NextResponse.json({ data: seoPages, success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.user.role === 'VIEWER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const body = await req.json();
    const validated = SeoMetaSchema.parse(body);

    const seo = await prisma.seoMeta.upsert({
      where: { pageSlug: validated.pageSlug },
      update: validated,
      create: validated,
    });

    await prisma.auditLog.create({
      data: { userId: session.user.id, userEmail: session.user.email, action: 'UPDATE', entity: 'SeoMeta', entityId: seo.id },
    });

    return NextResponse.json({ data: seo, success: true });
  } catch (error: any) {
    if (error?.name === 'ZodError') return NextResponse.json({ error: error.errors }, { status: 422 });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
