import { NextRequest, NextResponse } from 'next/server';
import { CouponService } from '@/services/couponService';
import { couponInputSchema } from '@/schemas/couponSchema';

export async function GET() {
  try {
    const couponService = new CouponService();
    const coupons = await couponService.getAllCoupons();

    return NextResponse.json({
      success: true,
      data: coupons,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Lỗi tải mã giảm giá' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = couponInputSchema.parse(body);

    const couponService = new CouponService();
    const newCoupon = await couponService.createCoupon({
      coupon_id: `cp_${Date.now()}`,
      coupon_code: validated.coupon_code,
      type: validated.type,
      value: validated.value,
      minimum_order: validated.minimum_order,
      maximum_discount: validated.maximum_discount,
      usage_limit: validated.usage_limit,
      times_used: 0,
      start_at: validated.start_at,
      end_at: validated.end_at,
      active: validated.active,
    });

    return NextResponse.json({
      success: true,
      data: newCoupon,
      message: 'Tạo mã giảm giá thành công',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Lỗi khi tạo mã giảm giá' },
      { status: 400 }
    );
  }
}
