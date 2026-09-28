import { NextResponse } from 'next/server';
import { AnalyticsService } from '@/services/analyticsService';

export async function GET() {
  try {
    const analyticsService = new AnalyticsService();
    const overview = await analyticsService.getDashboardOverview();

    return NextResponse.json({
      success: true,
      data: overview,
    });
  } catch (err: any) {
    console.error('API /api/admin/dashboard error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Lỗi tải thống kê quản trị' },
      { status: 500 }
    );
  }
}
