import { ICouponRepository } from './interfaces';
import { Coupon, CouponUsage } from '@/types/coupon';
import { DataStore } from './dataStore';

export class CouponRepository implements ICouponRepository {
  private store = DataStore.getInstance();

  public async getCouponByCode(code: string): Promise<Coupon | null> {
    const clean = code.trim().toUpperCase();
    const coupon = this.store.getCoupons().find((c) => c.coupon_code.toUpperCase() === clean);
    return coupon || null;
  }

  public async getAllCoupons(): Promise<Coupon[]> {
    return this.store.getCoupons();
  }

  public async createCoupon(coupon: Coupon): Promise<Coupon> {
    return this.store.acquireLock(async () => {
      this.store.getRawData().coupons.unshift(coupon);
      return coupon;
    });
  }

  public async updateCoupon(couponId: string, updates: Partial<Coupon>): Promise<Coupon> {
    return this.store.acquireLock(async () => {
      const raw = this.store.getRawData();
      const idx = raw.coupons.findIndex((c) => c.coupon_id === couponId);
      if (idx === -1) throw new Error(`Coupon ${couponId} not found`);

      raw.coupons[idx] = {
        ...raw.coupons[idx],
        ...updates,
      };
      return raw.coupons[idx];
    });
  }

  public async recordCouponUsage(usage: CouponUsage): Promise<void> {
    return this.store.acquireLock(async () => {
      const raw = this.store.getRawData();
      raw.couponUsages.push(usage);
      const coupon = raw.coupons.find((c) => c.coupon_id === usage.coupon_id);
      if (coupon) {
        coupon.times_used = (coupon.times_used || 0) + 1;
      }
    });
  }
}
