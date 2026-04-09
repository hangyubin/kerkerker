import { NextResponse } from 'next/server';

/** Session cookie 名称 */
const SESSION_COOKIE_NAME = 'admin_session';

export async function POST() {
  try {
    const response = NextResponse.json({ success: true });
    response.cookies.delete(SESSION_COOKIE_NAME);
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: '登出失败' },
      { status: 500 }
    );
  }
}
