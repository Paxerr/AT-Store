# 🚀 ANH THƯ SNEAKER — PRODUCTION DEPLOYMENT GUIDE

> **Step-by-step deployment instructions for Vercel, Docker, and Virtual Private Servers (VPS).**

---

## 1. Triển Khai Nhanh Trên Vercel (Khuyến Nghị)

Vercel là nền tảng tối ưu nhất cho Next.js với hiệu năng mạng biên (Edge CDN) toàn cầu:

### Bước 1: Đẩy mã nguồn lên GitHub / GitLab
```bash
git init
git add .
git commit -m "feat: complete production release of Anh Thu Sneaker"
git remote add origin https://github.com/your-username/anh-thu-sneaker.git
git push -u origin main
```

### Bước 2: Import Project vào Vercel
1. Truy cập [vercel.com](https://vercel.com) và chọn **Add New Project**.
2. Chọn kho lưu trữ `anh-thu-sneaker`.
3. Trong phần **Environment Variables**, khai báo các biến môi trường từ `.env.example`:
   - `NEXT_PUBLIC_SITE_URL`: `https://your-domain.com`
   - `SHOP_NAME`: `Anh Thư Sneaker`
   - `BANK_NAME`, `BANK_ACCOUNT_NUMBER`, `BANK_ACCOUNT_NAME`
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `GOOGLE_SHEET_ID` (nếu dùng Google Sheets).
4. Nhấn **Deploy**. Vercel sẽ tự động chạy `npm run build` và phát hành ứng dụng.

---

## 2. Triển Khai Bằng Docker & Docker Compose

### Tạo `Dockerfile`:
```dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/data ./data

EXPOSE 3000
ENV PORT 3000
CMD ["npm", "start"]
```

### Lệnh chạy Docker:
```bash
docker build -t anh-thu-sneaker .
docker run -d -p 3000:3000 --env-file .env.local --name anh-thu-app anh-thu-sneaker
```

---

## 3. Triển Khai Trên Linux VPS (Ubuntu 22.04 + PM2 + Nginx)

### Bước 1: Cài đặt Node.js & PM2
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs nginx git
sudo npm install -g pm2
```

### Bước 2: Clone & Build ứng dụng
```bash
cd /var/www
git clone https://github.com/your-username/anh-thu-sneaker.git
cd anh-thu-sneaker
npm install
npm run build
```

### Bước 3: Khởi chạy với PM2
```bash
pm2 start npm --name "anh-thu-sneaker" -- start
pm2 save
pm2 startup
```

### Bước 4: Cấu hình Nginx Reverse Proxy & SSL Let's Encrypt
```nginx
server {
    server_name anhthusneaker.vn www.anhthusneaker.vn;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
Kích hoạt chứng chỉ bảo mật HTTPS miễn phí:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d anhthusneaker.vn -d www.anhthusneaker.vn
```
