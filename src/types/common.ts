export type SalesChannel = 'WEBSITE' | 'FACEBOOK' | 'ZALO' | 'PHONE' | 'MANUAL' | 'POS';

export type PaymentMethod = 'BANK_TRANSFER' | 'COD' | 'CASH';

export type PaymentStatus = 
  | 'UNPAID' 
  | 'PENDING_VERIFICATION' 
  | 'PAID' 
  | 'FAILED' 
  | 'REFUNDED' 
  | 'PARTIALLY_REFUNDED';

export type OrderStatus = 
  | 'PENDING' 
  | 'CONFIRMED' 
  | 'PROCESSING' 
  | 'SHIPPED' 
  | 'DELIVERED' 
  | 'CANCELLED' 
  | 'RETURN_REQUESTED' 
  | 'RETURNED' 
  | 'REFUNDED';

export type MediaType = 'IMAGE' | 'VIDEO' | 'MODEL_3D';

export type ProductStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';

export type VariantStatus = 'ACTIVE' | 'OUT_OF_STOCK' | 'DISCONTINUED';

export type InventoryChangeType = 'SALE' | 'CANCEL' | 'RETURN' | 'ADJUSTMENT' | 'RESTOCK';

export type CouponType = 'PERCENTAGE' | 'FIXED';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
