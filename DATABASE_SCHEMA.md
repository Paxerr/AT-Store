# DATABASE SCHEMA SPECIFICATION — ANH THƯ SNEAKER
**Version:** 1.0.0 (Production)  
**Primary Persistence Engine:** Google Sheets API v4  
**Local Fallback Engine:** Local Schema-Mapped Storage (JSON Snapshot & Write-through)

---

## 1. Sheet Schema Overview

The database is composed of **32 structured sheets** grouped into 8 functional domains:

```
├── CORE DOMAIN
│   ├── Products
│   ├── ProductVariants
│   ├── Categories
│   ├── Brands
│   ├── Attributes
│   ├── AttributeValues
│   └── ProductMedia
├── SALES DOMAIN
│   ├── Orders
│   ├── OrderItems
│   ├── OrderStatusHistory
│   ├── Payments
│   ├── Refunds
│   ├── Returns
│   ├── ReturnItems
│   └── Exchanges
├── CUSTOMER DOMAIN
│   ├── Customers
│   ├── CustomerAddresses
│   └── CustomerNotes
├── INVENTORY DOMAIN
│   ├── Inventory
│   ├── InventoryLogs
│   ├── InventoryReservations
│   ├── Stocktakes
│   └── StocktakeItems
├── PROMOTION DOMAIN
│   ├── Coupons
│   ├── CouponUsage
│   ├── Promotions
│   └── PromotionRules
├── SHIPPING DOMAIN
│   └── ShippingMethods
├── CONTENT DOMAIN
│   ├── Banners
│   ├── Pages
│   └── Settings
├── ANALYTICS DOMAIN
│   ├── DailyMetrics
│   └── ProductMetrics
└── SYSTEM DOMAIN
    ├── AdminUsers
    ├── ActivityLogs
    └── Notifications
```

---

## 2. Table Column Definitions

### 2.1 Core Domain

#### `Products`
| Column Name | Type | Description |
|---|---|---|
| `product_id` | String (PK) | Unique identifier (e.g., `prod_001`) |
| `slug` | String (Unique) | URL-friendly slug (e.g., `nike-air-force-1-07-white`) |
| `name` | String | Full display name |
| `description` | Text | Rich product description and materials |
| `short_description` | String | Brief summary for card and mobile preview |
| `brand_id` | String (FK) | Reference to `Brands.brand_id` |
| `category_id` | String (FK) | Reference to `Categories.category_id` |
| `status` | Enum | `ACTIVE`, `INACTIVE`, `ARCHIVED` |
| `featured` | Boolean | Whether displayed in featured homepage sections |
| `is_new` | Boolean | Badge for latest arrivals |
| `is_sale` | Boolean | Badge for discounted products |
| `seo_title` | String | Meta title for search engines |
| `seo_description` | String | Meta description for search engines |
| `created_at` | ISO Timestamp | Product creation date |
| `updated_at` | ISO Timestamp | Last modified date |

#### `ProductVariants`
| Column Name | Type | Description |
|---|---|---|
| `variant_id` | String (PK) | Unique variant identifier (e.g., `var_001_39`) |
| `product_id` | String (FK) | Foreign key to `Products.product_id` |
| `sku` | String (Unique) | Stock Keeping Unit (e.g., `ATS-AF1-WHT-39`) |
| `barcode` | String | Barcode string for scanning & search |
| `size` | String | Sneaker size (e.g., `38`, `39`, `40`, `41`, `42`, `43`) |
| `color` | String | Variant color name (e.g., `White`, `Triple Black`) |
| `price` | Number | Active retail selling price (VND) |
| `compare_at_price` | Number | Original/strikethrough price (VND) |
| `cost_price` | Number | Wholesale cost price for gross margin calculation |
| `stock` | Integer | Total physical units in warehouse |
| `reserved_stock` | Integer | Units currently reserved for pending orders |
| `weight` | Number | Weight in grams |
| `status` | Enum | `ACTIVE`, `OUT_OF_STOCK`, `DISCONTINUED` |
| `image` | String (URL) | Variant-specific image URL |

