import { Product, ProductVariant, Category, Brand, ProductMedia } from '@/types/product';
import { Order, OrderItem, OrderStatusHistory, Payment, OrderReturn } from '@/types/order';
import { Customer } from '@/types/customer';
import { Coupon, CouponUsage } from '@/types/coupon';
import { ShopSettings, ActivityLog, AdminNotification } from '@/types/settings';
import { InventoryLog } from '@/types/inventory';

export interface IProductRepository {
  getAllProducts(): Promise<Product[]>;
  getProductBySlug(slug: string): Promise<Product | null>;
  getProductById(id: string): Promise<Product | null>;
  createProduct(product: Product, variants: ProductVariant[], media: ProductMedia[]): Promise<Product>;
  updateProduct(id: string, updates: Partial<Product>): Promise<Product>;
  deleteProduct(id: string): Promise<boolean>;
  getVariantsByProductId(productId: string): Promise<ProductVariant[]>;
  getVariantById(variantId: string): Promise<ProductVariant | null>;
  updateVariant(variantId: string, updates: Partial<ProductVariant>): Promise<ProductVariant>;
  getMediaByProductId(productId: string): Promise<ProductMedia[]>;
  getAllCategories(): Promise<Category[]>;
  getAllBrands(): Promise<Brand[]>;
}

export interface IOrderRepository {
  getAllOrders(): Promise<Order[]>;
  getOrderById(orderId: string): Promise<Order | null>;
  getOrderByPhoneAndId(orderId: string, phone: string): Promise<Order | null>;
  createOrder(order: Order, items: OrderItem[]): Promise<Order>;
  updateOrderStatus(orderId: string, status: Order['order_status'], historyNote: string, changedBy: string): Promise<Order>;
  updateOrderPayment(orderId: string, status: Order['payment_status'], txRef?: string): Promise<Order>;
  updateOrder(orderId: string, updates: Partial<Order>): Promise<Order>;
  getOrderItems(orderId: string): Promise<OrderItem[]>;
  getOrderHistory(orderId: string): Promise<OrderStatusHistory[]>;
  addStatusHistory(history: OrderStatusHistory): Promise<void>;
}

export interface IInventoryRepository {
  getVariantStock(variantId: string): Promise<{ stock: number; reserved_stock: number; available_stock: number }>;
  reserveStock(variantId: string, quantity: number): Promise<boolean>;
  releaseStock(variantId: string, quantity: number): Promise<boolean>;
  finalizeStock(variantId: string, quantity: number): Promise<boolean>;
  adjustStock(variantId: string, delta: number, changeType: InventoryLog['change_type'], reason: string, userId: string): Promise<boolean>;
  getInventoryLogs(variantId?: string): Promise<InventoryLog[]>;
}

export interface ICouponRepository {
  getCouponByCode(code: string): Promise<Coupon | null>;
  getAllCoupons(): Promise<Coupon[]>;
  createCoupon(coupon: Coupon): Promise<Coupon>;
  updateCoupon(couponId: string, updates: Partial<Coupon>): Promise<Coupon>;
  recordCouponUsage(usage: CouponUsage): Promise<void>;
}

export interface ICustomerRepository {
  getCustomerByPhone(phone: string): Promise<Customer | null>;
  getAllCustomers(): Promise<Customer[]>;
  createOrUpdateCustomer(customerData: Partial<Customer>): Promise<Customer>;
}

export interface ISettingsRepository {
  getSettings(): Promise<ShopSettings>;
  updateSettings(settings: Partial<ShopSettings>): Promise<ShopSettings>;
}

export interface IActivityLogRepository {
  logActivity(log: Omit<ActivityLog, 'log_id' | 'created_at'>): Promise<void>;
  getActivityLogs(limit?: number): Promise<ActivityLog[]>;
}
