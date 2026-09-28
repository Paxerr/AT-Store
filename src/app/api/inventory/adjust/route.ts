import { NextRequest, NextResponse } from 'next/server';
import { InventoryService } from '@/services/inventoryService';
import { stockAdjustmentSchema } from '@/schemas/productSchema';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = stockAdjustmentSchema.parse(body);

    const inventoryService = new InventoryService();
    const success = await inventoryService.adjustStock(
      validated.variant_id,
      validated.quantity_change,
      validated.change_type,
      validated.reason,
      validated.user_id
    );

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Không thể cập nhật tồn kho' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Điều chỉnh tồn kho thành công',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Lỗi điều chỉnh tồn kho' },
      { status: 400 }
    );
  }
}
