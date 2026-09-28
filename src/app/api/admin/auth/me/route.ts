import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAdminToken } from '@/lib/adminAuth';

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('ats_admin_token')?.value;

    if (!token) {
      return NextResponse.json({ success: false, user: null }, { status: 401 });
    }

    const user = verifyAdminToken(token);

    if (!user) {
      const response = NextResponse.json({ success: false, user: null }, { status: 401 });
      response.cookies.delete('ats_admin_token');
      response.cookies.delete('ats_admin_active');
      return response;
    }

    return NextResponse.json({
      success: true,
      user: {
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, user: null }, { status: 500 });
  }
}
