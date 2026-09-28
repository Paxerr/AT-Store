import { CouponType } from './common';

export interface Coupon {
  coupon_id: string;
  coupon_code: string;
  type: CouponType;
  value: number; // percentage (e.g. 10) or fixed amount in VND (e.g. 50000)
  minimum_order: number;
  maximum_discount: number;
  usage_limit: number;
  times_used: number;
  start_at: string;
  end_at: string;
  active: boolean;
}

export interface CouponUsage {
  usage_id: string;
  coupon_id: string;
  order_id: string;
  customer_phone: string;
  discount_amount: number;
  created_at: string;
}
