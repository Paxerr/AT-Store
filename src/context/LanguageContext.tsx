'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type Language = 'vi' | 'en';

export const translations = {
  vi: {
    // Navigation
    home: 'Trang chủ',
    sneaker: 'Sneaker',
    shoes: 'Giày',
    clothing: 'Quần áo',
    accessories: 'Phụ kiện',
    sale: 'Sale 🔥',
    cart: 'Giỏ hàng',
    track_order: 'Tra cứu đơn hàng',
    search_placeholder: 'Tìm sneaker, giày, quần áo, phụ kiện...',
    open_store: 'Mở Website Bán Hàng',
    seller_portal: 'Kênh Người Bán',
    admin_title: 'ANH THƯ ADMIN',
    system_active: 'HỆ THỐNG HOẠT ĐỘNG',
    admin_area: 'Khu vực Quản trị & Điều hành • Anh Thư Sneaker',
    shop_owner: 'Chủ shop',

    // Admin Sidebar Groups & Menus
    overview: 'Tổng quan',
    dashboard: 'Bảng điều khiển',
    pos: 'Tạo đơn nhanh (POS)',
    sales_orders: 'Bán hàng & Đơn hàng',
    orders: 'Đơn hàng',
    customers: 'Khách hàng',
    coupons: 'Mã giảm giá',
    inventory_products: 'Kho & Sản phẩm',
    all_products: 'Tất cả sản phẩm',
    add_product: 'Thêm sản phẩm mới',
    inventory_adjust: 'Tồn kho & Điều chỉnh',
    settings_logs: 'Cấu hình & Nhật ký',
    shop_settings: 'Cài đặt cửa hàng',
    audit_logs: 'Nhật ký hoạt động',

    // Dashboard
    greeting: 'Xin chào, Anh Thư 👋',
    dashboard_desc: 'Dưới đây là tóm tắt kinh doanh hôm nay và các đơn hàng cần bạn xử lý.',
    today_revenue: 'Doanh thu hôm nay',
    today_orders: 'Đơn hàng hôm nay',
    pending_orders: 'Chờ xử lý / Đóng gói',
    unpaid_orders: 'Chưa thanh toán',
    low_stock: 'Sắp hết hàng',
    quick_pos_btn: 'Tạo đơn tại quầy / chat (POS)',
    add_prod_btn: 'Thêm sản phẩm',
    total_acc_revenue: 'Tổng doanh thu tích lũy',
    gross_profit: 'Lợi nhuận gộp ước tính (Gross Profit)',
    total_orders_all: 'Tổng số đơn hàng',
    total_customers: 'Khách hàng trong hệ thống',
    gross_margin_pct: 'Tỷ suất lợi nhuận gộp (Margin)',
    avg_order_val: 'Giá trị đơn trung bình (AOV)',
    orders_unit: 'đơn',
    items_unit: 'mục',
    pairs_unit: 'đôi',
    recent_orders: 'Đơn Hàng Cần Xử Lý',
    recent_orders_desc: 'Danh sách các đơn mới phát sinh từ website, POS và các kênh mạng xã hội.',
    view_all_orders: 'Xem tất cả',
    urgent_orders_title: 'Đơn hàng cần xử lý',
    low_stock_title: 'Cảnh báo sắp hết hàng',
    inventory_link: 'Kho hàng',
    no_urgent_orders: 'Tuyệt vời! Không có đơn hàng nào tồn đọng cần xử lý.',
    stock_abundant: 'Kho hàng dồi dào, không có mẫu nào chạm ngưỡng cảnh báo.',
    action_btn: 'Xử lý',

    // Orders page
    order_management: 'Quản Lý Đơn Hàng',
    order_desc: 'Theo dõi, duyệt đơn, xác nhận chuyển khoản và điều phối giao hàng.',
    search_orders_ph: 'Tìm mã đơn (ATS-...), tên khách, số điện thoại...',
    all_statuses: 'Tất cả trạng thái',
    all_payments: 'Tất cả thanh toán',
    order_id: 'MÃ ĐƠN HÀNG',
    customer: 'KHÁCH HÀNG',
    channel: 'KÊNH BÁN',
    total: 'TỔNG TIỀN',
    payment: 'THANH TOÁN',
    status: 'TRẠNG THÁI',
    actions: 'THAO TÁC',
    detail: 'Chi tiết',
    approve_order: 'Duyệt đơn hàng (CONFIRMED)',
    pack_order: 'Chuyển sang đóng gói',
    ship_order: 'Đã gửi bưu tá (SHIPPED)',
    deliver_order: 'Hoàn tất đơn (DELIVERED)',
    cancel_order: 'Hủy đơn & Trả kho',
    confirm_payment_btn: 'Xác nhận đã nhận tiền (PAID)',
    order_detail_title: 'Chi tiết đơn',

    // Theme & Lang
    theme_light: 'Theme Sáng',
    theme_dark: 'Theme Tối',
    language: 'Ngôn ngữ',

    // Common Buttons
    save: 'Lưu thay đổi',
    cancel: 'Hủy',
    delete: 'Xóa',
    edit: 'Chỉnh sửa',
    close: 'Đóng',
    confirm: 'Xác nhận',
    loading: 'Đang tải...',
    back: 'Quay lại',
  },
  en: {
    // Navigation
    home: 'Home',
    sneaker: 'Sneakers',
    shoes: 'Shoes',
    clothing: 'Apparel',
    accessories: 'Accessories',
    sale: 'Sale 🔥',
    cart: 'Cart',
    track_order: 'Track Order',
    search_placeholder: 'Search sneakers, shoes, apparel, accessories...',
    open_store: 'Open Storefront',
    seller_portal: 'Seller Portal',
    admin_title: 'ANH THU ADMIN',
    system_active: 'SYSTEM ONLINE',
    admin_area: 'Management & Operations • Anh Thu Sneaker',
    shop_owner: 'Owner',

    // Admin Sidebar Groups & Menus
    overview: 'Overview',
    dashboard: 'Dashboard',
    pos: 'Point of Sale (POS)',
    sales_orders: 'Sales & Orders',
    orders: 'Orders',
    customers: 'Customers',
    coupons: 'Discount Codes',
    inventory_products: 'Inventory & Catalog',
    all_products: 'All Products',
    add_product: 'Add New Product',
    inventory_adjust: 'Inventory & Adjustments',
    settings_logs: 'Settings & Audit',
    shop_settings: 'Store Settings',
    audit_logs: 'Audit Logs',

    // Dashboard
    greeting: 'Welcome back, Anh Thu 👋',
    dashboard_desc: 'Here is today business summary and pending orders for fulfillment.',
    today_revenue: "Today's Revenue",
    today_orders: "Today's Orders",
    pending_orders: 'Pending / Packing',
    unpaid_orders: 'Unpaid Orders',
    low_stock: 'Low Stock Alert',
    quick_pos_btn: 'Create POS / Chat Order',
    add_prod_btn: 'Add Product',
    total_acc_revenue: 'Total Accumulated Revenue',
    gross_profit: 'Estimated Gross Profit',
    total_orders_all: 'Total Orders',
    total_customers: 'Registered Customers',
    gross_margin_pct: 'Gross Profit Margin',
    avg_order_val: 'Average Order Value (AOV)',
    orders_unit: 'orders',
    items_unit: 'items',
    pairs_unit: 'pairs',
    recent_orders: 'Orders Requiring Action',
    recent_orders_desc: 'Recent orders from website storefront, POS, and social channels.',
    view_all_orders: 'View All',
    urgent_orders_title: 'Orders Requiring Action',
    low_stock_title: 'Low Stock Warnings',
    inventory_link: 'Inventory',
    no_urgent_orders: 'Great! No urgent orders pending right now.',
    stock_abundant: 'Warehouse is healthy, no products hit low stock threshold.',
    action_btn: 'Process',

    // Orders page
    order_management: 'Order Management',
    order_desc: 'Monitor, approve orders, verify bank transfers, and coordinate fulfillment.',
    search_orders_ph: 'Search Order ID (ATS-...), customer name, phone...',
    all_statuses: 'All Statuses',
    all_payments: 'All Payments',
    order_id: 'ORDER ID',
    customer: 'CUSTOMER',
    channel: 'CHANNEL',
    total: 'TOTAL',
    payment: 'PAYMENT',
    status: 'STATUS',
    actions: 'ACTIONS',
    detail: 'Details',
    approve_order: 'Approve Order (CONFIRMED)',
    pack_order: 'Start Packing (PROCESSING)',
    ship_order: 'Dispatched to Courier (SHIPPED)',
    deliver_order: 'Order Delivered (DELIVERED)',
    cancel_order: 'Cancel & Restock',
    confirm_payment_btn: 'Confirm Payment (PAID)',
    order_detail_title: 'Order Details',

    // Theme & Lang
    theme_light: 'Light Theme',
    theme_dark: 'Dark Theme',
    language: 'Language',

    // Common Buttons
    save: 'Save Changes',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
    confirm: 'Confirm',
    loading: 'Loading...',
    back: 'Back',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: keyof typeof translations['vi'], fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('vi');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('ats_lang') as Language | null;
      if (saved === 'vi' || saved === 'en') {
        setLanguageState(saved);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('ats_lang', lang);
    } catch (e) {
      // ignore
    }
  };

  const toggleLanguage = () => {
    const nextLang: Language = language === 'vi' ? 'en' : 'vi';
    setLanguage(nextLang);
  };

  const t = (key: keyof typeof translations['vi'], fallback?: string): string => {
    const dict = translations[language] || translations['vi'];
    return (dict as any)[key] || fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
