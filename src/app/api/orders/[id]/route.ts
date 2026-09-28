import { NextRequest, NextResponse } from 'next/server';
import { OrderService } from '@/services/orderService';
import { PaymentService } from '@/services/paymentService';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const orderService = new OrderService();
    const order = await orderService.getOrderById(id);

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy đơn hàng' },
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
      { success: false, error: err.message || 'Lỗi hệ thống' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const orderService = new OrderService();

    // Contextual actions
    if (body.action === 'UPDATE_STATUS') {
      const updated = await orderService.updateOrderStatus(
        id,
        body.order_status,
        body.note || '',
        body.changed_by || 'Admin'
      );
      return NextResponse.json({ success: true, data: updated, message: 'Đã cập nhật trạng thái đơn' });
    }

    if (body.action === 'CONFIRM_PAYMENT') {
      const updated = await orderService.confirmPayment(id, body.transaction_ref, body.changed_by || 'Admin');
      return NextResponse.json({ success: true, data: updated, message: 'Đã xác nhận thanh toán thành công' });
    }

    if (body.action === 'EDIT_ORDER') {
      const updated = await orderService.editOrder(id, body, body.changed_by || 'Admin');
      return NextResponse.json({ success: true, data: updated, message: 'Chỉnh sửa đơn hàng thành công' });
    }

    return NextResponse.json(
      { success: false, error: 'Hành động không hợp lệ' },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Lỗi khi cập nhật đơn hàng' },
      { status: 400 }
    );
  }
}
