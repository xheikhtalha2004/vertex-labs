import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const ContactSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email(),
  message: z.string().min(1).max(5000),
});

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://vertex-labs.vercel.app',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = ContactSchema.parse(body);

    // Word count check (minimum 20 words)
    const wordCount = validated.message.trim().split(/\s+/).filter((w) => w.length > 0).length;
    if (wordCount < 20) {
      return NextResponse.json(
        { error: 'Message must be at least 20 words', success: false },
        { status: 422, headers: CORS_HEADERS }
      );
    }

    await prisma.lead.create({
      data: {
        name: `${validated.firstName} ${validated.lastName}`,
        email: validated.email,
        message: validated.message,
        status: 'NEW',
        source: 'contact_form',
      },
    });

    return NextResponse.json(
      { success: true, message: 'Your message has been received. We will be in touch shortly.' },
      { headers: CORS_HEADERS }
    );
  } catch (error: any) {
    if (error?.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid form data', details: error.errors, success: false },
        { status: 422, headers: CORS_HEADERS }
      );
    }
    console.error('POST /api/public/contact error:', error);
    return NextResponse.json(
      { error: 'Internal server error', success: false },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
