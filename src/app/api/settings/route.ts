import { NextRequest, NextResponse } from 'next/server';
import { SettingsService } from '@/services/settingsService';

export async function GET() {
  try {
    const settingsService = new SettingsService();
    const settings = await settingsService.getSettings();

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Lỗi tải cấu hình cửa hàng' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const settingsService = new SettingsService();
    const updated = await settingsService.updateSettings(body);

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Cập nhật cấu hình cửa hàng thành công',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Lỗi khi lưu cấu hình' },
      { status: 400 }
    );
  }
}
