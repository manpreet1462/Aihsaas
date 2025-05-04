// middleware.ts
import { auth } from '@/lib/firebase';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicRoutes = ['/login', '/signup', '/'];

export async function middleware(request: NextRequest) {
  console.log('Middleware running for:', request.nextUrl.pathname);
  const { pathname } = request.nextUrl;
  
  // Get the session token from cookies
  const sessionToken = request.cookies.get('session')?.value;
  
  // If trying to access auth pages while logged in
  if (publicRoutes.includes(pathname)) {
    if (sessionToken) {
      console.log("User is logged in, redirecting to dashboard");
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Protect all other routes
  if (!sessionToken) {
    console.log('No session found, redirecting to login');
    const response = NextResponse.redirect(new URL('/login', request.url));
    // Clear any existing session cookie
    response.cookies.delete('session');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
