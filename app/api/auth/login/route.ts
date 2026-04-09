import { NextRequest, NextResponse } from 'next/server';
import { validatePassword } from '@/lib/auth';

/** Session cookie 名称 */
const SESSION_COOKIE_NAME = 'admin_session';

/** Cookie 有效期：7天（单位：秒） */
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

/** 判断是否为生产环境 */
const isProduction = process.env.NODE_ENV === 'production';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { error: '请输入密码' },
        { status: 400 }
      );
    }

    // 验证密码
    if (!validatePassword(password)) {
      return NextResponse.json(
        { error: '密码错误' },
        { status: 401 }
      );
    }

    // 创建会话
    const response = NextResponse.json({ success: true });
    response.cookies.set(SESSION_COOKIE_NAME, 'authenticated', {
      httpOnly: true,
      secure: false, // 强制禁用 secure，避免 HTTP 环境下 cookie 无法设置
      sameSite: 'lax', // 使用 lax 以确保跨域请求时 cookie 能被正确传递
      maxAge: SESSION_MAX_AGE,
      path: '/',
    });
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: '登录失败' },
      { status: 500 }
    );
  }
}