#### `Categories`
| Column Name | Type | Description |
|---|---|---|
| `category_id` | String (PK) | Category ID (e.g., `cat_sneaker`) |
| `name` | String | Display name (Sneaker, Giày, Quần áo, Phụ kiện, Sale) |
| `slug` | String (Unique) | URL slug (`sneaker`, `shoes`, `clothing`, `accessories`, `sale`) |
| `description` | String | Category summary |
| `image` | String (URL) | Representative thumbnail image |
| `parent_id` | String | Nullable parent category ID |
| `sort_order` | Integer | Navigation sorting weight |
| `active` | Boolean | Enable/disable category |

#### `Brands`
| Column Name | Type | Description |
|---|---|---|
| `brand_id` | String (PK) | e.g., `brand_nike`, `brand_adidas` |
| `name` | String | Brand name |
| `slug` | String | Brand slug |
| `logo` | String (URL) | Brand logo asset |
| `description` | String | Brand history/summary |
| `active` | Boolean | Brand active status |

#### `ProductMedia`
| Column Name | Type | Description |
|---|---|---|
| `media_id` | String (PK) | Media ID (e.g., `med_001_1`) |
| `product_id` | String (FK) | Foreign key to `Products.product_id` |
| `type` | Enum | `IMAGE`, `VIDEO`, `MODEL_3D` |
| `url` | String (URL) | Asset URL (WebP image or GLB 3D model) |
| `thumbnail` | String (URL) | Thumbnail image (preview before 3D loads) |
| `alt` | String | Accessible description |
| `sort_order` | Integer | Display sequence order |
| `is_primary` | Boolean | Primary display image flag |

---

### 2.2 Sales Domain

#### `Orders`
| Column Name | Type | Description |
|---|---|---|
| `order_id` | String (PK) | Human-readable ID (e.g., `ATS-20260927-0001`) |
| `customer_id` | String (FK) | Customer identifier |
| `customer_name` | String | Recipient full name |
| `customer_phone` | String | Recipient phone number (Vietnamese format) |
| `customer_email` | String | Optional notification email |
| `shipping_address` | String | Street and house number |
| `shipping_city` | String | Province / Municipality |
| `shipping_district` | String | District |
| `shipping_ward` | String | Ward |
| `notes` | String | Delivery instructions from customer |
| `subtotal` | Number | Sum of item totals (VND) |
| `discount_amount` | Number | Amount discounted by coupon (VND) |
| `coupon_code` | String | Applied coupon code if any |
| `shipping_fee` | Number | Shipping fee (VND, configured in settings) |
| `total_amount` | Number | Final payable amount ($Subtotal - Discount + Shipping$) |
| `payment_method` | Enum | `BANK_TRANSFER`, `COD` |
| `payment_status` | Enum | `UNPAID`, `PENDING_VERIFICATION`, `PAID`, `REFUNDED` |
| `order_status` | Enum | `PENDING`, `CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED` |
| `sales_channel` | Enum | `WEBSITE`, `FACEBOOK`, `ZALO`, `PHONE`, `POS` |
| `created_at` | ISO Timestamp | Order placement timestamp |
| `updated_at` | ISO Timestamp | Status update timestamp |

#### `OrderItems`
| Column Name | Type | Description |
|---|---|---|
| `item_id` | String (PK) | Order item ID |
| `order_id` | String (FK) | Reference to `Orders.order_id` |
| `product_id` | String (FK) | Reference to `Products.product_id` |
| `variant_id` | String (FK) | Reference to `ProductVariants.variant_id` |
| `product_name` | String | Product name at time of order |
| `variant_title` | String | Variant summary (e.g., `Size 41 - White`) |
| `sku` | String | Variant SKU |
| `price` | Number | Variant unit price at time of purchase |
| `quantity` | Integer | Quantity ordered |
| `total` | Number | Line item total ($Price \times Quantity$) |

#### `OrderStatusHistory`
| Column Name | Type | Description |
|---|---|---|
| `history_id` | String (PK) | History log ID |
| `order_id` | String (FK) | Reference to `Orders.order_id` |
| `from_status` | String | Previous status |
| `to_status` | String | New status |
| `note` | String | Reason / operational remark |
| `changed_by` | String | Operator name or System |
| `created_at` | ISO Timestamp | Timestamp of transition |

