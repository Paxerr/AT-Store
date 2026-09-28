import { NextRequest, NextResponse } from 'next/server';
import { OrderService } from '@/services/orderService';
import { PaymentService } from '@/services/paymentService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { order_id, phone } = body;

    if (!order_id || !phone) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng nhập cả Mã đơn hàng và Số điện thoại đặt hàng' },
        { status: 400 }
      );
    }

    const orderService = new OrderService();
    const order = await orderService.trackOrder(order_id, phone);

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: 'Không tìm thấy đơn hàng tương ứng với Mã đơn và Số điện thoại đã cung cấp',
        },
        { status: 404 }
      );
    }

    const paymentService = new PaymentService();
    const vietqr = await paymentService.generateVietQr(order.order_id, order.total_amount);

    return NextResponse.json({
      success: true,
      data: {
        order,
        vietqr,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Lỗi tra cứu đơn hàng' },
      { status: 500 }
    );
  }
}
