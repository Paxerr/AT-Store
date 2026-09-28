# 🧊 ANH THƯ SNEAKER — 3D & WEBGL SUBSYSTEM SPECIFICATION

> **Three.js rendering engine, lazy-loading patterns, GLB asset pipelines, touch gestures, and mobile fallbacks.**

---

## 1. Mục Tiêu & Nguyên Tắc Vận Hành 3D

1. **Hiệu năng là số 1 (Performance Over Visual Gimmick):** Trải nghiệm 3D là một giá trị cộng thêm (enhancement) nhằm giúp khách hàng quan sát phom dáng giày từ mọi góc độ. Nó **tuyệt đối không được làm chậm** trang thanh toán hay gây giật lag trải nghiệm mua hàng.
2. **Tải theo yêu cầu (Lazy Loading by Intent):** Không tự động tải tài nguyên WebGL / 3D khi trang sản phẩm vừa tải. Hệ thống luôn ưu tiên tải ảnh chụp chất lượng cao trước. Chỉ khi khách hàng nhấp chuột hoặc chạm vào nút **"XEM 3D 360°"**, Three.js và file 3D mới được nạp vào bộ nhớ.
3. **Fallback Đa Tầng (Multi-tiered Fallback):**
   - Nếu thiết bị yếu, GPU không hỗ trợ WebGL, hoặc file 3D tải thất bại: Hệ thống hiển thị thông báo nhẹ nhàng và tự động hoàn trả giao diện về bộ ảnh gallery tĩnh mà không gây crash ứng dụng.
   - Nếu sản phẩm không có mô hình 3D (`has_3d = false`), huy hiệu 3D sẽ tự động ẩn và trang sản phẩm hoạt động như một cửa hàng tiêu chuẩn.

---

## 2. Công Nghệ & Kiến Trúc Kỹ Thuật

```text
Product Detail Page
      │
      ├─► [ Mặc định: Hiển thị Image Carousel / Thumbnails ]
      │
      └─► [ Khách bấm "XEM 3D 360°" ]
               │
               ▼
       ┌───────────────────────────────┐
       │   ThreeDViewer (Three.js)     │
       ├───────────────────────────────┤
       │ • WebGLRenderer (Antialias)   │
       │ • PerspectiveCamera (FOV 45)  │
       │ • Ambient & Directional Light │
       │ • OrbitControls (Damping=0.05)│
       │ • Fallback Procedural Mesh    │
       └───────────────────────────────┘
```

- **Thư viện chủ đạo:** `three` (v0.169.0) và `three/examples/jsm/controls/OrbitControls`.
- **Định dạng file tiêu chuẩn:** Khuyến nghị file nén `.glb` (GL Transmission Format Binary) hoặc `.gltf` với nén Draco nếu kích thước lớn.
- **Dung lượng tối ưu:** Khuyến nghị mỗi file model 3D giày nên nằm trong khoảng **1.5MB – 4.5MB** để đảm bảo tải nhanh trên mạng di động 4G/5G.

---

## 3. Hệ Thống Điều Khiển & Cử Chỉ Tương Tác

### Trên Máy Tính (Desktop / Mouse):
- **Click chuột trái & Kéo:** Xoay tự do xung quanh giày theo trục 3D (360° Rotation).
- **Lăn con trỏ chuột (Mouse Wheel):** Phóng to / Thu nhỏ để soi chi tiết chất liệu da, đường chỉ may, đế giày.
- **Click chuột phải & Kéo:** Di chuyển tịnh tiến vị trí camera (Pan).

### Trên Điện Thoại (Mobile / Touch):
- **1 ngón tay vuốt:** Xoay sản phẩm mượt mà theo cử chỉ ngón tay.
- **2 ngón tay chụm / mở (Pinch to Zoom):** Thu nhỏ / Phóng to góc nhìn.

### Nút Thao Tác Nhanh (Preset Angle Toolbar):
Trình xem tích hợp sẵn thanh công cụ bán trong suốt với các góc nhìn chuẩn:
1. **TRƯỚC (Front View):** Góc nhìn trực diện mũi giày.
2. **CẠNH (Side View):** Góc nhìn ngang kinh điển thể hiện trọn vẹn phom dáng và logo dấu Swoosh / 3 sọc.
3. **TRÊN (Top View):** Góc nhìn từ trên xuống để quan sát lưỡi gà, dây giày và lót trong.
4. **SAU (Back View):** Góc nhìn gót giày và đế gót.
5. **RESET:** Khôi phục góc nhìn mặc định ban đầu.
6. **XOAY TỰ ĐỘNG (Auto-Rotate):** Bật/tắt chế độ tự quay nhẹ nhàng 0.8 vòng/phút.

---

## 4. Quản Trị 3D Trong Admin (Product Editor)

Trong màn hình quản trị tạo/sửa sản phẩm (`/admin/products/new`), người vận hành có thể cấu hình:
- **Tích chọn `Có mô hình 3D`:** Bật/tắt tính năng 3D cho sản phẩm này.
- **Đường dẫn 3D Model URL:** Nhập link CDN lưu trữ file `.glb` (hoặc đường dẫn nội bộ như `/models/air-jordan-1.glb`).
- **Hình ảnh xem trước (Preview Image):** Ảnh đại diện cho nút 3D.
- **Sẵn sàng cho AR tương lai:** Trường dữ liệu được thiết kế mở để sẵn sàng lưu link định dạng `.usdz` dành cho trải nghiệm thực tế tăng cường trên iOS Safari QuickLook.
