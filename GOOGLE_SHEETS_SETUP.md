# GOOGLE SHEETS SETUP & INTEGRATION MANUAL — ANH THƯ SNEAKER
**Target Audience:** Shop Administrator / Developer  
**Status:** Dual-Mode Active (Live Google Sheets API + Local JSON Storage Sync)

---

## 1. Architecture: The Dual-Mode Repository

Anh Thư Sneaker uses a **decoupled repository architecture**:
1. **Frontend Isolation:** Neither the storefront nor the admin UI interacts directly with Google Sheets.
2. **Server-Side Security:** All communications pass through Next.js server endpoints (`/api/*`) using the Google Sheets API v4 SDK with Service Account credentials.
3. **Dual-Mode Persistence:**
   - **Mode A (Live Google Sheets):** When `GOOGLE_SHEET_ID`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, and `GOOGLE_PRIVATE_KEY` are provided in `.env.local`, the server connects directly to the Google Spreadsheet.
   - **Mode B (Autonomous Local Store):** When environment variables are not yet populated, the system automatically runs on an identical schema-mapped Local Store (`/data/local-db.json`), ensuring zero crashes, zero 500 errors, and instantaneous local testing.
   - **Sync on Activation:** Once Google credentials are added, the system can sync the schema and seed data directly to the remote Google Sheet.

---

## 2. Step-by-Step Google Cloud Configuration

### Step 1: Create a Google Cloud Project
1. Visit the [Google Cloud Console](https://console.cloud.google.com/).
2. Click **Select a project** $\to$ **New Project**.
3. Name the project `AnhThuSneaker-Store` and click **Create**.

### Step 2: Enable Google Sheets & Google Drive APIs
1. In the sidebar, navigate to **APIs & Services** $\to$ **Library**.
2. Search for **Google Sheets API** and click **Enable**.
3. Search for **Google Drive API** and click **Enable**.

### Step 3: Create a Service Account & Credentials
1. Go to **APIs & Services** $\to$ **Credentials**.
2. Click **Create Credentials** $\to$ **Service Account**.
3. Service account name: `anh-thu-sneaker-bot`.
4. Click **Create and Continue**, then grant role **Editor**, and click **Done**.
5. Click on the newly created Service Account $\to$ **Keys** tab.
6. Click **Add Key** $\to$ **Create new key** $\to$ Select **JSON** $\to$ **Create**.
7. A JSON credentials file will download to your computer.

### Step 4: Create and Share the Google Sheet
1. Open [Google Sheets](https://sheets.new) and create a new spreadsheet.
2. Title it: `Anh Thu Sneaker - Database Production`.
3. Copy the **Spreadsheet ID** from the browser address bar:
   `https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit`
4. Click the green **Share** button in the top right.
5. Paste the `client_email` from your downloaded Service Account JSON (e.g. `anh-thu-sneaker-bot@anhthusneaker-store.iam.gserviceaccount.com`).
6. Give it **Editor** permissions and click **Share**.

---

## 3. Environment Variables Configuration

Copy `.env.example` to `.env.local` and fill in the values:

```bash
# ==============================================================================
# ANH THƯ SNEAKER — ENVIRONMENT VARIABLES
# ==============================================================================

# Server Environment
NODE_ENV=production
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Google Sheets Persistence Layer
GOOGLE_SHEET_ID=your_google_sheet_id_here
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQD...==\n-----END PRIVATE KEY-----\n"

# Admin Authentication
ADMIN_SECRET_KEY=anhthu_sneaker_secure_operator_token_2026

# Storefront Brand & Payment Settings (Editable from Admin)
NEXT_PUBLIC_SHOP_NAME="Anh Thư Sneaker"
NEXT_PUBLIC_DEFAULT_SHIPPING_FEE=30000
NEXT_PUBLIC_DELIVERY_ESTIMATE="3–5 ngày"
```

---

## 4. Automatic Sheet Initialization & Seed Script

The repository includes an automated script:
```bash
npm run db:init-sheet
```
This utility:
1. Connects to your Google Spreadsheet via API.
2. Creates all **32 sheet tabs** with exact columns and formatting if they do not exist.
3. Automatically populates initial categories (`Sneaker`, `Giày`, `Quần áo`, `Phụ kiện`, `Sale`), starter sneaker catalog with 3D metadata, store settings, and shipping methods.
