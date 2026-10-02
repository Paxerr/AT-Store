import { MediaType, ProductStatus, VariantStatus } from './common';

export interface ProductMedia {
  media_id: string;
  product_id: string;
  type: MediaType;
  url: string;
  thumbnail: string;
  alt: string;
  sort_order: number;
  is_primary: boolean;
}

export interface ProductOption {
  id?: string;
  name: string;
  values: string[];
}

export interface ProductVariant {
  variant_id: string;
  product_id: string;
  sku: string;
  barcode: string;
  size: string;
  color: string;
  price: number;
  compare_at_price: number;
  cost_price: number;
  stock: number;
  reserved_stock: number;
  weight: number;
  status: VariantStatus;
  image: string;
  options?: Record<string, string>;
}

export interface Product {
  product_id: string;
  slug: string;
  name: string;
  description: string;
  short_description: string;
  brand_id: string;
  category_id: string;
  status: ProductStatus;
  featured: boolean;
  is_new: boolean;
  is_sale: boolean;
  seo_title: string;
  seo_description: string;
  has_3d_model?: boolean;
  created_at: string;
  updated_at: string;
  // Computed / joined fields for UI
  options?: ProductOption[];
  variants?: ProductVariant[];
  media?: ProductMedia[];
  category_name?: string;
  brand_name?: string;
  min_price?: number;
  max_price?: number;
  available_sizes?: string[];
  available_colors?: string[];
}

export interface Category {
  category_id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  parent_id?: string;
  sort_order: number;
  active: boolean;
}

export interface Brand {
  brand_id: string;
  name: string;
  slug: string;
  logo: string;
  description: string;
  active: boolean;
}

export interface Attribute {
  attribute_id: string;
  name: string;
  code: string;
}

export interface AttributeValue {
  value_id: string;
  attribute_id: string;
  value: string;
  label: string;
}
