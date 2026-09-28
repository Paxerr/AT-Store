# 📱 ANH THƯ SNEAKER — UX SPECIFICATION

> **User Experience Design: Mobile-First Storefront, Customer Buying Journey, and 1-Person Admin Efficiency.**

---

## 1. Triết Lý Thiết Kế Trải Nghiệm (UX Principles)

1. **Mobile-First Realism:** Hơn 85% lưu lượng mua sắm sneaker tại Việt Nam diễn ra trên điện thoại thông minh (iPhone, Android). Mọi giao diện, kích thước nút bấm, font size, khoảng cách ngón tay (thumb zone) đều được đo lường cho màn hình cảm ứng trước khi mở rộng lên máy tính bảng và màn hình lớn.
2. **Tốc độ & Đơn giản (Speed & Frictionless):**
   - Giảm thiểu số bước mua hàng: Cho phép khách mua ngay (Guest Checkout) mà không bắt buộc tạo tài khoản rườm rà.
   - Giỏ hàng trượt (Cart Drawer) mở tức thì khi thêm sản phẩm, không load lại trang.
3. **Minh bạch & Đáng tin cậy (Trust by Design):**
   - Thông báo rõ ràng thời gian giao hàng dự kiến: *3–5 ngày kể từ ngày đặt*.
   - Hướng dẫn chuyển khoản trực quan kèm mã QR ngân hàng chuẩn NAPAS và nội dung chuyển khoản tự động điền mã đơn hàng duy nhất `ATS-YYYYMMDD-XXXX`.
4. **Interactive 3D as an Enhancement:**
   - 3D WebGL chỉ được tải lười (lazy load) khi người dùng chủ động bấm vào nút **"XEM 3D 360°"**.
   - Tuyệt đối không tự động tải file 3D nặng gây chậm quá trình xem sản phẩm hay chặn thanh toán.
   - Cung cấp nút điều khiển trực quan: Xoay 360°, Phóng to/Thu nhỏ, Reset góc nhìn, và các góc nhìn nhanh (Trước, Sau, Cạnh, Trên).
   - Tự động fallback về ảnh gallery nếu thiết bị hoặc trình duyệt không hỗ trợ WebGL.

---

## 2. Hành Trình Khách Hàng (Customer Journey)

### Bước 1: Khám Phá (Discovery)
- **Hero Section:** Thông điệp định vị *"Step Into Your Style"* kèm nút CTA dẫn nhanh tới bộ sưu tập mới.
- **Phân loại trực quan (Visual Categories):** Danh mục Sneaker, Quần áo, Phụ kiện với hình ảnh rõ nét và huy hiệu số lượng.
- **Bộ lọc thông minh (Faceted Search & Filters):** Tìm kiếm theo tên sản phẩm, mã SKU, thương hiệu, mức giá, kích cỡ (38–43), trạng thái khuyến mãi (Sale), và sản phẩm hỗ trợ 3D.

### Bước 2: Xem Chi Tiết & Tương Tác 3D (Engagement)
- **Gallery đa phương tiện:** Chuyển đổi linh hoạt giữa ảnh chụp thực tế và mô hình 3D tương tác.
- **Bộ chọn phân loại (Variant Selector):**
  - Hiển thị trực quan các size khả dụng.
  - Tự động làm mờ và vô hiệu hóa (disabled) các size đã hết hàng (`available_stock <= 0`).
  - Cảnh báo tồn kho thấp (*"Chỉ còn 2 sản phẩm!"*) kích thích tỷ lệ chuyển đổi.

### Bước 3: Đặt Hàng & Thanh Toán (Checkout & VietQR)
- **Form đặt hàng 1 trang (Single-Page Form):** Chỉ yêu cầu thông tin thiết yếu: Họ tên, Số điện thoại, Địa chỉ chi tiết (Tỉnh/Thành, Quận/Huyện, Phường/Xã), và Ghi chú giao hàng.
- **Mã ưu đãi (Coupon):** Xác thực mã khuyến mãi tức thì (`ANHTHU10`, `SNEAKER50K`, `FREESHIP`), trừ tiền hiển thị rõ ràng trên tổng thanh toán.
- **Trang Xác Nhận Đơn Hàng:**
  - Hiệu ứng Confetti chúc mừng đặt hàng thành công.
  - Mã đơn hàng rõ ràng định dạng `ATS-YYYYMMDD-XXXX`.
  - Mã VietQR động hiển thị sẵn số tiền chính xác và nội dung chuyển khoản. Nút sao chép 1 chạm tiện lợi.

### Bước 4: Tra Cứu Đơn Hàng (Order Tracking)
- Khách hàng không cần đăng nhập: Chỉ cần nhập **Mã đơn hàng + Số điện thoại** là có thể theo dõi tiến trình đơn hàng (Đã đặt $\to$ Đã xác nhận $\to$ Đang đóng gói $\to$ Đang giao $\to$ Đã giao).

---

## 3. Trải Nghiệm Quản Trị Tối Ưu Cho 1 Người (Solo Admin UX)

Một shop nhỏ do một người tự vận hành không có thời gian để bấm qua 10 tầng menu phức tạp. Do đó Admin UX tuân thủ các nguyên tắc:
1. **Trọng tâm hôm nay (Actionable Today Dashboard):**
   - Đập vào mắt ngay khi mở máy: Doanh thu hôm nay, Số đơn hàng mới, Đơn chờ duyệt tiền, Đơn chưa thanh toán, và Cảnh báo sản phẩm sắp hết hàng.
   - Danh sách "Đơn hàng khẩn cấp cần xử lý" hiển thị ngay trang chủ admin với nút thao tác nhanh (Duyệt thanh toán, Giao hàng).
2. **Tạo đơn tại chỗ (Quick POS / Chat Order):**
   - Giao diện bán lẻ siêu tốc dành cho khách chốt đơn qua Facebook/Zalo/Điện thoại: Chọn sản phẩm $\to$ Chọn size $\to$ Nhập tên/SĐT khách $\to$ Hoàn tất đơn trong vòng 15 giây.
3. **Kiểm kê kho có trách nhiệm (Stock Adjustment Modal):**
   - Khi tăng/giảm tồn kho, admin bắt buộc phải chọn lý do (Hàng nhập thêm, Bán ngoài, Hàng lỗi, Trả hàng...) và ghi chú để bảo toàn tính toàn vẹn dữ liệu cho Activity Log.
