import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { deleteFromCloudinary } from '@/lib/cloudinary';

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.user.role === 'VIEWER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const media = await prisma.media.findUnique({ where: { id: params.id } });
    if (!media) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Delete from Cloudinary
    await deleteFromCloudinary(media.publicId);

    // Delete from DB
    await prisma.media.delete({ where: { id: params.id } });

    await prisma.auditLog.create({
      data: { userId: session.user.id, userEmail: session.user.email, action: 'DELETE', entity: 'Media', entityId: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error?.code === 'P2025') return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.user.role === 'VIEWER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const body = await req.json();
    const media = await prisma.media.update({
      where: { id: params.id },
      data: { altText: body.altText },
    });
    return NextResponse.json({ data: media, success: true });
  } catch (error: any) {
    if (error?.code === 'P2025') return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
