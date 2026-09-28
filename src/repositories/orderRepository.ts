import { IOrderRepository } from './interfaces';
import { Order, OrderItem, OrderStatusHistory } from '@/types/order';
import { DataStore } from './dataStore';
import { GoogleSheetsClient } from './googleSheetsClient';

export class OrderRepository implements IOrderRepository {
  private store = DataStore.getInstance();
  private sheetsClient = GoogleSheetsClient.getInstance();

  public async getAllOrders(): Promise<Order[]> {
    const orders = this.store.getOrders();
    const items = this.store.getOrderItems();
    const history = this.store.getOrderHistory();

    return orders.map((o) => ({
      ...o,
      items: items.filter((i) => i.order_id === o.order_id),
      history: history.filter((h) => h.order_id === o.order_id),
    }));
  }

  public async getOrderById(orderId: string): Promise<Order | null> {
    const orders = await this.getAllOrders();
    return orders.find((o) => o.order_id === orderId || o.order_number === orderId) || null;
  }

  public async getOrderByPhoneAndId(orderId: string, phone: string): Promise<Order | null> {
    const cleanPhone = phone.trim().replace(/^(\+84)/, '0');
    const order = await this.getOrderById(orderId.trim());
    if (!order) return null;

    const ordPhone = order.customer_phone.trim().replace(/^(\+84)/, '0');
    if (ordPhone === cleanPhone) {
      return order;
    }
    return null;
  }

  public async createOrder(order: Order, items: OrderItem[]): Promise<Order> {
    return this.store.acquireLock(async () => {
      const raw = this.store.getRawData();
      raw.orders.unshift(order);
      raw.orderItems.push(...items);

      const history: OrderStatusHistory = {
        history_id: `hist_${Date.now()}`,
        order_id: order.order_id,
        from_status: 'PENDING',
        to_status: 'PENDING',
        note: 'Đơn hàng được khởi tạo thành công',
        changed_by: 'Customer',
        created_at: new Date().toISOString(),
      };
      raw.orderHistory.push(history);

      // Add admin notification
      raw.notifications.unshift({
        notification_id: `notif_${Date.now()}`,
        title: 'Đơn hàng mới',
        message: `${order.customer_name} vừa đặt đơn ${order.order_id} (${order.total_amount.toLocaleString('vi-VN')}đ)`,
        type: 'ORDER',
        is_read: false,
        link: `/admin/orders?search=${order.order_id}`,
        created_at: new Date().toISOString(),
      });

      // Write to Google Sheets if live
      if (this.sheetsClient.isReady()) {
        this.sheetsClient.appendRow('Orders', [
          order.order_id,
          order.order_number,
          order.customer_id,
          order.customer_name,
          order.customer_phone,
          order.customer_email || '',
          order.shipping_address,
          order.shipping_city,
          order.shipping_district,
          order.shipping_ward,
          order.notes || '',
          order.subtotal,
          order.discount_amount,
          order.coupon_code || '',
          order.shipping_fee,
          order.total_amount,
          order.payment_method,
          order.payment_status,
          order.order_status,
          order.sales_channel,
          order.tracking_number || '',
          order.created_at,
          order.updated_at,
        ]);

        items.forEach((item) => {
          this.sheetsClient.appendRow('OrderItems', [
            item.item_id,
            item.order_id,
            item.product_id,
            item.variant_id,
            item.product_name,
            item.variant_title,
            item.sku,
            item.price,
            item.quantity,
            item.total,
          ]);
        });
      }

      return {
        ...order,
        items,
        history: [history],
      };
    });
  }

  public async updateOrderStatus(
    orderId: string,
    status: Order['order_status'],
    historyNote: string,
    changedBy: string
  ): Promise<Order> {
    return this.store.acquireLock(async () => {
      const raw = this.store.getRawData();
      const order = raw.orders.find((o) => o.order_id === orderId);
      if (!order) throw new Error(`Order ${orderId} not found`);

      const prevStatus = order.order_status;
      order.order_status = status;
      order.updated_at = new Date().toISOString();

      const hist: OrderStatusHistory = {
        history_id: `hist_${Date.now()}`,
        order_id: orderId,
        from_status: prevStatus,
        to_status: status,
        note: historyNote || `Chuyển trạng thái từ ${prevStatus} sang ${status}`,
        changed_by: changedBy,
        created_at: new Date().toISOString(),
      };
      raw.orderHistory.push(hist);

      // Write to Activity Logs
      raw.activityLogs.unshift({
        log_id: `act_${Date.now()}`,
        user_id: changedBy,
        action: 'STATUS_CHANGE',
        entity: 'ORDER',
        entity_id: orderId,
        before_state: prevStatus,
        after_state: status,
        reason: historyNote,
        created_at: new Date().toISOString(),
      });

      if (this.sheetsClient.isReady()) {
        this.sheetsClient.appendRow('OrderStatusHistory', [
          hist.history_id,
          hist.order_id,
          hist.from_status,
          hist.to_status,
          hist.note,
          hist.changed_by,
          hist.created_at,
        ]);
      }

      const items = raw.orderItems.filter((i) => i.order_id === orderId);
      const history = raw.orderHistory.filter((h) => h.order_id === orderId);
      return { ...order, items, history };
    });
  }

  public async updateOrderPayment(
    orderId: string,
    status: Order['payment_status'],
    txRef?: string
  ): Promise<Order> {
    return this.store.acquireLock(async () => {
      const raw = this.store.getRawData();
      const order = raw.orders.find((o) => o.order_id === orderId);
      if (!order) throw new Error(`Order ${orderId} not found`);

      const prevPayment = order.payment_status;
      order.payment_status = status;
      order.updated_at = new Date().toISOString();

      if (status === 'PAID' && order.order_status === 'PENDING') {
        order.order_status = 'CONFIRMED';
      }

      raw.activityLogs.unshift({
        log_id: `act_${Date.now()}`,
        user_id: 'Admin',
        action: 'UPDATE',
        entity: 'ORDER',
        entity_id: orderId,
        before_state: prevPayment,
        after_state: status,
        reason: txRef ? `Xác nhận chuyển khoản. Mã GD: ${txRef}` : 'Cập nhật trạng thái thanh toán',
        created_at: new Date().toISOString(),
      });

      const items = raw.orderItems.filter((i) => i.order_id === orderId);
      const history = raw.orderHistory.filter((h) => h.order_id === orderId);
      return { ...order, items, history };
    });
  }

  public async updateOrder(orderId: string, updates: Partial<Order>): Promise<Order> {
    return this.store.acquireLock(async () => {
      const raw = this.store.getRawData();
      const idx = raw.orders.findIndex((o) => o.order_id === orderId);
      if (idx === -1) throw new Error(`Order ${orderId} not found`);

      raw.orders[idx] = {
        ...raw.orders[idx],
        ...updates,
        updated_at: new Date().toISOString(),
      };

      const items = raw.orderItems.filter((i) => i.order_id === orderId);
      const history = raw.orderHistory.filter((h) => h.order_id === orderId);
      return { ...raw.orders[idx], items, history };
    });
  }

  public async getOrderItems(orderId: string): Promise<OrderItem[]> {
    return this.store.getOrderItems().filter((i) => i.order_id === orderId);
  }

  public async getOrderHistory(orderId: string): Promise<OrderStatusHistory[]> {
    return this.store.getOrderHistory().filter((h) => h.order_id === orderId);
  }

  public async addStatusHistory(history: OrderStatusHistory): Promise<void> {
    return this.store.acquireLock(async () => {
      this.store.getRawData().orderHistory.push(history);
    });
  }
}
