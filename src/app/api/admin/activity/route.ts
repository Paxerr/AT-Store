import { NextResponse } from 'next/server';
import { ActivityLogRepository } from '@/repositories/activityLogRepository';

export async function GET() {
  try {
    const activityRepo = new ActivityLogRepository();
    const logs = await activityRepo.getActivityLogs(100);

    return NextResponse.json({
      success: true,
      data: logs,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Lỗi tải nhật ký hoạt động' },
      { status: 500 }
    );
  }
}
