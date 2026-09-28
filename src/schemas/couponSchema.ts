import { z } from 'zod';

export const couponInputSchema = z.object({
  coupon_code: z.string().min(3, 'Mã giảm giá tối thiểu 3 ký tự').transform((v) => v.toUpperCase().trim()),
  type: z.enum(['PERCENTAGE', 'FIXED']),
  value: z.number().positive('Giá trị giảm phải lớn hơn 0'),
  minimum_order: z.number().min(0).default(0),
  maximum_discount: z.number().min(0).default(0),
  usage_limit: z.number().int().min(1).default(100),
  start_at: z.string().default(new Date().toISOString()),
  end_at: z.string(),
  active: z.boolean().default(true),
});

export const couponValidateSchema = z.object({
  coupon_code: z.string().min(1, 'Vui lòng nhập mã giảm giá'),
  subtotal: z.number().min(0),
  phone: z.string().optional(),
});
