import { NextRequest, NextResponse } from 'next/server';
import { OrderService } from '@/services/orderService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const orderService = new OrderService();
    const result = await orderService.createOrder(body);

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Đặt hàng thành công!',
    });
  } catch (err: any) {
    console.error('API POST /api/orders error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Lỗi khi tạo đơn hàng' },
      { status: 400 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const orderService = new OrderService();
    const orders = await orderService.getAllOrders();

    return NextResponse.json({
      success: true,
      data: orders,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Lỗi tải danh sách đơn hàng' },
      { status: 500 }
    );
  }
}
