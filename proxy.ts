import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/** Session cookie 名称 */
const SESSION_COOKIE_NAME = 'admin_session';

/** 需要保护的路由 */
const PROTECTED_ROUTES = ['/admin'];

/** 排除的路由（不需要保护） */
const EXCLUDE_ROUTES = ['/api/auth/login', '/api/auth/logout'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 排除不需要保护的路由
  if (EXCLUDE_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }
  
  // 检查是否访问受保护的路由
  if (PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
    // 检查会话 cookie
    const session = request.cookies.get(SESSION_COOKIE_NAME);
    
    if (!session || session.value !== 'authenticated') {
      // 未登录，重定向到登录页面
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * 匹配所有请求路径，除了：
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
