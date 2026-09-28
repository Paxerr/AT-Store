import { InventoryChangeType } from './common';

export interface Inventory {
  inventory_id: string;
  variant_id: string;
  stock: number;
  reserved_stock: number;
  available_stock: number; // calculated: stock - reserved_stock
  low_stock_threshold: number;
  updated_at: string;
  // joined for UI
  product_name?: string;
  sku?: string;
  size?: string;
  color?: string;
}

export interface InventoryLog {
  log_id: string;
  variant_id: string;
  change_type: InventoryChangeType;
  quantity_change: number;
  before_stock: number;
  after_stock: number;
  reason: string;
  user_id: string;
  created_at: string;
}

export interface InventoryReservation {
  reservation_id: string;
  order_id: string;
  variant_id: string;
  quantity: number;
  status: 'ACTIVE' | 'RELEASED' | 'CONSUMED';
  expires_at: string;
  created_at: string;
}
