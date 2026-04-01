import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = request.nextUrl;
  const search = request.nextUrl.searchParams;

  // Public routes that should be accessible without auth
  const isPublicPath = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
  ].includes(pathname);

  if (!token && pathname === '/login') {
    const url = new URL('/', request.url);
    url.searchParams.set('auth', 'login');
    return NextResponse.redirect(url);
  }

  if (!token && pathname === '/register') {
    const url = new URL('/', request.url);
    url.searchParams.set('auth', 'register');
    return NextResponse.redirect(url);
  }

  // ১. যদি ইউজার লগইন করা থাকে এবং সে লগইন/রেজিস্টার পেজে যেতে চায়
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // ২. যদি ইউজার লগইন করা না থাকে এবং প্রটেক্টেড পাথে যেতে চায়
  if (!isPublicPath && !token && pathname !== '/') {
    const url = new URL('/', request.url);
    if (search.get('auth') !== 'login') {
      url.searchParams.set('auth', 'login');
    }
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * নিচের পাথগুলো বাদে সব পাথে মিডলওয়্যার চলবে:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};