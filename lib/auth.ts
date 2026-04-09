import { NextResponse } from 'next/server';

/** Session cookie 名称 */
const SESSION_COOKIE_NAME = 'admin_session';

/** Cookie 有效期：7天（单位：秒） */
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

/** 判断是否为生产环境 */
const isProduction = process.env.NODE_ENV === 'production';

/**
 * 获取管理员密码
 * 运行时动态读取环境变量，避免构建时被内联
 */
function getAdminPassword(): string {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    console.warn('⚠️ ADMIN_PASSWORD 未设置，使用默认密码');
    return 'admin123';
  }
  return password;
}

/**
 * 创建会话
 * 设置 HTTP-only Cookie，生产环境启用 secure 标志
 * @returns NextResponse 带有设置的 cookie
 */
export function createSession(): NextResponse {
  const response = NextResponse.next();
  
  response.cookies.set(SESSION_COOKIE_NAME, 'authenticated', {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });
  
  return response;
}

/**
 * 删除会话
 * 清除客户端 Cookie
 * @returns NextResponse 带有删除的 cookie
 */
export function deleteSession(): NextResponse {
  const response = NextResponse.next();
  
  response.cookies.delete(SESSION_COOKIE_NAME);
  
  return response;
}

/**
 * 验证会话有效性
 * @param cookies - 请求的 cookies 对象
 * @returns 会话是否有效
 */
export function validateSession(cookies: any): boolean {
  try {
    const session = cookies.get(SESSION_COOKIE_NAME);
    return session?.value === 'authenticated';
  } catch {
    return false;
  }
}

/**
 * 验证管理员密码
 * @param password - 输入的密码
 * @returns 密码是否正确
 */
export function validatePassword(password: string): boolean {
  if (!password || typeof password !== 'string') {
    return false;
  }
  return password === getAdminPassword();
}
