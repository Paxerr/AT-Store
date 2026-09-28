import { NextRequest, NextResponse } from 'next/server';
import { CouponService } from '@/services/couponService';
import { couponValidateSchema } from '@/schemas/couponSchema';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = couponValidateSchema.parse(body);

    const couponService = new CouponService();
    const result = await couponService.validateCoupon(
      validated.coupon_code,
      validated.subtotal,
      validated.phone
    );

    if (!result.valid) {
      return NextResponse.json(
        { success: false, error: result.reason || 'Mã giảm giá không hợp lệ' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        coupon_code: result.coupon?.coupon_code,
        discount_amount: result.discount_amount,
        type: result.coupon?.type,
        value: result.coupon?.value,
      },
      message: `Áp dụng mã giảm giá thành công! Giảm ${result.discount_amount.toLocaleString('vi-VN')}đ`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Lỗi kiểm tra mã giảm giá' },
      { status: 400 }
    );
  }
}
