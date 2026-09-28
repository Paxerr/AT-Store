# PROJECT AUDIT REPORT — ANH THƯ SNEAKER
**Audit Date:** 2026-09-27  
**Scope:** Workspace audit, technical stack determination, operational baseline, and gap analysis.

---

## 1. Executive Summary

A comprehensive workspace audit was conducted on the root directory (`d:\Website_AnhThu`).
- **Initial State:** Empty directory. No legacy code, obsolete dependencies, or broken architectures.
- **Node.js Environment:** Configured with Node.js v20.18.0 LTS and npm 10.8.2.
- **Operating System:** Windows with PowerShell environment.
- **Goal:** Build a production-grade, end-to-end e-commerce system with an interactive 3D product viewer, an admin operations suite tailored for a solo entrepreneur, an extensible Repository/Service architecture backed by Google Sheets (with automated fallback and synchronization), anti-oversell inventory safeguards, Bank Transfer / VietQR automated reconciliation, SEO optimization, and complete documentation.

---

## 2. Target Operational Model

| Parameter | Specification |
|---|---|
| **Shop Name** | Anh Thư Sneaker |
| **Product Categories** | Sneaker, Giày thời trang (Shoes), Quần áo (Apparel), Phụ kiện (Accessories), Sale |
| **Operator Model** | 1 Solo Entrepreneur / Shop Owner |
| **Primary Database** | Google Sheets API v4 (Service Account authentication) |
| **Persistence Fallback** | Local Atomic JSON File Repository with exact Google Sheets schema mapping |
| **Payment Method** | Bank Transfer with auto-generated VietQR & exact Order ID syntax (`ATS-YYYYMMDD-XXXX`) |
| **Shipping Fulfillment** | Shop-managed delivery (no carrier API dependency in V1; default 3–5 days, configurable fees) |
| **Customer Checkout** | Seamless Guest Checkout + Order Tracking via Order ID & Phone number |
| **3D Engine** | WebGL / Three.js Orbit Viewer (lazy-loaded, responsive, mobile touch, accessible, non-blocking) |

---

## 3. Technology Stack Selection

1. **Framework:** Next.js 14+ (App Router) with React 18, utilizing Server-Side Rendering (SSR) for blazing-fast SEO product pages and dynamic API routes for secure backend services.
2. **Styling & Design System:** Modern CSS Design Tokens + Custom CSS utilities with zero runtime overhead, sleek dark/editorial accents, typography hierarchy (Inter/Outfit style), micro-animations, and complete mobile-first responsiveness.
3. **Database & Integration:**
   - Strict Separation of Concerns: Customer/Admin UI $\to$ Next.js API Routes $\to$ Service Layer $\to$ Repository Layer $\to$ Google Sheets API v4.
   - Dual-mode repository: Google Sheets live mode with automatic fallback to local JSON database store when credentials are not yet injected, preventing customer 500 errors.
4. **3D Media Subsystem:** Three.js with OrbitControls, multi-angle camera views (Front, Side, Back, Top, Bottom, 360° Free Rotate, Zoom, Reset), lazy loading, fallback image cards, and low-power/reduced-motion detection.
5. **Validation & State Management:** Zod validation on all API requests, server-side price and stock re-calculation, and atomic inventory reservation locks.

---

## 4. Key Risks & Mitigations

| Identified Challenge | Risk Factor | Architectural Solution |
|---|---|---|
| **Google Sheets Rate Limits & Latency** | Sheets API has 60 req/min/user quota | In-memory cache layer with TTL (5 min for catalog, write-through for orders/inventory), batch updates, and asynchronous activity logging. |
| **Inventory Overselling** | Google Sheets lacks ACID transactions | In-memory atomic reservation lock during checkout; `available_stock = stock - reserved_stock`. Release on order cancellation/timeout. |
| **3D Rendering Impact on Performance** | Heavy 3D models can ruin Core Web Vitals | 3D models are strictly lazy-loaded on explicit customer interaction (`VIEW IN 3D`). Fast WebP preview images load first. Fallback on slow devices. |
| **Client Total Tampering** | Malicious users modifying cart totals | Server-side total calculation: $Total = Subtotal - CouponDiscount + ShippingFee$. Server is the single source of truth. |
| **Solo Operator Cognitive Load** | Complex ERPs overwhelm single store owners | One-Click Order Status progression, Today KPI Dashboard, low-stock warnings, inline order adjustments with automatic audit trails. |

---

## 5. Audit Conclusion & Next Steps

The workspace is ready for clean, zero-compromise implementation following the systematic phases:
- **Phase 0:** Architecture & System Blueprint (`ARCHITECTURE.md`)
- **Phase 1:** Google Sheets Schema & Repository Layer (`DATABASE_SCHEMA.md`, `GOOGLE_SHEETS_SETUP.md`)
- **Phase 2:** Core Business Services (Product, Inventory, Order, Coupon, Payment, Customer, Return)
- **Phase 3:** Customer Storefront (Home, Catalog, Product Detail, Cart, Checkout, VietQR Success, Order Tracking)
- **Phase 4:** Solo Admin Suite (KPI Dashboard, Orders, Products, Inventory Adjustment, Coupons, Shop Settings, POS Mode, Analytics)
- **Phase 5:** Interactive 3D Sneaker Viewer
- **Phase 6:** Testing, Security Audit & Comprehensive Documentation Suite
