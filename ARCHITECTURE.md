# SYSTEM ARCHITECTURE — ANH THƯ SNEAKER
**Version:** 1.0.0 (Production)  
**Architecture Classification:** Decoupled Headless E-commerce with Service-Repository Abstraction & Google Sheets Persistence

---

## 1. Architectural Philosophy & Principles

1. **Separation of Concerns:** Business logic NEVER touches presentation code or raw storage APIs directly.
2. **Pluggable Persistence:** Google Sheets acts as the primary data store for the business operator, abstracted behind strict Repository interfaces (`ProductRepository`, `OrderRepository`, `InventoryRepository`, etc.). This guarantees zero business logic refactoring if migrating to PostgreSQL, Supabase, or MySQL in future phases.
3. **Dual-Mode Data Provider:** The system automatically runs with live Google Sheets API when service account credentials are provided, or seamlessly falls back to a schema-identical local storage layer in local development/offline environments.
4. **Server as Single Source of Truth:** Prices, discounts, shipping fees, stock levels, and order IDs are verified and calculated strictly on the server. Client-provided prices or calculations are never trusted.
5. **Mobile-First & Performance-Obsessed:** Critical paths (cart, checkout, tracking) execute in milliseconds. 3D WebGL assets are lazy-loaded on-demand without degrading initial page load or Core Web Vitals.

---

## 2. High-Level System Topology

```mermaid
flowchart TD
    subgraph Client Layer
        C1["Customer Storefront (Mobile / Desktop)"]
        C2["Order Tracking Portal"]
        C3["Solo Admin Dashboard (Mobile / Desktop)"]
        C4["Quick POS Terminal"]
    end

    subgraph Presentation & Edge Layer ["Next.js App Router (SSR & Edge)"]
        A1["Storefront Pages & SEO Metadata"]
        A2["Dynamic Product Pages (ISR / SSR)"]
        A3["Admin Route Handlers & Protection"]
        A4["API Gateway: /api/*"]
    end

    subgraph Service Layer ["Pure Business Logic"]
        S1["ProductService"]
        S2["InventoryService (Reservation Lock)"]
        S3["OrderService (State Machine)"]
        S4["PaymentService (VietQR & Bank Transfer)"]
        S5["CouponService (Promotion Engine)"]
        S6["SettingsService"]
        S7["AnalyticsService"]
    end

    subgraph Repository Layer ["Storage Abstraction"]
        R1["Repository Interfaces"]
        R2["Google Sheets API v4 Driver"]
        R3["Local Schema-Mapped Persistence Driver"]
        R4["In-Memory Cache & Lock Manager"]
    end

    subgraph Storage Layer
        GSheet[("Google Sheets Spreadsheet (30+ Sheets)")]
        LocalDB[("Local Data Store (.json snapshot)")]
    end

    C1 --> A1 & A2 & A4
    C2 --> A4
    C3 & C4 --> A3 & A4

    A4 --> S1 & S2 & S3 & S4 & S5 & S6 & S7
    S1 & S2 & S3 & S4 & S5 & S6 & S7 --> R1
    R1 --> R4
    R4 --> R2 & R3
    R2 --> GSheet
    R3 --> LocalDB
```

---

## 3. Order State Machine

```mermaid
stateDiagram-v2
    [*] --> PENDING: Customer places order (Stock Reserved)
    PENDING --> CANCELLED: Customer cancels / Payment expired (Stock Released)
    PENDING --> CONFIRMED: Admin verifies VietQR Bank Transfer (Payment: PAID)
    CONFIRMED --> PROCESSING: Shop packs sneaker & prepares parcel
    PROCESSING --> SHIPPED: Handed over to delivery carrier
    SHIPPED --> DELIVERED: Parcel successfully received (Stock Finalized)
    
    DELIVERED --> RETURN_REQUESTED: Customer requests return / exchange
    RETURN_REQUESTED --> RETURN_APPROVED: Admin approves request
    RETURN_REQUESTED --> REJECTED: Admin rejects request
    RETURN_APPROVED --> RETURN_RECEIVED: Parcel received back at shop
    RETURN_RECEIVED --> REFUNDED: Admin completes bank refund / exchange
    
    CANCELLED --> [*]
    REFUNDED --> [*]
    REJECTED --> [*]
    DELIVERED --> [*]
```

