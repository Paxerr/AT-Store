import fs from 'fs';
import path from 'path';
import {
  INITIAL_CATEGORIES,
  INITIAL_BRANDS,
  INITIAL_PRODUCTS,
  INITIAL_VARIANTS,
  INITIAL_MEDIA,
  INITIAL_COUPONS,
  INITIAL_SETTINGS,
  INITIAL_ORDERS,
} from '@/data/initialData';
import { Product, ProductVariant, Category, Brand, ProductMedia } from '@/types/product';
import { Order, OrderItem, OrderStatusHistory } from '@/types/order';
import { Coupon, CouponUsage } from '@/types/coupon';
import { Customer } from '@/types/customer';
import { ShopSettings, ActivityLog, AdminNotification } from '@/types/settings';
import { InventoryLog } from '@/types/inventory';
import { GoogleSheetsClient } from './googleSheetsClient';

interface StoreSchema {
  products: Product[];
  variants: ProductVariant[];
  categories: Category[];
  brands: Brand[];
  media: ProductMedia[];
  orders: Order[];
  orderItems: OrderItem[];
  orderHistory: OrderStatusHistory[];
  inventoryLogs: InventoryLog[];
  coupons: Coupon[];
  couponUsages: CouponUsage[];
  customers: Customer[];
  settings: ShopSettings;
  activityLogs: ActivityLog[];
  notifications: AdminNotification[];
}

export class DataStore {
  private static instance: DataStore;
  private data: StoreSchema;
  private filePath: string;
  private lockPromise: Promise<void> = Promise.resolve();

