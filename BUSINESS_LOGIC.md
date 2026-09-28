# 📐 ANH THƯ SNEAKER — BUSINESS LOGIC SPECIFICATION

> **Detailed operational workflows, state machines, inventory rules, and financial formulas.**

---

## 1. Vòng Đời Đơn Hàng (Order State Machine)

Hệ thống quản lý trạng thái đơn hàng theo sơ đồ máy hữu hạn trạng thái nghiêm ngặt:

```text
       ┌──────────────┐
       │   PENDING    │ <── Khách đặt hàng thành công qua Website / POS
       └──────┬───────┘
              │
      ┌───────┴───────────────────────┐
      │                               │
      ▼                               ▼
┌───────────┐                  ┌─────────────┐
│ CONFIRMED │                  │  CANCELLED  │
└─────┬─────┘                  └─────────────┘
      │                               ▲
      ▼                               │
┌───────────┐                         │
│PROCESSING │ ────────────────────────┘ (Hủy nếu phát hiện sai sót trước khi gửi)
└─────┬─────┘
      │
      ▼
┌───────────┐
│  SHIPPED  │
└─────┬─────┘
      │
      ▼
┌───────────┐
│ DELIVERED │ ── (Hoàn thành đơn hàng)
└─────┬─────┘
      │
      ▼
┌──────────────────┐
│ RETURN_REQUESTED │ <── Khách yêu cầu đổi/trả hàng (sai kích cỡ, lỗi)
└─────┬────────────┘
      │
      ├───────────────────────────────┐
      ▼                               ▼
┌───────────┐                  ┌─────────────┐
│ RETURNED  │                  │  REJECTED   │
└─────┬─────┘                  └─────────────┘
      │
      ▼
┌───────────┐
│ REFUNDED  │
└───────────┘
```

### Các chuyển tiếp trạng thái hợp lệ:
1. **PENDING $\to$ CONFIRMED:** Admin kiểm tra thông báo ngân hàng và xác nhận tiền đã về tài khoản.
2. **CONFIRMED $\to$ PROCESSING:** Đơn hàng được chuyển qua giai đoạn đóng gói, dán tem nhãn.
3. **PROCESSING $\to$ SHIPPED:** Hàng đã giao cho shipper/bưu cục của đơn vị vận chuyển.
4. **SHIPPED $\to$ DELIVERED:** Khách hàng đã nhận giày thành công.
5. **PENDING / CONFIRMED / PROCESSING $\to$ CANCELLED:** Hủy đơn (do khách đổi ý hoặc thông tin sai). Tồn kho đang giữ (reserved) sẽ được hoàn trả ngay lập tức.
6. **DELIVERED $\to$ RETURN_REQUESTED $\to$ RETURNED $\to$ REFUNDED:** Quy trình xử lý khiếu nại đổi trả và hoàn tiền.

---

## 2. Quản Trị Tồn Kho & Chống Bán Vượt (Anti-Overselling)

### 2.1. Công thức tính Tồn kho khả dụng
$$\text{available\_stock} = \text{stock} - \text{reserved\_stock}$$

- `stock`: Số lượng sản phẩm thực tế đang nằm trên kệ kho.
- `reserved_stock`: Số lượng sản phẩm đã có khách đặt hàng (PENDING hoặc CONFIRMED) nhưng chưa xuất kho.
- `available_stock`: Số lượng còn lại hiển thị trên website cho khách hàng tiếp theo đặt mua.

### 2.2. Khóa Kho Nguyên Tử (Atomic Mutex Reservation)
Khi khách hàng gửi yêu cầu checkout:
1. **Kiểm tra điều kiện:** Với mọi item trong giỏ, nếu $\text{available\_stock} < \text{order\_quantity}$, từ chối đơn hàng với thông báo lỗi cụ thể (ví dụ: *"Sản phẩm Sneaker XYZ kích thước 41 chỉ còn 1 đôi, không đủ đáp ứng"*).
2. **Đặt giữ kho (Reserve):** Tăng `reserved_stock += order_quantity`. Thao tác này được bảo vệ bởi Mutex lock để chống xung đột luồng khi nhiều khách cùng đặt một size giày hot.
3. **Hoàn trả giữ kho (Release):** Nếu đơn hàng bị `CANCELLED`, hệ thống tự động trừ `reserved_stock -= order_quantity`.
4. **Trừ kho thực tế (Finalize):** Khi đơn hàng chuyển sang `SHIPPED` hoặc `DELIVERED`, hệ thống cập nhật:
   - `stock -= order_quantity`
   - `reserved_stock -= order_quantity`
   - Ghi nhật ký vào `InventoryLogs` với action `SALE`.

