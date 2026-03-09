import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { HomepageSettingsSchema } from '@/lib/validations';

export async function GET() {
  try {
    let settings = await prisma.homepageSettings.findFirst();
    if (!settings) {
      settings = await prisma.homepageSettings.create({ data: {} });
    }
    return NextResponse.json({ data: settings, success: true });
  } catch (error) {
    console.error('GET /api/admin/homepage error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.user.role === 'VIEWER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const body = await req.json();
    const validated = HomepageSettingsSchema.parse(body);

    let settings = await prisma.homepageSettings.findFirst();
    if (settings) {
      settings = await prisma.homepageSettings.update({ where: { id: settings.id }, data: validated });
    } else {
      settings = await prisma.homepageSettings.create({ data: validated });
    }

    await prisma.auditLog.create({
      data: { userId: session.user.id, userEmail: session.user.email, action: 'UPDATE', entity: 'HomepageSettings', entityId: settings.id },
    });

    return NextResponse.json({ data: settings, success: true });
  } catch (error: any) {
    if (error?.name === 'ZodError') return NextResponse.json({ error: error.errors }, { status: 422 });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
