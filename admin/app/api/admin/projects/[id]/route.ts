import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ProjectSchema } from '@/lib/validations';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const project = await prisma.project.findUnique({ where: { id: params.id } });
    if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ data: project, success: true });
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
    const validated = ProjectSchema.partial().parse(body);
    const project = await prisma.project.update({ where: { id: params.id }, data: validated });

    await prisma.auditLog.create({
      data: { userId: session.user.id, userEmail: session.user.email, action: 'UPDATE', entity: 'Project', entityId: project.id },
    });

    return NextResponse.json({ data: project, success: true });
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
    await prisma.project.delete({ where: { id: params.id } });
    await prisma.auditLog.create({
      data: { userId: session.user.id, userEmail: session.user.email, action: 'DELETE', entity: 'Project', entityId: params.id },
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error?.code === 'P2025') return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
