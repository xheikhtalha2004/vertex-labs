import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { CreateUserSchema, UpdateUserSchema } from '@/lib/validations';
import bcrypt from 'bcryptjs';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, avatar: true, lastLoginAt: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json({ data: users, success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const body = await req.json();
    const validated = CreateUserSchema.parse(body);

    const existing = await prisma.user.findUnique({ where: { email: validated.email.toLowerCase() } });
    if (existing) return NextResponse.json({ error: 'Email already in use' }, { status: 409 });

    const passwordHash = await bcrypt.hash(validated.password, 12);
    const user = await prisma.user.create({
      data: { email: validated.email.toLowerCase(), name: validated.name, passwordHash, role: validated.role },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });

    await prisma.auditLog.create({
      data: { userId: session.user.id, userEmail: session.user.email, action: 'CREATE', entity: 'User', entityId: user.id },
    });

    return NextResponse.json({ data: user, success: true }, { status: 201 });
  } catch (error: any) {
    if (error?.name === 'ZodError') return NextResponse.json({ error: error.errors }, { status: 422 });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
