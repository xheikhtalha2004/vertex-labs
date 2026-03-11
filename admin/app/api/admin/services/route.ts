import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ServiceSchema } from '@/lib/validations';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const [services, total] = await Promise.all([
      prisma.service.findMany({ orderBy: { order: 'asc' }, skip, take: limit }),
      prisma.service.count(),
    ]);

    return NextResponse.json({ data: services, total, page, limit, success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.user.role === 'VIEWER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const body = await req.json();
    const validated = ServiceSchema.parse(body);
    const service = await prisma.service.create({ data: validated });

    await prisma.auditLog.create({
      data: { userId: session.user.id, userEmail: session.user.email, action: 'CREATE', entity: 'Service', entityId: service.id },
    });

    return NextResponse.json({ data: service, success: true }, { status: 201 });
  } catch (error: any) {
    if (error?.name === 'ZodError') return NextResponse.json({ error: error.errors }, { status: 422 });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
