import { z } from 'zod';

export const productOptionSchema = z.object({
  id: z.string().optional(),
  name: z.string().default('Thuộc tính'),
  values: z.array(z.string()).default([]),
});

export const variantInputSchema = z.object({
  variant_id: z.string().optional(),
  sku: z.string().min(1, 'SKU là bắt buộc'),
  barcode: z.string().default(''),
  size: z.string().default('Tiêu chuẩn'),
  color: z.string().default('Tiêu chuẩn'),
  price: z.number().min(0, 'Giá bán không được âm'),
  compare_at_price: z.number().min(0).default(0),
  cost_price: z.number().min(0).default(0),
  stock: z.number().int().min(0, 'Tồn kho không được âm'),
  weight: z.number().default(500),
  image: z.string().default(''),
  options: z.record(z.any()).optional(),
});

export const productMediaInputSchema = z.object({
  type: z.enum(['IMAGE', 'VIDEO', 'MODEL_3D']),
  url: z.string().min(1, 'Đường dẫn ảnh là bắt buộc'),
  thumbnail: z.string().default(''),
  alt: z.string().default(''),
  is_primary: z.boolean().default(false),
  sort_order: z.number().default(0),
});

export const categoryInputSchema = z.object({
  name: z.string().min(2, 'Tên danh mục tối thiểu 2 ký tự'),
  slug: z.string().min(2, 'Đường dẫn slug không hợp lệ'),
  description: z.string().default(''),
  image: z.string().default(''),
  parent_id: z.string().optional(),
  sort_order: z.number().int().default(1),
  active: z.boolean().default(true),
});

export const productInputSchema = z.object({
  name: z.string().min(2, 'Tên sản phẩm tối thiểu 2 ký tự'),
  slug: z.string().min(2, 'Slug không hợp lệ'),
  category_id: z.string().min(1, 'Vui lòng chọn danh mục'),
  brand_id: z.string().default('brand_anhthu'),
  description: z.string().default(''),
  short_description: z.string().default(''),
  status: z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']).default('ACTIVE'),
  featured: z.boolean().default(false),
  is_new: z.boolean().default(false),
  is_sale: z.boolean().default(false),
  has_3d_model: z.boolean().default(false),
  seo_title: z.string().default(''),
  seo_description: z.string().default(''),
  options: z.array(productOptionSchema).default([]),
  variants: z.array(variantInputSchema).min(1, 'Cần ít nhất một biến thể sản phẩm'),
  media: z.array(productMediaInputSchema).default([]),
});

export const stockAdjustmentSchema = z.object({
  variant_id: z.string().min(1, 'Mã biến thể không được trống'),
  change_type: z.enum(['ADJUSTMENT', 'RESTOCK', 'SALE', 'RETURN', 'CANCEL']),
  quantity_change: z.number().int().refine((val) => val !== 0, 'Số lượng thay đổi phải khác 0'),
  reason: z.string().min(3, 'Bắt buộc ghi rõ lý do điều chỉnh kho'),
  user_id: z.string().default('Admin'),
});
