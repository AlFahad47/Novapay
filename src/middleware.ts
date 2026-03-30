import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = request.nextUrl;

  // পাবলিক পাথ চেক (home path '/' কে আলাদাভাবে হ্যান্ডেল করা ভালো)
  const isPublicPath = pathname === '/login' || pathname === '/register';

  // ১. যদি ইউজার লগইন করা থাকে এবং সে লগইন/রেজিস্টার পেজে যেতে চায়
  if (isPublicPath && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // ২. যদি ইউজার লগইন করা না থাকে এবং প্রটেক্টেড পাথে যেতে চায়
  if (!isPublicPath && !token && pathname !== '/') {
    return NextResponse.redirect(new URL('/login', request.url));
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
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};