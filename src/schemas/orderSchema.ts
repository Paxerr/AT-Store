import { z } from 'zod';

export const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;

export const orderItemSchema = z.object({
  product_id: z.string().min(1, 'Mã sản phẩm không được trống'),
  variant_id: z.string().min(1, 'Mã biến thể không được trống'),
  product_name: z.string().min(1, 'Tên sản phẩm không được trống'),
  variant_title: z.string().default(''),
  sku: z.string().default(''),
  price: z.number().positive('Giá sản phẩm phải lớn hơn 0'),
  quantity: z.number().int().positive('Số lượng đặt phải ít nhất là 1'),
  image: z.string().optional(),
});

export const checkoutSchema = z.object({
  customer_name: z.string().min(2, 'Họ và tên người nhận tối thiểu 2 ký tự'),
  customer_phone: z.string().regex(phoneRegex, 'Số điện thoại không hợp lệ (Ví dụ: 0912345678)'),
  customer_email: z.string().email('Email không đúng định dạng').optional().or(z.literal('')),
  shipping_address: z.string().min(5, 'Địa chỉ giao hàng chi tiết tối thiểu 5 ký tự'),
  shipping_city: z.string().min(2, 'Vui lòng chọn Tỉnh/Thành phố'),
  shipping_district: z.string().min(2, 'Vui lòng chọn Quận/Huyện'),
  shipping_ward: z.string().min(2, 'Vui lòng chọn Phường/Xã'),
  notes: z.string().max(500, 'Ghi chú tối đa 500 ký tự').optional().default(''),
  coupon_code: z.string().optional().default(''),
  payment_method: z.enum(['BANK_TRANSFER', 'COD', 'CASH']).default('BANK_TRANSFER'),
  items: z.array(orderItemSchema).min(1, 'Giỏ hàng phải có ít nhất 1 sản phẩm'),
  sales_channel: z.enum(['WEBSITE', 'FACEBOOK', 'ZALO', 'PHONE', 'MANUAL', 'POS']).default('WEBSITE'),
});

export const orderStatusUpdateSchema = z.object({
  order_status: z.enum([
    'PENDING',
    'CONFIRMED',
    'PROCESSING',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED',
    'RETURN_REQUESTED',
    'RETURNED',
    'REFUNDED',
  ]),
  note: z.string().optional().default(''),
  changed_by: z.string().default('Admin'),
});

export const orderEditSchema = z.object({
  customer_name: z.string().optional(),
  customer_phone: z.string().optional(),
  shipping_address: z.string().optional(),
  shipping_city: z.string().optional(),
  shipping_district: z.string().optional(),
  shipping_ward: z.string().optional(),
  shipping_fee: z.number().min(0).optional(),
  discount_amount: z.number().min(0).optional(),
  notes: z.string().optional(),
  reason: z.string().min(3, 'Bắt buộc nhập lý do chỉnh sửa đơn hàng'),
});
