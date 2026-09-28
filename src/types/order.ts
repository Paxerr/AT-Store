import { OrderStatus, PaymentMethod, PaymentStatus, SalesChannel } from './common';
export type { OrderStatus, PaymentMethod, PaymentStatus, SalesChannel };

export interface OrderItem {
  item_id: string;
  order_id: string;
  product_id: string;
  variant_id: string;
  product_name: string;
  variant_title: string;
  sku: string;
  price: number;
  quantity: number;
  total: number;
  image?: string;
}

export interface OrderStatusHistory {
  history_id: string;
  order_id: string;
  from_status: OrderStatus;
  to_status: OrderStatus;
  note: string;
  changed_by: string;
  created_at: string;
}

export interface Order {
  order_id: string;
  order_number: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  shipping_address: string;
  shipping_city: string;
  shipping_district: string;
  shipping_ward: string;
  notes?: string;
  subtotal: number;
  discount_amount: number;
  coupon_code?: string;
  shipping_fee: number;
  total_amount: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  sales_channel: SalesChannel;
  tracking_number?: string;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  history?: OrderStatusHistory[];
}

export interface Payment {
  payment_id: string;
  order_id: string;
  amount: number;
  payment_method: PaymentMethod;
  status: PaymentStatus;
  transaction_ref?: string;
  note?: string;
  verified_at?: string;
  verified_by?: string;
  created_at: string;
}

export interface OrderReturn {
  return_id: string;
  order_id: string;
  reason: string;
  status: 'RETURN_REQUESTED' | 'RETURN_APPROVED' | 'RETURN_RECEIVED' | 'REFUNDED' | 'REJECTED';
  customer_notes?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  items?: ReturnItem[];
}

export interface ReturnItem {
  return_item_id: string;
  return_id: string;
  order_item_id: string;
  variant_id: string;
  quantity: number;
  condition: string;
  restock_approved: boolean;
}

export interface Exchange {
  exchange_id: string;
  order_id: string;
  original_variant_id: string;
  new_variant_id: string;
  quantity: number;
  status: 'PENDING' | 'APPROVED' | 'COMPLETED' | 'CANCELLED';
  difference_amount: number;
  created_at: string;
}
