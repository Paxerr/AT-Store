# 🔍 ANH THƯ SNEAKER — SEO & METADATA GUIDE

> **Search Engine Optimization strategy, Schema.org JSON-LD, Dynamic Sitemap, and OpenGraph standards.**

---

## 1. Cấu Trúc Thẻ Tiêu Đề & Meta (Title & Meta Tags)

Tất cả các trang đều có thẻ tiêu đề và mô tả chuẩn SEO:
- **Trang chủ:**
  - *Title:* `Anh Thư Sneaker — Cửa Hàng Giày Thể Thao & Thời Trang Cao Cấp`
  - *Meta Description:* `Khám phá các mẫu sneaker chính hãng hot nhất, giày thể thao phong cách, quần áo streetwear và phụ kiện cao cấp tại Anh Thư Sneaker. Trải nghiệm xem giày 3D tương tác.`
- **Trang danh mục:**
  - *Title:* `Tất Cả Sản Phẩm — Anh Thư Sneaker`
- **Trang chi tiết sản phẩm:**
  - *Title:* `{Tên_Sản_Phẩm} — Anh Thư Sneaker`
  - *Meta Description:* Lấy tự động từ trường `short_description` của sản phẩm.

---

## 2. Dữ Liệu Có Cấu Trúc (Structured Data - Schema.org JSON-LD)

Mỗi trang chi tiết sản phẩm tự động nhúng mã JSON-LD chuẩn `Product` và `Offer` của Google Search Central:

```json
{
  "@context": "https://schema.org/",
  "@type": "Product",
  "name": "Nike Air Jordan 1 Retro High OG 'Chicago'",
  "image": [
    "https://images.unsplash.com/photo-1552346154-21d32810aba3"
  ],
  "description": "Biểu tượng bất tử của dòng giày bóng rổ đường phố với phối màu Chicago kinh điển.",
  "sku": "AJ1-CHI-40",
  "brand": {
    "@type": "Brand",
    "name": "Nike"
  },
  "offers": {
    "@type": "Offer",
    "url": "http://localhost:3000/products/nike-air-jordan-1-retro-high-og-chicago",
    "priceCurrency": "VND",
    "price": "4850000",
    "availability": "https://schema.org/InStock",
    "seller": {
      "@type": "Organization",
      "name": "Anh Thư Sneaker"
    }
  }
}
```

---

## 3. Sitemap Động & Robots.txt

- **Sitemap tự động:** Khởi tạo tại `/sitemap.xml` thông qua `src/app/sitemap.ts`. Tự động quét toàn bộ danh mục sản phẩm từ `ProductRepository` để sinh ra danh sách URL đầy đủ kèm ngày sửa đổi gần nhất (`lastModified`).
- **Robots.txt:** Khởi tạo tại `/robots.txt` qua `src/app/robots.ts`:
  - Cho phép (`Allow`) bot tìm kiếm quét toàn bộ trang chủ, danh mục và trang sản phẩm.
  - Chặn (`Disallow`) bot thu thập các trang nội bộ nhạy cảm: `/admin/`, `/checkout`, `/order-success`, và các route `/api/`.

---

## 4. OpenGraph & Mạng Xã Hội (Facebook / Zalo / Telegram)

Khi người dùng chia sẻ liên kết sản phẩm qua Zalo hoặc Facebook Messenger, hệ thống tự động trả về thẻ meta OpenGraph:
- `og:title`: Tên sản phẩm sắc nét.
- `og:description`: Đoạn mô tả lôi cuốn kèm giá tiền.
- `og:image`: Ảnh chụp sản phẩm góc đẹp nhất với kích thước tối ưu 1200x630px.
- `og:type`: `website` / `product`.
