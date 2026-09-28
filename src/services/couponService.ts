import { CouponRepository } from '@/repositories/couponRepository';
import { Coupon } from '@/types/coupon';

export interface CouponValidationResult {
  valid: boolean;
  discount_amount: number;
  reason?: string;
  coupon?: Coupon;
}

export class CouponService {
  private couponRepo: CouponRepository;

  constructor() {
    this.couponRepo = new CouponRepository();
  }

  public async validateCoupon(
    code: string,
    subtotal: number,
    phone?: string
  ): Promise<CouponValidationResult> {
    if (!code || !code.trim()) {
      return { valid: false, discount_amount: 0, reason: 'Mã giảm giá không được để trống' };
    }

    const coupon = await this.couponRepo.getCouponByCode(code.trim());
    if (!coupon) {
      return { valid: false, discount_amount: 0, reason: 'Mã giảm giá không tồn tại' };
    }

    if (!coupon.active) {
      return { valid: false, discount_amount: 0, reason: 'Mã giảm giá hiện đang bị vô hiệu hóa' };
    }

    const now = new Date();
    if (coupon.start_at && new Date(coupon.start_at) > now) {
      return { valid: false, discount_amount: 0, reason: 'Mã giảm giá chưa đến đợt áp dụng' };
    }

    if (coupon.end_at && new Date(coupon.end_at) < now) {
      return { valid: false, discount_amount: 0, reason: 'Mã giảm giá đã hết hạn sử dụng' };
    }

    if (coupon.usage_limit && coupon.times_used >= coupon.usage_limit) {
      return { valid: false, discount_amount: 0, reason: 'Mã giảm giá đã hết lượt sử dụng' };
    }

    if (coupon.minimum_order && subtotal < coupon.minimum_order) {
      const minFormatted = coupon.minimum_order.toLocaleString('vi-VN');
      return {
        valid: false,
        discount_amount: 0,
        reason: `Đơn hàng tối thiểu ${minFormatted}đ để áp dụng mã này`,
      };
    }

    let discount = 0;
    if (coupon.type === 'PERCENTAGE') {
      discount = Math.round((subtotal * coupon.value) / 100);
      if (coupon.maximum_discount && coupon.maximum_discount > 0) {
        discount = Math.min(discount, coupon.maximum_discount);
      }
    } else {
      // FIXED
      discount = Math.min(coupon.value, subtotal);
    }

    return {
      valid: true,
      discount_amount: discount,
      coupon,
    };
  }

  public async getAllCoupons(): Promise<Coupon[]> {
    return this.couponRepo.getAllCoupons();
  }

  public async createCoupon(data: Coupon): Promise<Coupon> {
    return this.couponRepo.createCoupon(data);
  }

  public async updateCoupon(id: string, updates: Partial<Coupon>): Promise<Coupon> {
    return this.couponRepo.updateCoupon(id, updates);
  }

  public async recordUsage(couponId: string, orderId: string, phone: string, amount: number): Promise<void> {
    await this.couponRepo.recordCouponUsage({
      usage_id: `usg_${Date.now()}`,
      coupon_id: couponId,
      order_id: orderId,
      customer_phone: phone,
      discount_amount: amount,
      created_at: new Date().toISOString(),
    });
  }
}
