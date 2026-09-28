import { NextRequest, NextResponse } from 'next/server';
import { InventoryService } from '@/services/inventoryService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const variantId = searchParams.get('variant_id') || undefined;

    const inventoryService = new InventoryService();
    const inventory = await inventoryService.getAllInventoryStatus();
    const logs = await inventoryService.getInventoryLogs(variantId);

    return NextResponse.json({
      success: true,
      data: {
        inventory,
        logs,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Lỗi tải thông tin kho hàng' },
      { status: 500 }
    );
  }
}
