import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Đã đăng xuất' });

  response.cookies.delete('ats_admin_token');
  response.cookies.delete('ats_admin_active');
  response.cookies.delete('ats_admin_session');

  return response;
}
