# 🔒 ANH THƯ SNEAKER — SECURITY & DATA INTEGRITY SPECIFICATION

> **Zero-trust server-side validation, anti-tampering, secret key hygiene, and atomic inventory consistency.**

---

## 1. Nguyên Tắc Bảo Mật "Zero-Trust Client"

> **Quy tắc vàng:** Không bao giờ tin tưởng bất kỳ dữ liệu nào gửi lên từ trình duyệt phía máy khách. Mọi thông tin tài chính, số lượng và tồn kho đều phải được xác thực và tính toán lại 100% tại Server.

### 1.1. Chống Sửa Giá (Price Tampering Protection)
- Client **không có quyền** gửi giá tiền sản phẩm hay tổng thanh toán (`total_amount`).
- API Server chỉ nhận danh sách `{ product_id, variant_id, quantity }`.
- Server tự truy vấn giá gốc từ cơ sở dữ liệu (`variant.price`), nhân với số lượng, áp dụng mã giảm giá đã kiểm tra tính hợp lệ, cộng phí vận chuyển mặc định từ cài đặt shop, và lưu vào đơn hàng.

### 1.2. Chống Đặt Quá Tồn Kho (Anti-Overselling Concurrency)
- Hệ thống áp dụng cơ chế khóa **Mutex Locking** tại tầng `DataStore` / `InventoryService`.
- Khi khách hàng nhấn "Đặt Hàng", tiến trình đặt kho khóa tạm thời bản ghi tồn kho, kiểm tra `available_stock = stock - reserved_stock >= quantity`.
- Nếu thỏa mãn, tăng ngay `reserved_stock` trước khi mở khóa cho request tiếp theo. Nhờ đó, loại bỏ hoàn toàn hiện tượng Race Condition (hai người cùng mua 1 đôi giày cuối cùng tại cùng 1 giây).

---

## 2. Bảo Mật Thông Tin Nhạy Cảm (Secrets Management)

- **Google Service Account Private Key:** Tuyệt đối không bao giờ để lộ hoặc bundle vào code JavaScript máy khách. Tất cả biến `GOOGLE_PRIVATE_KEY` và `GOOGLE_SERVICE_ACCOUNT_EMAIL` chỉ được đọc từ môi trường chạy phía server (`process.env`).
- **File `.env.local`:** Đã được thêm vào `.gitignore` để tránh trường hợp commit nhầm khóa mật lên Git repository công khai.

---

## 3. Xác Thực Đầu Vào (Schema Validation with Zod)

Toàn bộ payload đầu vào của các API đều được kiểm duyệt chặt chẽ bằng thư viện `zod`:
- **Số điện thoại:** Phải đúng định dạng số di động Việt Nam (10 chữ số bắt đầu bằng `03, 05, 07, 08, 09`).
- **Họ tên & Địa chỉ:** Bắt buộc không được để trống, cắt bỏ khoảng trắng thừa (`trim()`), chống chèn mã độc XSS / HTML injection.
- **Số lượng:** Phải là số nguyên dương $\ge 1$.
- **Lý do sửa kho (Admin):** Bắt buộc phải có lý do thuộc danh mục quy định (`RESTOCK`, `DAMAGE`, `RETURN`, `ADJUSTMENT`) kèm ghi chú tối thiểu 3 ký tự.

---

## 4. Nhật Ký Kiểm Toán (Activity Audit Trail)

Bất kỳ thao tác chỉnh sửa nào trong hệ thống đều được ghi vết vĩnh viễn vào bảng `ActivityLogs`:
- Ai thực hiện (`admin` hoặc `customer`).
- Loại thao tác (`ORDER_UPDATE`, `STOCK_ADJUSTMENT`, `SETTINGS_UPDATE`).
- Dữ liệu trước khi sửa (`before`) và sau khi sửa (`after`).
- Lý do thay đổi và thời điểm chính xác (Timestamp ISO 8601).