---

## 3. Công Thức Tính Tiền Đơn Hàng (Server-Side Recalculation)

> ⚠️ **Quy tắc an toàn tuyệt đối:** Frontend KHÔNG BAO GIỜ được gửi `total_amount` để server ghi nhận trực tiếp. Toàn bộ phép tính bắt buộc phải được tính lại độc lập tại Backend dựa trên giá niêm yết trong cơ sở dữ liệu.

$$\text{subtotal} = \sum (\text{variant\_price}_i \times \text{quantity}_i)$$
$$\text{discount\_amount} = \text{CalculateCoupon}(\text{subtotal}, \text{coupon})$$
$$\text{final\_shipping\_fee} = (\text{subtotal} \ge \text{free\_shipping\_threshold}) \ ? \ 0 : \text{base\_shipping\_fee}$$
$$\text{total\_amount} = \max(0, \ \text{subtotal} - \text{discount\_amount} + \text{final\_shipping\_fee})$$

### 3.1. Thuật toán chiết khấu Mã Khuyến Mãi (Coupon Engine)
1. **Kiểm tra thời hạn:** $\text{now} \ge \text{start\_at}$ và $(\text{end\_at} == \text{null} \lor \text{now} \le \text{end\_at})$.
2. **Kiểm tra giới hạn lượt dùng:** $\text{used\_count} < \text{usage\_limit}$.
3. **Kiểm tra giá trị đơn tối thiểu:** $\text{subtotal} \ge \text{minimum\_order}$.
4. **Loại giảm giá:**
   - **`PERCENTAGE` (Phần trăm):**
     $$\text{raw\_discount} = \text{subtotal} \times \left(\frac{\text{value}}{100}\right)$$
     $$\text{discount\_amount} = \min(\text{raw\_discount}, \ \text{maximum\_discount})$$
   - **`FIXED` (Số tiền cố định):**
     $$\text{discount\_amount} = \min(\text{value}, \ \text{subtotal})$$

---

## 4. Thanh Toán Chuyển Khoản VietQR Tự Động

- **Mã nhận diện đơn hàng:** `ATS-YYYYMMDD-XXXX` (ví dụ: `ATS-20260927-0001`).
- **Nội dung chuyển khoản (Memo):** Bắt buộc phải chứa mã đơn hàng `ATS-YYYYMMDD-XXXX`.
- **Mã QR chuẩn NAPAS 24/7:** Tạo tự động qua chuẩn API VietQR:
  ```text
  https://img.vietqr.io/image/{BANK_ID}-{ACCOUNT_NO}-compact2.png?amount={TOTAL}&addInfo={ORDER_ID}&accountName={ACCOUNT_NAME}
  ```
- **Xác nhận thanh toán:** Sau khi kiểm tra sao kê ngân hàng trùng khớp với số tiền và nội dung, Admin chỉ cần 1 click *"Xác nhận đã thanh toán"* trong trang quản trị. Hệ thống tự động chuyển trạng thái đơn hàng sang `PAID` và ghi nhận lịch sử vào `ActivityLogs`.

---

## 5. Báo Cáo Lợi Nhuận Gộp (Gross Profit & COGS)

Hệ thống cho phép shop tự tính lợi nhuận tức thì mà không cần phần mềm kế toán phức tạp:
$$\text{COGS (Giá vốn hàng bán)} = \sum (\text{cost\_price}_i \times \text{quantity}_i)$$
$$\text{Gross Profit (Lợi nhuận gộp)} = (\text{total\_revenue} - \text{shipping\_revenue}) - \text{COGS}$$
$$\text{Gross Margin (\% Biên lợi nhuận)} = \frac{\text{Gross Profit}}{\text{Net Revenue}} \times 100\%$$
