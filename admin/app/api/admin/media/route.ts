import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { uploadToCloudinary } from '@/lib/cloudinary';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '24');
    const type = searchParams.get('type') || undefined;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (type) where.type = type.toUpperCase();

    const [media, total] = await Promise.all([
      prisma.media.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit }),
      prisma.media.count({ where }),
    ]);

    return NextResponse.json({ data: media, total, page, limit, success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.user.role === 'VIEWER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const folder = (formData.get('folder') as string) || 'vertex-labs';
    const altText = (formData.get('altText') as string) || '';

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 413 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploaded = await uploadToCloudinary(buffer, folder);

    const mimeType = file.type;
    const type = mimeType.startsWith('image/') ? 'IMAGE'
      : mimeType.startsWith('video/') ? 'VIDEO'
        : mimeType.includes('pdf') || mimeType.includes('document') ? 'DOCUMENT'
          : 'OTHER';

    const media = await prisma.media.create({
      data: {
        filename: file.name,
        url: uploaded.url,
        publicId: uploaded.publicId,
        type: type as any,
        mimeType,
        sizeBytes: uploaded.sizeBytes,
        width: uploaded.width || undefined,
        height: uploaded.height || undefined,
        altText: altText || undefined,
        folder,
        uploadedBy: session.user.email,
      },
    });

    return NextResponse.json({ data: media, success: true }, { status: 201 });
  } catch (error: any) {
    console.error('Media upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
