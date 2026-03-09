import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { BulkSiteSettingsSchema } from '@/lib/validations';

// Default site settings keys seeded on first load
const DEFAULT_SETTINGS = [
  { key: 'site_name', value: 'Vertex Labs', label: 'Site Name', group: 'general' },
  { key: 'site_tagline', value: 'Engineering Solvency at Scale', label: 'Tagline', group: 'general' },
  { key: 'contact_email', value: 'business.vertexlabs@gmail.com', label: 'Contact Email', group: 'contact' },
  { key: 'whatsapp_number', value: '+923135229867', label: 'WhatsApp Number', group: 'contact' },
  { key: 'address', value: 'Manchester, United Kingdom', label: 'Office Address', group: 'contact' },
  { key: 'linkedin_url', value: '', label: 'LinkedIn URL', group: 'social' },
  { key: 'github_url', value: '', label: 'GitHub URL', group: 'social' },
  { key: 'twitter_url', value: '', label: 'Twitter URL', group: 'social' },
  { key: 'logo_url', value: '', label: 'Logo URL', group: 'appearance' },
  { key: 'favicon_url', value: '', label: 'Favicon URL', group: 'appearance' },
  { key: 'primary_color', value: '#4F6DF5', label: 'Brand Color', group: 'appearance' },
];

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    let settings = await prisma.siteSetting.findMany({ orderBy: { group: 'asc' } });

    // Seed defaults if none exist
    if (settings.length === 0) {
      await prisma.siteSetting.createMany({
        data: DEFAULT_SETTINGS.map((s) => ({ ...s, type: 'string' })),
        skipDuplicates: true,
      });
      settings = await prisma.siteSetting.findMany({ orderBy: { group: 'asc' } });
    }

    return NextResponse.json({ data: settings, success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden — ADMIN only' }, { status: 403 });

  try {
    const body = await req.json();
    const validated = BulkSiteSettingsSchema.parse(body);

    await Promise.all(
      validated.map(({ key, value }) =>
        prisma.siteSetting.upsert({
          where: { key },
          update: { value },
          create: { key, value, type: 'string' },
        })
      )
    );

    const updated = await prisma.siteSetting.findMany({ orderBy: { group: 'asc' } });

    await prisma.auditLog.create({
      data: { userId: session.user.id, userEmail: session.user.email, action: 'UPDATE', entity: 'SiteSettings', metadata: { keys: validated.map((v) => v.key) } },
    });

    return NextResponse.json({ data: updated, success: true });
  } catch (error: any) {
    if (error?.name === 'ZodError') return NextResponse.json({ error: error.errors }, { status: 422 });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
