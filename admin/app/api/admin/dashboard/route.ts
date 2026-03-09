import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { CreateLeadSchema } from '@/lib/validations';

// Public endpoint — receives contact form submissions
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = CreateLeadSchema.parse(body);

    const lead = await prisma.lead.create({
      data: { ...validated, source: 'contact_form' },
    });

    return NextResponse.json({ data: { id: lead.id }, success: true, message: 'Your message has been received.' }, { status: 201 });
  } catch (error: any) {
    if (error?.name === 'ZodError') return NextResponse.json({ error: error.errors }, { status: 422 });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Admin — dashboard stats aggregation
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const [
      totalLeads, newLeads, totalProjects, totalServices, totalTestimonials, totalMedia,
      recentLeads, recentAuditLogs,
    ] = await Promise.all([
      prisma.lead.count(),
      prisma.lead.count({ where: { status: 'NEW' } }),
      prisma.project.count({ where: { active: true } }),
      prisma.service.count({ where: { active: true } }),
      prisma.testimonial.count({ where: { active: true } }),
      prisma.media.count(),
      prisma.lead.findMany({ take: 5, orderBy: { createdAt: 'desc' }, select: { id: true, name: true, email: true, company: true, status: true, createdAt: true } }),
      prisma.auditLog.findMany({ take: 10, orderBy: { createdAt: 'desc' }, select: { id: true, action: true, entity: true, userEmail: true, createdAt: true } }),
    ]);

    return NextResponse.json({
      data: {
        stats: { totalLeads, newLeads, totalProjects, totalServices, totalTestimonials, totalMedia },
        recentLeads,
        recentAuditLogs,
      },
      success: true,
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
