# 📡 ANH THƯ SNEAKER — API SPECIFICATION

> **RESTful API endpoints, request/response formats, status codes, and validation rules.**

---

## 1. Storefront APIs

### 1.1. Danh Sách Sản Phẩm
- **Endpoint:** `GET /api/products`
- **Query Parameters:**
  - `category`: Lọc theo ID danh mục (ví dụ: `cat_sneaker`).
  - `brand`: Lọc theo ID thương hiệu (ví dụ: `brand_nike`).
  - `search`: Từ khóa tìm kiếm theo tên hoặc mô tả.
  - `sort`: `newest` | `price_asc` | `price_desc` | `name_asc` | `featured`.
  - `is_sale`: `true` | `false`.
  - `has_3d`: `true` | `false`.
  - `size`: Lọc theo kích cỡ variant (ví dụ: `42`).
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "products": [...],
      "categories": [...],
      "brands": [...]
    }
  }
  ```

---

### 1.2. Chi Tiết Sản Phẩm
- **Endpoint:** `GET /api/products/[slug]`
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "product_id": "prod_1",
      "name": "Nike Air Jordan 1 Retro High OG 'Chicago'",
      "slug": "nike-air-jordan-1-retro-high-og-chicago",
      "price": 4850000,
      "variants": [...],
      "media": [
        { "type": "IMAGE", "url": "..." },
        { "type": "MODEL_3D", "url": "/models/sample-sneaker.glb" }
      ]
    }
  }
  ```

---

### 1.3. Tạo Đơn Hàng (Checkout)
- **Endpoint:** `POST /api/orders`
- **Request Body:**
  ```json
  {
    "customer_name": "Nguyễn Văn A",
    "customer_phone": "0912345678",
    "customer_email": "vana@example.com",
    "shipping_address": "Số 123 Đường Cầu Giấy",
    "shipping_city": "Hà Nội",
    "shipping_district": "Cầu Giấy",
    "shipping_ward": "Dịch Vọng Hậu",
    "customer_notes": "Giao giờ hành chính",
    "coupon_code": "ANHTHU10",
    "items": [
      {
        "product_id": "prod_1",
        "variant_id": "var_1_3",
        "quantity": 1
      }
    ]
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "order": {
        "order_id": "ATS-20260927-0001",
        "total_amount": 4395000,
        "status": "PENDING",
        "payment_status": "UNPAID"
      },
      "vietqr": {
        "qr_url": "https://img.vietqr.io/image/MBBANK-0987654321-compact2.png?amount=4395000&addInfo=ATS-20260927-0001",
        "account_no": "0987654321",
        "account_name": "NGUYEN THI ANH THU",
        "bank_name": "MBBANK",
        "amount": 4395000,
        "memo": "ATS-20260927-0001"
      }
    }
  }
  ```

---

### 1.4. Tra Cứu Đơn Hàng (Track Order)
- **Endpoint:** `POST /api/orders/track`
- **Request Body:**
  ```json
  {
    "order_id": "ATS-20260927-0001",
    "phone": "0912345678"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "order": { ... },
      "vietqr": { ... }
    }
  }
  ```

---

### 1.5. Kiểm Tra Mã Giảm Giá
- **Endpoint:** `POST /api/coupons/validate`
- **Request Body:**
  ```json
  {
    "code": "ANHTHU10",
    "subtotal": 2000000
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "valid": true,
      "discount_amount": 200000,
      "message": "Áp dụng giảm 10% thành công"
    }
  }
  ```

---

## 2. Admin APIs

### 2.1. Cập Nhật Trạng Thái & Chỉnh Sửa Đơn Hàng
- **Endpoint:** `PATCH /api/orders/[id]`
- **Request Body:**
  ```json
  {
    "status": "CONFIRMED",
    "payment_status": "PAID",
    "shipping_fee": 30000,
    "shipping_address": "Số 456 Giải Phóng",
    "reason": "Khách xác nhận đổi địa chỉ nhận hàng"
  }
  ```

### 2.2. Điều Chỉnh Kho Hàng (Inventory Adjustment)
- **Endpoint:** `POST /api/inventory/adjust`
- **Request Body:**
  ```json
  {
    "variant_id": "var_1_3",
    "change": 5,
    "reason": "RESTOCK",
    "note": "Nhập thêm đợt hàng mới cuối tuần"
  }
  ```

### 2.3. Bảng Điều Khiển Tổng Hợp (Dashboard Metrics)
- **Endpoint:** `GET /api/admin/dashboard`
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "today": {
        "revenue": 14500000,
        "orders_count": 5,
        "pending_orders": 2,
        "unpaid_orders": 2,
        "low_stock_count": 3
      },
      "urgent_orders": [...],
      "low_stock_variants": [...],
      "gross_profit": 5200000,
      "gross_margin": 35.8
    }
  }
  ```
