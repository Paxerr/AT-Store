export interface ShopSettings {
  SHOP_NAME: string;
  SHOP_AVATAR?: string;
  SHOP_SLOGAN?: string;
  SHOP_BRAND_COLOR?: string;
  ANNOUNCEMENT_TEXT?: string;
  ANNOUNCEMENT_ACTIVE?: boolean;
  BUSINESS_HOURS?: string;
  PHONE: string;
  EMAIL?: string;
  ADDRESS: string;
  BANK_NAME: string;
  BANK_ACCOUNT_NUMBER: string;
  BANK_ACCOUNT_NAME: string;
  BANK_CODE: string;
  BANK_QR_IMAGE?: string;
  SHIPPING_FEE: number;
  DELIVERY_ESTIMATE: string;
  SHIPPING_POLICY: string;
  RETURN_POLICY: string;
  PRIVACY_POLICY: string;
  TERMS: string;
  ZALO_LINK: string;
  FACEBOOK_LINK: string;
  INSTAGRAM_LINK: string;
  TIKTOK_LINK: string;
  LOW_STOCK_THRESHOLD: number;
}

export interface ActivityLog {
  log_id: string;
  user_id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'STATUS_CHANGE' | 'STOCK_ADJUST';
  entity: 'ORDER' | 'PRODUCT' | 'INVENTORY' | 'SETTINGS' | 'COUPON' | 'CUSTOMER';
  entity_id: string;
  before_state?: string;
  after_state?: string;
  reason: string;
  created_at: string;
}

export interface AdminNotification {
  notification_id: string;
  title: string;
  message: string;
  type: 'ORDER' | 'PAYMENT' | 'STOCK' | 'SYSTEM';
  is_read: boolean;
  link?: string;
  created_at: string;
}
