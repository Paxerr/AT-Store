export interface Customer {
  customer_id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  district?: string;
  ward?: string;
  notes?: string;
  total_orders: number;
  total_spent: number;
  last_order_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerAddress {
  address_id: string;
  customer_id: string;
  address_line: string;
  city: string;
  district: string;
  ward: string;
  is_default: boolean;
}

export interface CustomerNote {
  note_id: string;
  customer_id: string;
  note: string;
  author: string;
  created_at: string;
}
