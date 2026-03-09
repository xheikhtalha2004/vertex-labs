import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

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

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
