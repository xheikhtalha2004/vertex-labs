import { withAuth } from 'next-auth/middleware';
import { NextFetchEvent, NextResponse } from 'next/server';

const authMiddleware = withAuth(
  function middleware(req) {
    const pathname = req.nextUrl.pathname;

    const token = req.nextauth.token;

    // Users page — ADMIN only
    if (pathname.startsWith('/admin/users') && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/admin/dashboard', req.url));
    }

    // All other admin routes — any authenticated user
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/login',
    },
  }
);

export default function middleware(
  req: Parameters<typeof authMiddleware>[0],
  ev: NextFetchEvent
) {
  const pathname = req.nextUrl.pathname;

  // Public API: apply dynamic CORS and allow preflight without auth
  if (pathname.startsWith('/api/public/')) {
    const origin = req.headers.get('origin');
    const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);
    const isAllowedOrigin = origin && allowedOrigins.includes(origin);

    const corsHeaders: Record<string, string> = {
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (isAllowedOrigin) {
      corsHeaders['Access-Control-Allow-Origin'] = origin;
    }

    if (req.method === 'OPTIONS') {
      return new NextResponse(null, { status: 204, headers: corsHeaders });
    }

    const response = NextResponse.next();
    for (const [key, value] of Object.entries(corsHeaders)) {
      response.headers.set(key, value);
    }
    return response;
  }

  return authMiddleware(req, ev);
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*', '/api/public/:path*'],
};