  private constructor() {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      try {
        fs.mkdirSync(dataDir, { recursive: true });
      } catch (e) {
        // Ignored if permissions allow
      }
    }
    this.filePath = path.join(dataDir, 'store.json');
    this.data = this.loadOrInitialize();
  }

  public static getInstance(): DataStore {
    if (!DataStore.instance) {
      DataStore.instance = new DataStore();
    }
    return DataStore.instance;
  }

  private loadOrInitialize(): StoreSchema {
    if (fs.existsSync(this.filePath)) {
      try {
        const fileContent = fs.readFileSync(this.filePath, 'utf-8');
        return JSON.parse(fileContent);
      } catch (err) {
        console.warn('[DataStore] Corrupt store.json detected, re-initializing from seeds.');
      }
    }

    // Default initial seed state
    const orderItems: OrderItem[] = [];
    const orderHistory: OrderStatusHistory[] = [];

    INITIAL_ORDERS.forEach((ord) => {
      if (ord.items) orderItems.push(...ord.items);
      if (ord.history) orderHistory.push(...ord.history);
    });

    const initialCustomers: Customer[] = [
      {
        customer_id: 'cust_001',
        name: 'Trần Văn Minh',
        phone: '0912345678',
        email: 'minhtran@example.com',
        address: '45 Lê Duẩn, Phường Bến Nghé',
        city: 'TP. Hồ Chí Minh',
        district: 'Quận 1',
        ward: 'Phường Bến Nghé',
        total_orders: 1,
        total_spent: 2530000,
        last_order_at: '2026-09-27T08:30:00Z',
        created_at: '2026-09-27T08:30:00Z',
        updated_at: '2026-09-27T08:30:00Z',
      },
      {
        customer_id: 'cust_002',
        name: 'Nguyễn Thị Hương',
        phone: '0987654321',
        email: 'huongnguyen@example.com',
        address: '12 Nguyễn Trãi, Phường 2',
        city: 'TP. Hồ Chí Minh',
        district: 'Quận 5',
        ward: 'Phường 2',
        total_orders: 1,
        total_spent: 2880000,
        last_order_at: '2026-09-27T10:10:00Z',
        created_at: '2026-09-27T10:10:00Z',
        updated_at: '2026-09-27T10:10:00Z',
      },
    ];

    const initialLogs: InventoryLog[] = [
      {
        log_id: 'inv_log_001',
        variant_id: 'var_001_41',
        change_type: 'SALE',
        quantity_change: -1,
        before_stock: 11,
        after_stock: 10,
        reason: 'Khách đặt đơn ATS-20260927-0001',
        user_id: 'System',
        created_at: '2026-09-27T08:30:00Z',
      },
    ];

    const initialActivity: ActivityLog[] = [
      {
        log_id: 'act_001',
        user_id: 'Admin',
        action: 'STATUS_CHANGE',
        entity: 'ORDER',
        entity_id: 'ATS-20260927-0001',
        before_state: 'PENDING',
        after_state: 'CONFIRMED',
        reason: 'Đã nhận chuyển khoản MBBank',
        created_at: '2026-09-27T08:45:00Z',
      },
    ];

    const initialNotifications: AdminNotification[] = [
      {
        notification_id: 'notif_001',
        title: 'Đơn hàng mới',
        message: 'Khách Nguyễn Thị Hương vừa đặt đơn ATS-20260927-0002 (2.880.000đ)',
        type: 'ORDER',
        is_read: false,
        link: '/admin/orders',
        created_at: '2026-09-27T10:10:00Z',
      },
      {
        notification_id: 'notif_002',
        title: 'Cảnh báo sắp hết hàng',
        message: 'Sản phẩm New Balance 550 Size 42 chỉ còn 1 đôi trong kho!',
        type: 'STOCK',
        is_read: false,
        link: '/admin/inventory',
        created_at: '2026-09-27T10:15:00Z',
      },
    ];

    const state: StoreSchema = {
      products: INITIAL_PRODUCTS,
      variants: INITIAL_VARIANTS,
      categories: INITIAL_CATEGORIES,
      brands: INITIAL_BRANDS,
      media: INITIAL_MEDIA,
      orders: INITIAL_ORDERS,
      orderItems,
      orderHistory,
      inventoryLogs: initialLogs,
      coupons: INITIAL_COUPONS,
      couponUsages: [],
      customers: initialCustomers,
      settings: INITIAL_SETTINGS,
      activityLogs: initialActivity,
      notifications: initialNotifications,
    };

    this.saveImmediate(state);
    return state;
  }

  private saveImmediate(state: StoreSchema): void {
    try {
      const dataDir = path.dirname(this.filePath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      fs.writeFileSync(this.filePath, JSON.stringify(state, null, 2), 'utf-8');
    } catch (err) {
      console.error('[DataStore] Error saving store.json:', err);
    }
  }

  public async acquireLock<T>(operation: () => Promise<T> | T): Promise<T> {
    let release: () => void;
    const nextLock = new Promise<void>((resolve) => {
      release = resolve;
    });

    const currentLock = this.lockPromise;
    this.lockPromise = nextLock;

    await currentLock;
    try {
      const result = await operation();
      this.saveImmediate(this.data);
      return result;
    } finally {
      release!();
    }
  }

  // Getters & Mutators
  public getProducts(): Product[] {
    return this.data.products;
  }

  public getVariants(): ProductVariant[] {
    return this.data.variants;
  }

  public getCategories(): Category[] {
    return this.data.categories;
  }

  public getBrands(): Brand[] {
    return this.data.brands;
  }

  public getMedia(): ProductMedia[] {
    return this.data.media;
  }

  public getOrders(): Order[] {
    return this.data.orders;
  }

  public getOrderItems(): OrderItem[] {
    return this.data.orderItems;
  }

  public getOrderHistory(): OrderStatusHistory[] {
    return this.data.orderHistory;
  }

  public getInventoryLogs(): InventoryLog[] {
    return this.data.inventoryLogs;
  }

  public getCoupons(): Coupon[] {
    return this.data.coupons;
  }

  public getCouponUsages(): CouponUsage[] {
    return this.data.couponUsages;
  }

  public getCustomers(): Customer[] {
    return this.data.customers;
  }

  public getSettings(): ShopSettings {
    return this.data.settings;
  }

  public getActivityLogs(): ActivityLog[] {
    return this.data.activityLogs;
  }

  public getNotifications(): AdminNotification[] {
    return this.data.notifications;
  }

  // Raw reference for in-lock operations
  public getRawData(): StoreSchema {
    return this.data;
  }
}
