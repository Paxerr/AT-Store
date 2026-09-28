import { NextResponse } from 'next/server';
import { validateAdminCredentials, signAdminToken } from '@/lib/adminAuth';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, password } = body || {};

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu' },
        { status: 400 }
      );
    }

    const user = validateAdminCredentials(username, password);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Tài khoản hoặc mật khẩu không chính xác' },
        { status: 401 }
      );
    }

    const token = signAdminToken(user);

    const response = NextResponse.json({
      success: true,
      message: 'Đăng nhập thành công',
      user: {
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    // Set secure HTTP-Only cookie
    response.cookies.set('ats_admin_token', token, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    // Helper client cookie for immediate state detection
    response.cookies.set('ats_admin_active', '1', {
      path: '/',
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Lỗi hệ thống khi xử lý đăng nhập' },
      { status: 500 }
    );
  }
}
