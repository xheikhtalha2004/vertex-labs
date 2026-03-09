import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

type Role = 'ADMIN' | 'EDITOR' | 'VIEWER';

type RouteHandler = (
  req: NextRequest,
  context: { params: Record<string, string>; session: { user: { id: string; email: string; role: string } } }
) => Promise<NextResponse>;

/**
 * Wrap an API route handler with authentication and optional role check.
 */
export function withAuth(handler: RouteHandler, requiredRoles?: Role[]) {
  return async (req: NextRequest, context: { params: Record<string, string> }) => {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (requiredRoles && !requiredRoles.includes(session.user.role as Role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return handler(req, { ...context, session: session as any });
  };
}

/**
 * Standard success response
 */
export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ data, success: true }, { status });
}

/**
 * Standard error response
 */
export function err(message: string, status = 400) {
  return NextResponse.json({ error: message, success: false }, { status });
}

/**
 * Parse JSON body safely
 */
export async function parseBody<T>(req: NextRequest): Promise<T | null> {
  try {
    return (await req.json()) as T;
  } catch {
    return null;
  }
}
