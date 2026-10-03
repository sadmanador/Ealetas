# Ealetas — Fine Jewelry Atelier & E-Commerce

A full-stack luxury jewelry store and atelier administration system built with **Next.js 14 (App Router)**, **PostgreSQL (Neon Serverless)**, **Prisma ORM**, **NextAuth.js**, **Tailwind CSS**, **bd-geo-address**, and **BulkSMSBD Gateway**.

---

## 💎 Features

### 🛍️ Storefront & Customer Experience (No Customer Auth Required)
- **Interactive Jewelry Cards**:
  - Image hover switcher & dot slider beneath each card (up to 3 angles).
  - Instant **Add to Bag** and **Buy Now** buttons.
  - Live stock indicators (*In Stock*, *Low Stock (≤5 left)*, *Sold Out*).
- **Phone-First Smart Checkout**:
  - Customer enters their Bangladeshi phone number first.
  - Automatic customer profile lookup: if the customer has ordered before, their Name and Address are automatically prefilled while remaining editable.
- **Bangladesh Geo Address Integration (`bd-geo-address`)**:
  - Cascading Division → District → Upazila dropdowns powered by `@sadmanador/bd-geo-address`.
- **Dynamic Delivery Charges**:
  - Inside Dhaka City Corporation (North & South): **80 ৳** (configurable).
  - Outside Dhaka / Nationwide: **120 ৳** (configurable).
  - Real-time total calculation.

### 🛡️ Atelier Administration (`/admin`)
- **NextAuth Authentication**:
  - 2 Pre-seeded Admin accounts:
    - **Curator**: `admin1@ealetas.com` / `Admin1234!`
    - **Logistics**: `admin2@ealetas.com` / `Admin1234!`
- **Dashboard & Income Tracking**:
  - Real-time income, orders count, stock inventory, and travel expenditure.
  - Time filter: **Today**, **This Week**, **This Month**, or **Specific Day** picker.
- **Product Management & Stock for Logistics**:
  - Enlist new pieces with Name, Category, Retail Price, Wholesale Cost, Stock, Tags, Description.
  - Up to 3 high-res images stored directly in the database under Neon DB credentials (or via image URLs).
- **Order Pipeline & Automated Stock Deduction**:
  - Status pipeline: `pending` → `confirmed` → `in_transit` → `delivered` → `cancelled` / `returned`.
  - **Automated Inventory Rule**: When an order status is marked as **`delivered`**, the stock quantity is automatically decremented from inventory.
- **Automated SMS Alerts (`BulkSMSBD`)**:
  - Whenever an order is placed, an instant SMS alert is dispatched to all active admin phone numbers via BulkSMSBD (`http://bulksmsbd.net/api/smsapi`).
- **Procurement & Travel Cost Tracker**:
  - Log daily travel expenses (transport, food/meals, wholesale product purchases, other costs, trip notes).
  - View historical trip logs and total expenditure by date.
- **Page & Product Analytics**:
  - Real-time page view and product popularity tracking.
- **Admin Profile & SMS Configuration**:
  - Admins can update their personal mobile numbers to ensure order SMS notifications arrive on their phones.
- **Store Settings**:
  - Dynamically configure Inside Dhaka and Outside Dhaka delivery fees.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables (`.env`)
Create a `.env` file with:
```env
DATABASE_URL="postgresql://neondb_owner:npg_XMHLg9fUq6FW@ep-steep-haze-azhi2h6n-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="ealetas-super-secret-jwt-key-2026-auth"

BULKSMSBD_API_KEY="db5Xqgy4ArAkG1FWWpxZ"
BULKSMSBD_SENDER_ID="8809617619300"
BULKSMSBD_API_URL="http://bulksmsbd.net/api/smsapi"
```

### 3. Sync Database & Seed Admin Accounts
```bash
npm run prisma:push
npm run prisma:seed
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) for the storefront or [http://localhost:3000/admin](http://localhost:3000/admin) for the admin portal.

### 5. Production Build
```bash
npm run build
npm start
```