---

## 4. Anti-Overselling & Inventory Locking Mechanism

Google Sheets lacks atomic transactional ACID guarantees. To prevent race conditions and overselling when multiple customers check out simultaneously:

1. **Available Stock Formula:**
   $$\text{Available Stock} = \text{Total Physical Stock} - \text{Reserved Stock}$$
2. **Checkout Validation:**
   - Server checks if $\text{Available Stock} \ge \text{Requested Quantity}$.
   - If not, checkout rejects immediately with specific out-of-stock notification.
3. **Atomic In-Memory Reservation Lock:**
   - When the order request is received, a mutex lock reserves the stock immediately before committing the order row to the database.
   - If reservation fails, the transaction is aborted.
4. **Lifecycle Transitions:**
   - **Order Created (`PENDING`):** `reserved_stock += quantity`.
   - **Order Cancelled (`CANCELLED`):** `reserved_stock -= quantity`.
   - **Order Shipped/Delivered (`DELIVERED`):** `stock -= quantity` and `reserved_stock -= quantity`.
   - **Order Returned & Restocked (`RETURNED`):** `stock += quantity` with logged restock reason.

---

## 5. Bank Transfer & VietQR Automated Flow

1. Every order generates a strictly formatted Order ID: `ATS-YYYYMMDD-XXXX`.
2. The payment transfer memo/content is set strictly to this Order ID:
   $$\text{Payment Note} = \text{ATS-YYYYMMDD-XXXX}$$
3. VietQR standard URL is generated automatically using the shop's configured bank parameters:
   `https://img.vietqr.io/image/{BANK_CODE}-{ACCOUNT_NUMBER}-compact2.png?amount={TOTAL}&addInfo={ORDER_ID}&accountName={ACCOUNT_NAME}`
4. Customer scans QR via any Vietnamese Mobile Banking application (Vietcombank, MB, Techcombank, VPBank, etc.).
5. The Admin views pending orders with the exact matching Order ID memo and verifies payment with a single click (`Mark as Paid`).

---

## 6. Interactive 3D Product Media Subsystem

```mermaid
sequenceDiagram
    autonumber
    actor Customer
    participant Page as Product Detail Page
    participant Media as Media Subsystem
    participant Three as Three.js WebGL Engine
    participant Asset as CDN / Asset Storage

    Customer->>Page: Visits Sneaker Product Page
    Page->>Media: Query product_media for product_id
    Media-->>Page: Return primary WebP image + 3D Flag (has_3d: true)
    Page->>Customer: Render ultra-fast WebP gallery & prominent "VIEW IN 3D" button
    
    Note over Customer, Page: Zero WebGL execution until user interaction!
    
    Customer->>Page: Clicks "VIEW IN 3D"
    Page->>Three: Dynamically load Three.js & OrbitControls
    Three->>Asset: Asynchronously fetch 3D model (GLB)
    alt Model loaded successfully
        Asset-->>Three: Return GLB buffer
        Three->>Customer: Mount interactive canvas (Rotate 360°, Zoom, Reset, Preset Views)
    else Network / Device Failure
        Three-->>Page: Catch WebGL error
        Page->>Customer: Seamless fallback to high-resolution multi-angle image gallery
    end
```

---

## 7. Security & Validation Boundary

1. **Zero Secret Exposure:** Google Service Account credentials, private keys, and admin passwords reside purely on the server in `.env`. Client bundles never receive these keys.
2. **Strict Zod Validations:**
   - Phone format validation: Vietnamese mobile format (`/(84|0[3|5|7|8|9])+([0-9]{8})\b/`).
   - Order items validation: Valid variant IDs, positive integer quantities.
   - Price & coupon validation: Server re-fetches active coupons, calculates valid discounts with minimum order and maximum discount caps.
3. **Audit Logging:** Every administrative mutation (inventory adjustments, order price edits, status transitions, settings changes) records a non-volatile record in `ActivityLogs` with `user_id`, `before`, `after`, and `reason`.