#### `Payments`
| Column Name | Type | Description |
|---|---|---|
| `payment_id` | String (PK) | Payment record ID |
| `order_id` | String (FK) | Order ID reference |
| `amount` | Number | Paid amount |
| `payment_method` | String | `BANK_TRANSFER` |
| `status` | Enum | `PENDING`, `PAID`, `FAILED`, `REFUNDED` |
| `transaction_ref` | String | Bank transaction reference code |
| `note` | String | Payment memo or verification note |
| `verified_at` | ISO Timestamp | When admin approved payment |
| `verified_by` | String | Admin identifier |
| `created_at` | ISO Timestamp | Payment creation timestamp |

#### `Returns` & `Exchanges`
- `Returns`: Tracks customer returns, reasons, condition checks, and refunds.
- `Exchanges`: Tracks size/color swaps (e.g. Size 40 swapped for Size 41) with cross-variant stock adjustment.

---

### 2.3 Inventory Domain

#### `Inventory`
| Column Name | Type | Description |
|---|---|---|
| `inventory_id` | String (PK) | Inventory ID |
| `variant_id` | String (FK) | Reference to `ProductVariants.variant_id` |
| `stock` | Integer | Physical stock |
| `reserved_stock` | Integer | Units locked in pending checkout orders |
| `available_stock` | Integer | Calculated field ($Stock - ReservedStock$) |
| `low_stock_threshold` | Integer | Threshold for low stock badge (default: 2) |
| `updated_at` | ISO Timestamp | Last stock mutation |

#### `InventoryLogs`
| Column Name | Type | Description |
|---|---|---|
| `log_id` | String (PK) | Inventory audit ID |
| `variant_id` | String (FK) | Reference to variant |
| `change_type` | Enum | `SALE`, `CANCEL`, `RETURN`, `ADJUSTMENT`, `RESTOCK` |
| `quantity_change` | Integer | Signed delta (e.g., `-1`, `+5`) |
| `before_stock` | Integer | Stock count prior to mutation |
| `after_stock` | Integer | Stock count post mutation |
| `reason` | String | Mandatory operator rationale |
| `user_id` | String | Operator ID |
| `created_at` | ISO Timestamp | Timestamp of modification |

---

### 2.4 Promotion & Content Domain

#### `Coupons`
| Column Name | Type | Description |
|---|---|---|
| `coupon_id` | String (PK) | Coupon ID |
| `coupon_code` | String (Unique)| e.g., `ANHTHU10`, `SNEAKER50K` |
| `type` | Enum | `PERCENTAGE` or `FIXED` |
| `value` | Number | Discount value (e.g. 10 for 10%, 50000 for 50,000 VND) |
| `minimum_order` | Number | Minimum subtotal required (VND) |
| `maximum_discount`| Number | Cap on discount amount for percentage coupons |
| `usage_limit` | Integer | Total allowable uses |
| `times_used` | Integer | Current redemption count |
| `start_at` | ISO Timestamp | Effective start date |
| `end_at` | ISO Timestamp | Expiration date |
| `active` | Boolean | Active flag |

#### `Settings`
Key-Value store containing shop configuration:
- `SHOP_NAME`: "Anh Thư Sneaker"
- `PHONE`: "0901234567" (placeholder customizable in Admin)
- `BANK_NAME`: "MBBank"
- `BANK_ACCOUNT_NUMBER`: "090123456789"
- `BANK_ACCOUNT_NAME`: "NGUYEN ANH THU"
- `BANK_QR_IMAGE`: "https://img.vietqr.io/image/MB-090123456789-compact2.png"
- `SHIPPING_FEE`: 30000
- `DELIVERY_ESTIMATE`: "3–5 ngày"
- `ZALO_LINK`, `FACEBOOK_LINK`, `INSTAGRAM_LINK`, `TIKTOK_LINK`
- `SHIPPING_POLICY`, `RETURN_POLICY`, `PRIVACY_POLICY`, `TERMS`

---

### 2.5 System Domain

#### `ActivityLogs`
Complete non-volatile operational audit trail:
- `log_id`: UUID
- `user_id`: Operator ID
- `action`: `CREATE`, `UPDATE`, `DELETE`, `STATUS_CHANGE`, `STOCK_ADJUST`
- `entity`: `ORDER`, `PRODUCT`, `INVENTORY`, `SETTINGS`, `COUPON`
- `entity_id`: Target entity ID
- `before_state`: JSON string of prior state
- `after_state`: JSON string of updated state
- `reason`: Operator explanation
- `created_at`: Timestamp
