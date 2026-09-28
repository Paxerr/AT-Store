# 👟 ANH THƯ SNEAKER — Production E-Commerce Platform

> **Modern Sneaker & Apparel Store with Interactive 3D WebGL, Google Sheets Relational Persistence, VietQR Banking, and Solo-Operator Admin Suite.**

---

## 🌟 Tổng Quan Dự Án

**Anh Thư Sneaker** là nền tảng thương mại điện tử chuyên nghiệp được thiết kế theo tiêu chuẩn Production, tối ưu đặc biệt cho **mô hình 1 người vận hành**:
- **Storefront hiện đại:** Giao diện Dark Mode sang trọng, micro-animations mượt mà, tối ưu Mobile-first, chuẩn SEO & WCAG.
- **Interactive 3D WebGL:** Trải nghiệm xem giày 3D xoay 360°, zoom, góc nhìn đặt trước (Front, Side, Top, Back), tải lười (lazy load) không ảnh hưởng tốc độ tải trang ban đầu, tự động fallback ảnh nếu thiết bị yếu.
- **Thanh toán VietQR chuẩn xác:** Tự động tạo mã QR VietQR kèm cú pháp chuyển khoản định danh đơn hàng (`ATS-YYYYMMDD-XXXX`), hướng dẫn khách hàng rõ ràng.
- **Chống bán vượt tồn kho (Anti-Overselling):** Quản lý tồn kho theo công thức `available_stock = stock - reserved_stock`, giữ kho nguyên tử (mutex reservation) khi khách đặt hàng.
- **Quản trị Solo-Operator:** Bảng điều khiển hôm nay (Doanh thu, Đơn hàng, Chờ xử lý, Chưa thanh toán, Sắp hết hàng), Gross Profit (COGS), Quản lý đơn hàng, POS tạo đơn nhanh qua Facebook/Zalo, Quản lý kho có lý do kiểm kê, và Nhật ký hoạt động (Audit Trail).
- **Google Sheets Persistence Layer:** Sử dụng kiến trúc Repository Pattern tách biệt 100% logic nghiệp vụ khỏi tầng dữ liệu, có cơ chế Local JSON DataStore song hành giúp hệ thống hoạt động ổn định và sẵn sàng chuyển đổi sang PostgreSQL/Supabase bất kỳ lúc nào.

---

## 🏗 Kiến Trúc Hệ Thống (Separation of Concerns)

```text
[ Browser / Customer UI ]       [ Admin Control Panel ]
           │                                │
           ▼                                ▼
┌────────────────────────────────────────────────────────┐
│               Next.js App Router (v14)                 │
│         API Routes & Server-Side Controllers          │
├────────────────────────────────────────────────────────┤
│                    Service Layer                       │
│  - ProductService           - InventoryService (Mutex) │
│  - OrderService             - PaymentService (VietQR)  │
│  - CouponService            - AnalyticsService (COGS)  │
├────────────────────────────────────────────────────────┤
│                   Repository Layer                     │
│  - ProductRepository        - OrderRepository          │
│  - InventoryRepository      - CustomerRepository       │
│  - CouponRepository         - ActivityLogRepository    │
├────────────────────────────────────────────────────────┤
│           Dual Persistence Abstraction                 │
│  • Google Sheets API v4 (Official Cloud Relational)    │
│  • Local Thread-Safe JSON DataStore (Instant Fallback) │
└────────────────────────────────────────────────────────┘
```

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy

### 1. Yêu Cầu Môi Trường
- **Node.js:** v18.17.0 trở lên (khuyên dùng Node.js v20 LTS).
- **Trình quản lý gói:** `npm` hoặc `pnpm`.

### 2. Cài Đặt Thư Viện
```bash
npm install
```

### 3. Cấu Hình Biến Môi Trường (`.env.local`)
Copy file `.env.example` thành `.env.local`:
```bash
cp .env.example .env.local
```

Nội dung `.env.local`:
```env
PORT=3000
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Google Sheets Configuration (Tùy chọn - nếu để trống sẽ tự dùng Local DataStore)
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_PRIVATE_KEY=""
GOOGLE_SHEET_ID=

# Shop Public Placeholder Settings
SHOP_NAME="Anh Thư Sneaker"
BANK_NAME="MBBANK"
BANK_ACCOUNT_NUMBER="0987654321"
BANK_ACCOUNT_NAME="NGUYEN THI ANH THU"
DEFAULT_SHIPPING_FEE=30000
DELIVERY_ESTIMATE="3–5 ngày"
```

### 4. Build & Chạy Ứng Dụng
```bash
# Build production bundle
npm run build

# Khởi chạy production server
npm run start
```

Truy cập website tại: `http://localhost:3000`  
Truy cập trang Quản trị tại: `http://localhost:3000/admin`

---

## 📂 Danh Mục Tài Liệu Hệ Thống

Dự án cung cấp bộ tài liệu kỹ thuật đầy đủ theo yêu cầu:
1. [`PROJECT_AUDIT.md`](./PROJECT_AUDIT.md): Báo cáo kiểm định hiện trạng và định hướng giải pháp.
2. [`ARCHITECTURE.md`](./ARCHITECTURE.md): Kiến trúc phân tầng, State Machine đơn hàng và cơ chế khóa kho.
3. [`DATABASE_SCHEMA.md`](./DATABASE_SCHEMA.md): Đặc tả chi tiết 32 bảng/sheet dữ liệu.
4. [`GOOGLE_SHEETS_SETUP.md`](./GOOGLE_SHEETS_SETUP.md): Hướng dẫn kết nối Google Cloud Service Account.
5. [`BUSINESS_LOGIC.md`](./BUSINESS_LOGIC.md): Quy trình nghiệp vụ cốt lõi, công thức tính toán và ràng buộc.
6. [`API_SPEC.md`](./API_SPEC.md): Đặc tả danh sách API endpoints, request/response schema.
7. [`UX_SPEC.md`](./UX_SPEC.md): Nguyên tắc thiết kế trải nghiệm người dùng Mobile-first và Solo Admin.
8. [`UI_SYSTEM.md`](./UI_SYSTEM.md): Bảng mã Design Tokens, Typography, Bảng màu và Component UI.
9. [`3D_SYSTEM.md`](./3D_SYSTEM.md): Kiến trúc Interactive 3D WebGL (Three.js), Lazy Load và Controls.
10. [`SEO_GUIDE.md`](./SEO_GUIDE.md): Cấu hình Rich Snippets, JSON-LD, Sitemap và OpenGraph.
11. [`SECURITY.md`](./SECURITY.md): Chính sách bảo mật dữ liệu, chống giả mạo giá tiền và kiểm duyệt đầu vào.
12. [`DEPLOYMENT.md`](./DEPLOYMENT.md): Hướng dẫn triển khai lên Vercel, Docker và VPS.
13. [`TEST_PLAN.md`](./TEST_PLAN.md): Kế hoạch kiểm thử Unit, Integration và E2E scenarios.
14. [`FUTURE_ROADMAP.md`](./FUTURE_ROADMAP.md): Lộ trình nâng cấp AR, API đơn vị vận chuyển và Payment Gateway.

---

## 🛡️ Tác Quyền & Cam Kết
Được thiết kế và lập trình với tiêu chuẩn khắt khe: **Không demo giả lập, nghiệp vụ thực tế, mã nguồn chuẩn mực, sẵn sàng vận hành thương mại cho Anh Thư Sneaker.**
