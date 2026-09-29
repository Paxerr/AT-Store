import { OrderRepository } from '@/repositories/orderRepository';
import { ProductRepository } from '@/repositories/productRepository';
import { CustomerRepository } from '@/repositories/customerRepository';
import { SettingsRepository } from '@/repositories/settingsRepository';
import { InventoryService } from './inventoryService';
import { CouponService } from './couponService';
import { PaymentService } from './paymentService';
import { Order, OrderItem, OrderStatus } from '@/types/order';
import { checkoutSchema, orderStatusUpdateSchema, orderEditSchema } from '@/schemas/orderSchema';

export class OrderService {
  private orderRepo: OrderRepository;
  private productRepo: ProductRepository;
  private customerRepo: CustomerRepository;
  private settingsRepo: SettingsRepository;
  private inventoryService: InventoryService;
  private couponService: CouponService;
  private paymentService: PaymentService;

  constructor() {
    this.orderRepo = new OrderRepository();
    this.productRepo = new ProductRepository();
    this.customerRepo = new CustomerRepository();
    this.settingsRepo = new SettingsRepository();
    this.inventoryService = new InventoryService();
    this.couponService = new CouponService();
    this.paymentService = new PaymentService();
  }

  private generateOrderId(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `ATS-${year}${month}${day}-${randomSuffix}`;
  }

