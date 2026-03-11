import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { TestimonialSchema } from '@/lib/validations';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const item = await prisma.testimonial.findUnique({ where: { id: params.id } });
    if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ data: item, success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.user.role === 'VIEWER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const body = await req.json();
    const validated = TestimonialSchema.partial().parse(body);
    const item = await prisma.testimonial.update({ where: { id: params.id }, data: validated });

    await prisma.auditLog.create({
      data: { userId: session.user.id, userEmail: session.user.email, action: 'UPDATE', entity: 'Testimonial', entityId: item.id },
    });

    return NextResponse.json({ data: item, success: true });
  } catch (error: any) {
    if (error?.code === 'P2025') return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (error?.name === 'ZodError') return NextResponse.json({ error: error.errors }, { status: 422 });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.user.role === 'VIEWER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    await prisma.testimonial.delete({ where: { id: params.id } });
    await prisma.auditLog.create({
      data: { userId: session.user.id, userEmail: session.user.email, action: 'DELETE', entity: 'Testimonial', entityId: params.id },
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error?.code === 'P2025') return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
