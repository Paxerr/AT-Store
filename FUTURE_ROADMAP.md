# 🗺️ ANH THƯ SNEAKER — FUTURE ROADMAP & SCALING BLUEPRINT

> **Evolutionary roadmap: Migration to PostgreSQL/Supabase, Logistics API Integrations, Automated Payment Gateways, and WebAR.**

---

## 1. Lộ Trình Phát Triển Theo Giai Đoạn

```text
  ┌─────────────────────────┐
  │         V1.0.0          │
  │   (CURRENT RELEASE)     │
  │ • Solo Admin Workflow   │
  │ • Google Sheets Sync    │
  │ • VietQR Bank Transfer  │
  │ • Three.js 3D Viewer    │
  │ • In-Memory Mutex Stock │
  └───────────┬─────────────┘
              │
              ▼
  ┌─────────────────────────┐
  │         V2.0.0          │
  │    (SCALE & AUTOMATE)   │
  │ • PostgreSQL / Supabase │
  │ • Auto Bank Webhook     │
  │ • Carrier APIs (GHN/GHTK│
  │ • WebAR (USDZ QuickLook)│
  └───────────┬─────────────┘
              │
              ▼
  ┌─────────────────────────┐
  │         V3.0.0          │
  │     (OMNICHANNEL)       │
  │ • Zalo OA Chatbot Notif │
  │ • Loyalty & Points      │
  │ • AI Size Fitting       │
  │ • Multi-branch POS      │
  └─────────────────────────┘
```

---

## 2. Kế Hoạch Di Trú Dữ Liệu: Google Sheets $\to$ PostgreSQL / Supabase

Nhờ áp dụng triệt để mô hình **Repository Pattern**, toàn bộ logic nghiệp vụ (Order, Product, Inventory, Coupon) đều giao tiếp thông qua Interface (`IProductRepository`, `IOrderRepository`...).

Khi số lượng giao dịch của Anh Thư Sneaker vượt mốc 500 đơn/ngày:
1. Tạo database PostgreSQL trên Supabase hoặc AWS RDS.
2. Viết class `PostgresOrderRepository implements IOrderRepository` bằng Prisma hoặc Kysely.
3. Thay đổi binding trong Service Layer mà không cần sửa bất kỳ dòng code giao diện nào.

---

## 3. Tích Hợp Đơn Vị Vận Chuyển V2 (Logistics APIs)

Trong phiên bản V2, hệ thống sẽ kết nối trực tiếp với các đơn vị vận chuyển hàng đầu tại Việt Nam:
- **Giao Hàng Nhanh (GHN):** Tự động đẩy đơn hàng, in vận đơn có mã vạch barcode, cập nhật trạng thái giao hàng theo thời gian thực (Webhook).
- **Giao Hàng Tiết Kiệm (GHTK):** Lấy danh mục địa giới hành chính tự động và tính cước phí chính xác theo trọng lượng giày.
- **Viettel Post & J&T Express:** Đa dạng hóa lựa chọn tối ưu chi phí cho shop.

---

## 4. Tự Động Hóa Xác Nhận Thanh Toán (Bank Webhook)

- Tích hợp cổng thanh toán hoặc dịch vụ Webhook thông báo số dư tài khoản ngân hàng (như SeAPay / Casso).
- Khi khách chuyển khoản đúng mã `ATS-YYYYMMDD-XXXX`, hệ thống tự động:
  1. Đổi trạng thái đơn hàng thành `PAID` và `CONFIRMED`.
  2. Gửi tin nhắn Zalo ZNS / SMS tự động thông báo cho khách hàng.
  3. Bắn thông báo đẩy (Push Notification) đến điện thoại của chủ shop.

---

## 5. Nâng Cấp WebAR & Thử Giày Ảo (Virtual Try-On)

- Tích hợp định dạng `.usdz` để kích hoạt tính năng **AR Quick Look** trên iPhone / iPad (khách hàng có thể đặt đôi giày ảo vào phòng khách hoặc cạnh chân để ướm thử kích cỡ trước khi mua).
- Tích hợp WebXR và mô hình thị giác máy tính (Computer Vision) để nhận diện bàn chân và đo size giày tự động.