  public async createOrder(rawPayload: any) {
    // 1. Zod Validation
    const validated = checkoutSchema.parse(rawPayload);

    // 2. Fetch real prices and verify variants
    const verifiedItems: OrderItem[] = [];
    let subtotal = 0;

    for (const item of validated.items) {
      const variant = await this.productRepo.getVariantById(item.variant_id);
      if (!variant) {
        throw new Error(`Sản phẩm hoặc biến thể "${item.product_name}" không tồn tại`);
      }

      const product = await this.productRepo.getProductById(variant.product_id);
      const stockInfo = await this.inventoryService.getVariantStock(variant.variant_id);

      if (stockInfo.available_stock < item.quantity) {
        throw new Error(
          `Sản phẩm "${product?.name || item.product_name}" (${variant.size}) chỉ còn ${stockInfo.available_stock} đôi trong kho. Không đủ đáp ứng số lượng ${item.quantity}.`
        );
      }

      const realPrice = variant.price;
      const lineTotal = realPrice * item.quantity;
      subtotal += lineTotal;

      verifiedItems.push({
        item_id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        order_id: '', // filled below
        product_id: variant.product_id,
        variant_id: variant.variant_id,
        product_name: product?.name || item.product_name,
        variant_title: `${variant.size}${variant.color ? ` - ${variant.color}` : ''}`,
        sku: variant.sku,
        price: realPrice,
        quantity: item.quantity,
        total: lineTotal,
        image: variant.image || item.image,
      });
    }

    // 3. Calculate Coupon Discount
    let discountAmount = 0;
    let appliedCouponCode: string | undefined = undefined;

    if (validated.coupon_code && validated.coupon_code.trim()) {
      const couponRes = await this.couponService.validateCoupon(
        validated.coupon_code,
        subtotal,
        validated.customer_phone
      );
      if (couponRes.valid) {
        discountAmount = couponRes.discount_amount;
        appliedCouponCode = couponRes.coupon?.coupon_code;
      }
    }

    // 4. Get shipping fee from settings (0đ for POS or orders >= 1.000.000đ)
    const settings = await this.settingsRepo.getSettings();
    const isFreeShipping = subtotal >= 1000000;
    const shippingFee = validated.sales_channel === 'POS' || isFreeShipping ? 0 : (settings.SHIPPING_FEE ?? 30000);

    // 5. Calculate Final Total
    const totalAmount = Math.max(0, subtotal - discountAmount + shippingFee);

    // 6. Atomically Reserve Inventory
    const reservationItems = verifiedItems.map((i) => ({
      variant_id: i.variant_id,
      quantity: i.quantity,
    }));
    const reservationResult = await this.inventoryService.reserveItems(reservationItems);

    if (!reservationResult.success) {
      throw new Error(
        'Rất tiếc! Một số sản phẩm trong giỏ hàng vừa có khách khác đặt trước. Vui lòng kiểm tra lại giỏ hàng.'
      );
    }

    // If POS in-store cash sale, directly finalize stock deduction
    if (validated.sales_channel === 'POS' && validated.payment_method === 'CASH') {
      await this.inventoryService.finalizeItems(reservationItems);
    }

    // 7. Generate Order ID
    const orderId = this.generateOrderId();
    verifiedItems.forEach((i) => (i.order_id = orderId));

    // 8. Create / Update Customer Record
    const customer = await this.customerRepo.createOrUpdateCustomer({
      name: validated.customer_name,
      phone: validated.customer_phone,
      email: validated.customer_email || '',
      address: validated.shipping_address,
      city: validated.shipping_city,
      district: validated.shipping_district,
      ward: validated.shipping_ward,
      notes: validated.notes || '',
      total_spent: totalAmount,
    });

    // 9. Record coupon usage if applied
    if (appliedCouponCode) {
      const coupon = await this.couponService.validateCoupon(appliedCouponCode, subtotal);
      if (coupon.coupon) {
        await this.couponService.recordUsage(
          coupon.coupon.coupon_id,
          orderId,
          validated.customer_phone,
          discountAmount
        );
      }
    }

    const isPosCash = validated.sales_channel === 'POS' && validated.payment_method === 'CASH';

    // 10. Create Order entity
    const newOrder: Order = {
      order_id: orderId,
      order_number: orderId,
      customer_id: customer.customer_id,
      customer_name: validated.customer_name,
      customer_phone: validated.customer_phone,
      customer_email: validated.customer_email || '',
      shipping_address: validated.shipping_address,
      shipping_city: validated.shipping_city,
      shipping_district: validated.shipping_district,
      shipping_ward: validated.shipping_ward,
      notes: validated.notes || '',
      subtotal,
      discount_amount: discountAmount,
      coupon_code: appliedCouponCode,
      shipping_fee: shippingFee,
      total_amount: totalAmount,
      payment_method: validated.payment_method,
      payment_status: isPosCash ? 'PAID' : 'UNPAID',
      order_status: isPosCash ? 'DELIVERED' : validated.sales_channel === 'POS' ? 'CONFIRMED' : 'PENDING',
      sales_channel: validated.sales_channel,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const savedOrder = await this.orderRepo.createOrder(newOrder, verifiedItems);

    // 11. Generate VietQR payment info
    const qrInfo = await this.paymentService.generateVietQr(orderId, totalAmount);

    return {
      order: savedOrder,
      vietqr: qrInfo,
    };
  }

  public async updateOrderStatus(
    orderId: string,
    nextStatus: OrderStatus,
    note: string,
    changedBy = 'Admin'
  ) {
    const order = await this.orderRepo.getOrderById(orderId);
    if (!order) throw new Error(`Đơn hàng ${orderId} không tồn tại`);

    const prevStatus = order.order_status;
    const items = order.items || [];

    // State machine side effects:
    // If order is cancelled, release reserved stock
    if (nextStatus === 'CANCELLED' && prevStatus !== 'CANCELLED') {
      const releaseList = items.map((i) => ({ variant_id: i.variant_id, quantity: i.quantity }));
      await this.inventoryService.releaseItems(releaseList);
    }

    // If order was cancelled and is reopened, re-reserve
    if (prevStatus === 'CANCELLED' && nextStatus !== 'CANCELLED') {
      const reserveList = items.map((i) => ({ variant_id: i.variant_id, quantity: i.quantity }));
      await this.inventoryService.reserveItems(reserveList);
    }

    // If order is completed/delivered, finalize stock deduction
    if (nextStatus === 'DELIVERED' && prevStatus !== 'DELIVERED') {
      const finalizeList = items.map((i) => ({ variant_id: i.variant_id, quantity: i.quantity }));
      await this.inventoryService.finalizeItems(finalizeList);
    }

    return this.orderRepo.updateOrderStatus(orderId, nextStatus, note, changedBy);
  }

  public async confirmPayment(orderId: string, txRef?: string, changedBy = 'Admin') {
    return this.orderRepo.updateOrderPayment(orderId, 'PAID', txRef);
  }

  public async editOrder(orderId: string, payload: any, operator = 'Admin') {
    const validated = orderEditSchema.parse(payload);
    const order = await this.orderRepo.getOrderById(orderId);
    if (!order) throw new Error(`Đơn hàng ${orderId} không tồn tại`);

    const updates: Partial<Order> = {};
    if (validated.customer_name) updates.customer_name = validated.customer_name;
    if (validated.customer_phone) updates.customer_phone = validated.customer_phone;
    if (validated.shipping_address) updates.shipping_address = validated.shipping_address;
    if (validated.shipping_city) updates.shipping_city = validated.shipping_city;
    if (validated.shipping_district) updates.shipping_district = validated.shipping_district;
    if (validated.shipping_ward) updates.shipping_ward = validated.shipping_ward;
    if (validated.notes !== undefined) updates.notes = validated.notes;

    if (validated.shipping_fee !== undefined) {
      updates.shipping_fee = validated.shipping_fee;
      updates.total_amount = Math.max(0, order.subtotal - (order.discount_amount || 0) + validated.shipping_fee);
    }

    return this.orderRepo.updateOrder(orderId, updates);
  }

  public async getOrderById(orderId: string) {
    return this.orderRepo.getOrderById(orderId);
  }

  public async getAllOrders() {
    return this.orderRepo.getAllOrders();
  }

  public async trackOrder(orderId: string, phone: string) {
    return this.orderRepo.getOrderByPhoneAndId(orderId, phone);
  }
}
