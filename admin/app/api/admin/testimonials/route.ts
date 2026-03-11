import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { TestimonialSchema } from '@/lib/validations';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const [testimonials, total] = await Promise.all([
      prisma.testimonial.findMany({ orderBy: { order: 'asc' }, skip, take: limit }),
      prisma.testimonial.count(),
    ]);

    return NextResponse.json({ data: testimonials, total, page, limit, success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.user.role === 'VIEWER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const body = await req.json();
    const validated = TestimonialSchema.parse(body);
    const testimonial = await prisma.testimonial.create({ data: validated });

    await prisma.auditLog.create({
      data: { userId: session.user.id, userEmail: session.user.email, action: 'CREATE', entity: 'Testimonial', entityId: testimonial.id },
    });

    return NextResponse.json({ data: testimonial, success: true }, { status: 201 });
  } catch (error: any) {
    if (error?.name === 'ZodError') return NextResponse.json({ error: error.errors }, { status: 422 });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
