import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const revalidate = 300;

export async function GET() {
  try {
    const settings = await prisma.siteSetting.findMany({
      where: { key: { in: ['site_name', 'site_tagline', 'contact_email', 'whatsapp_number', 'address', 'linkedin_url', 'github_url', 'twitter_url', 'logo_url', 'primary_color'] } },
      select: { key: true, value: true },
    });

    const settingsMap = settings.reduce((acc, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {} as Record<string, string>);

    return NextResponse.json({ data: settingsMap, success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
