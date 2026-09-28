# 🎨 ANH THƯ SNEAKER — UI DESIGN SYSTEM

> **Design Tokens, Typography, Dark Mode Palette, Components, and Accessibility Standards.**

---

## 1. Triết Lý Thẩm Mỹ (Design Philosophy)

Giao diện **Anh Thư Sneaker** mang phong cách **Premium Streetwear & Contemporary Luxury**:
- Nền đen than chì (`#0b0d11`) và các lớp bề mặt kính xám khói sang trọng (`rgba(22, 27, 34, 0.75)`).
- Màu nhấn (Accent) đỏ cam sneaker rực lửa (`#ff462e` / `#ff6b4a`) kích thích hành vi mua sắm.
- Bố cục thông thoáng, lưới hiển thị hình ảnh sản phẩm lớn, font chữ không chân hiện đại.

---

## 2. Bảng Màu Chuẩn (Color Tokens)

```css
:root {
  /* Surfaces */
  --bg-primary: #0b0d11;       /* Nền đen sâu chủ đạo */
  --bg-secondary: #12161f;     /* Khối thẻ sản phẩm, dropdown */
  --bg-tertiary: #1a202c;      /* Khối hover, thanh tìm kiếm */
  --bg-glass: rgba(18, 22, 31, 0.85); /* Hiệu ứng kính mờ (Backdrop filter) */

  /* Borders */
  --border-subtle: rgba(255, 255, 255, 0.08);
  --border-medium: rgba(255, 255, 255, 0.16);
  --border-strong: rgba(255, 255, 255, 0.28);

  /* Typography */
  --text-primary: #f8fafc;     /* Chữ trắng ngà có độ tương phản cao */
  --text-secondary: #cbd5e1;   /* Chữ phụ, mô tả ngắn */
  --text-muted: #94a3b8;       /* Chú thích, thông số kỹ thuật */
  --text-dim: #64748b;         /* Placeholder, trạng thái disable */

  /* Accents & Brand */
  --accent-primary: #ff462e;   /* Đỏ cam thể thao (Primary CTA) */
  --accent-hover: #ff604b;
  --accent-glow: rgba(255, 70, 46, 0.35);

  /* Status Colors */
  --status-success: #10b981;   /* Đã thanh toán, còn hàng, hoàn thành */
  --status-warning: #f59e0b;   /* Chờ xác nhận, sắp hết hàng */
  --status-danger: #ef4444;    /* Hết hàng, hủy đơn, lỗi */
  --status-info: #3b82f6;      /* Đang giao hàng, thông báo mới */
}
```

---

## 3. Kiểu Chữ (Typography Scale)

Sử dụng Google Font **`Plus Jakarta Sans`** — phông chữ hiện đại, hình học sắc sảo, tối ưu hiển thị trên màn hình Retina & OLED:
- **Display 1 (Hero Title):** `3.5rem (56px)`, line-height `1.1`, weight `800`, tracking `-0.03em`.
- **Heading 1:** `2.25rem (36px)`, line-height `1.2`, weight `800`.
- **Heading 2:** `1.75rem (28px)`, line-height `1.25`, weight `700`.
- **Heading 3:** `1.25rem (20px)`, line-height `1.3`, weight `700`.
- **Body Large:** `1.125rem (18px)`, line-height `1.6`, weight `400`.
- **Body Regular:** `0.9375rem (15px)`, line-height `1.5`, weight `400`.
- **Caption / Meta:** `0.75rem (12px)`, line-height `1.4`, weight `500`, tracking `0.02em`.

---

## 4. Thư Viện Thành Phần Cốt Lõi (Core UI Components)

### 4.1. Nút Bấm (Buttons)
- `.btn`: Base style với bo góc `var(--radius-md) = 10px`, transition mượt `0.2s cubic-bezier`.
- `.btn-primary`: Nền `--accent-primary`, chữ trắng, shadow phát sáng khi hover.
- `.btn-secondary`: Nền `--bg-tertiary`, viền `--border-subtle`, hover làm sáng viền.
- `.btn-outline`: Trong suốt, viền mỏng `--border-medium`, chữ `--text-primary`.

### 4.2. Thẻ Sản Phẩm (Product Card)
- Khung tỷ lệ vàng `3:4` cho hình ảnh sneaker.
- Chế độ hiển thị 2 ảnh: Ảnh chính tự động trượt mượt sang ảnh góc thứ 2 khi hover chuột.
- Huy hiệu nổi: Giảm giá (`-20%`), Sản phẩm Mới (`NEW`), Xem 3D (`3D INTERACTIVE`).
- Dải kích cỡ (Size pill) hiển thị nhanh tình trạng size có sẵn.

### 4.3. Huy Hiệu Trạng Thái (Badges)
- `.badge`: Thiết kế nhỏ gọn với chữ in hoa 11px, bo tròn pill `9999px`.
- Các biến thể: `.badge-success`, `.badge-warning`, `.badge-danger`, `.badge-info`, `.badge-neutral`.

### 4.4. Trình Xem 3D Tương Tác (3D Viewer Component)
- Nằm gọn gàng trong khung bo viền xám tối sang trọng.
- Thanh công cụ điều khiển bán trong suốt với các nút chức năng:
  - Nút xoay 360 độ tự động (Auto-rotation toggle).
  - Nút reset góc máy (Reset Camera).
  - Các nút preset góc nhìn trực quan: Trước (Front), Sau (Back), Cạnh (Side), Trên (Top).
  - Nút đóng và quay lại xem ảnh chụp.

---

## 5. Khả Năng Tiếp Cận (Accessibility & WCAG AA)

- Độ tương phản chữ trắng `#f8fafc` trên nền `#0b0d11` đạt tỷ lệ **17.8:1** (vượt chuẩn AAA 7:1).
- Trạng thái Focus rõ ràng (`outline: 2px solid var(--accent-primary); outline-offset: 2px`).
- Toàn bộ các icon tương tác đều có `aria-label` và tiêu đề hỗ trợ trình đọc màn hình.
- Tôn trọng thuộc tính hệ thống `prefers-reduced-motion` nhằm hạn chế rung lắc cho người dùng nhạy cảm.
