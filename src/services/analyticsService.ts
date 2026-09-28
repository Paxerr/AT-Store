import { OrderRepository } from '@/repositories/orderRepository';
import { ProductRepository } from '@/repositories/productRepository';
import { InventoryRepository } from '@/repositories/inventoryRepository';
import { SettingsRepository } from '@/repositories/settingsRepository';
import { ActivityLogRepository } from '@/repositories/activityLogRepository';

export interface TodayKPIs {
  today_revenue: number;
  today_orders_count: number;
  pending_orders_count: number;
  unpaid_orders_count: number;
  low_stock_count: number;
}

export interface BusinessSummary {
  kpis: TodayKPIs;
  total_revenue: number;
  total_orders: number;
  avg_order_value: number;
  gross_profit: number;
  gross_margin_pct: number;
  top_products: { product_name: string; units_sold: number; revenue: number }[];
  urgent_orders: any[];
  low_stock_items: any[];
}

export class AnalyticsService {
  private orderRepo: OrderRepository;
  private productRepo: ProductRepository;
  private inventoryRepo: InventoryRepository;
  private settingsRepo: SettingsRepository;
  private activityRepo: ActivityLogRepository;

  constructor() {
    this.orderRepo = new OrderRepository();
    this.productRepo = new ProductRepository();
    this.inventoryRepo = new InventoryRepository();
    this.settingsRepo = new SettingsRepository();
    this.activityRepo = new ActivityLogRepository();
  }

  public async getDashboardOverview(): Promise<BusinessSummary> {
    const orders = await this.orderRepo.getAllOrders();
    const products = await this.productRepo.getAllProducts();
    const settings = await this.settingsRepo.getSettings();
    const threshold = settings.LOW_STOCK_THRESHOLD || 2;

    const todayStr = new Date().toISOString().split('T')[0];

    let todayRevenue = 0;
    let todayOrdersCount = 0;
    let pendingCount = 0;
    let unpaidCount = 0;
    let totalRevenue = 0;
    let totalCost = 0;

    const urgentOrders: any[] = [];
    const productSalesMap: Record<string, { product_name: string; units_sold: number; revenue: number }> = {};

    orders.forEach((o) => {
      const orderDate = o.created_at.split('T')[0];
      const isPaid = o.payment_status === 'PAID';

      if (isPaid) {
        totalRevenue += o.total_amount;
        if (orderDate === todayStr) {
          todayRevenue += o.total_amount;
        }
      }

      if (orderDate === todayStr) {
        todayOrdersCount++;
      }

      if (o.order_status === 'PENDING' || o.order_status === 'CONFIRMED') {
        pendingCount++;
        urgentOrders.push(o);
      }

      if (o.payment_status === 'UNPAID' || o.payment_status === 'PENDING_VERIFICATION') {
        unpaidCount++;
      }

      // Calculate cost & sales stats from items
      (o.items || []).forEach((item) => {
        if (!productSalesMap[item.product_id]) {
          productSalesMap[item.product_id] = {
            product_name: item.product_name,
            units_sold: 0,
            revenue: 0,
          };
        }
        productSalesMap[item.product_id].units_sold += item.quantity;
        productSalesMap[item.product_id].revenue += item.total;

        // Estimate item cost
        const prod = products.find((p) => p.product_id === item.product_id);
        const variant = prod?.variants?.find((v) => v.variant_id === item.variant_id);
        const costPrice = variant?.cost_price || Math.round(item.price * 0.6);
        totalCost += costPrice * item.quantity;
      });
    });

    // Check low stock variants
    const lowStockItems: any[] = [];
    products.forEach((p) => {
      (p.variants || []).forEach((v) => {
        const available = Math.max(0, v.stock - (v.reserved_stock || 0));
        if (available <= threshold) {
          lowStockItems.push({
            product_id: p.product_id,
            product_name: p.name,
            variant_id: v.variant_id,
            sku: v.sku,
            size: v.size,
            color: v.color,
            stock: v.stock,
            reserved_stock: v.reserved_stock,
            available_stock: available,
          });
        }
      });
    });

    const grossProfit = Math.max(0, totalRevenue - totalCost);
    const grossMarginPct = totalRevenue > 0 ? Math.round((grossProfit / totalRevenue) * 100) : 0;
    const avgOrderValue = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;

    const topProducts = Object.values(productSalesMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return {
      kpis: {
        today_revenue: todayRevenue,
        today_orders_count: todayOrdersCount,
        pending_orders_count: pendingCount,
        unpaid_orders_count: unpaidCount,
        low_stock_count: lowStockItems.length,
      },
      total_revenue: totalRevenue,
      total_orders: orders.length,
      avg_order_value: avgOrderValue,
      gross_profit: grossProfit,
      gross_margin_pct: grossMarginPct,
      top_products: topProducts,
      urgent_orders: urgentOrders.slice(0, 10),
      low_stock_items: lowStockItems,
    };
  }
}
