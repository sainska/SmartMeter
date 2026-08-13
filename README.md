# Automating Consumer Electric Power Consumption
 
A full-stack web system that **automates consumer electric power consumption** reading and reporting: live meter data, transparent usage and billing for consumers, and role-based tools for utility staff (admin, billing, technician, manager). Wireless transmission (GSM / LoRa / MQTT) is **simulated in software** via transmission logs for the academic prototype.

---

## Project topic (official)

**Automating Consumer Electric Power Consumption**

This implementation delivers:

- Automated capture and storage of kWh readings
- Consumer portal to view usage, bills, and payments
- Staff portals for fleet monitoring, billing, faults, and field work
- Secure authentication and role-based data access (Supabase RLS)

---

## Problem addressed

Traditional metering relies on manual visits and opaque bills. Consumers often pay without understanding their usage. This system automates **electric power consumption** data flow and presents it clearly to consumers and utilities.

---

## Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | **Next.js 15**, **React 19**, JavaScript, custom responsive CSS |
| Backend | **Node.js**, **Express** (REST API) |
| Database | **PostgreSQL** via **Supabase** (RLS, seed data, migrations) |
| Auth | **Supabase Auth** (email/password, JWT sessions) |
| API security | Bearer tokens, role checks on server, RLS on database |

---

## Features by role

| Role | Capabilities |
|------|----------------|
| **Consumer** | Dashboard, usage charts, bills, payments, alerts, profile |
| **Administrator** | Fleet, consumers, billing, operations, analytics, user management, audit logs, system health |
| **Billing officer** | Tariffs, invoices, revenue KPIs |
| **Technician** | Work orders, maintenance records |
| **Manager** | Regional KPIs, analytics, operations |

All data screens load from the **live API → Supabase**.

### UI and security

- **Side navigation** on all portals (slide-out menu on phones, fixed sidebar on tablet/desktop). Bottom navigation was removed.
- **Responsive** layouts use fluid grids and `clamp()` typography for phones through desktop.
- **Dark / light mode** follows your OS `prefers-color-scheme` setting (no flash on load).
- **Idle logout:** sessions end after 10 minutes of inactivity (`IDLE_TIMEOUT_MS` in `frontend/lib/config.js`).
- **Role routing:** after login or registration, users are sent to the portal matching `profiles.role`.

### Database seed data

Demo records (consumers, meters, readings, bills, alerts, incidents, work orders, and related tables) are in `supabase/schema.sql`. Apply with `npm run db:push` from the project root.

---

## Project structure

```
SmartMeter/
├── frontend/          # Next.js app (port 3000 or 3001)
├── backend/           # Express API (port 3001)
├── supabase/          # schema.sql + migrations/
├── scripts/           # run-schema.mjs (db:push)
├── README.md
├── DEPLOY.md          # HTTPS deployment (Vercel + Render)
└── TODO.txt
```

---

## Prerequisites

- Node.js 18+
- Supabase project (URL, anon key, service role key, DB password)

---

## Setup

### 1. Environment variables

**`backend/.env`**

```env
PORT=3001
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
CORS_ORIGIN=http://localhost:3000,http://localhost:3001

# M-Pesa Daraja (optional — without these, STK runs in sandbox mock mode)
MPESA_ENV=sandbox
MPESA_CONSUMER_KEY=
MPESA_CONSUMER_SECRET=
MPESA_PASSKEY=
MPESA_SHORTCODE=174379
MPESA_CALLBACK_URL=https://your-api.onrender.com/api/payments/callback
```

**`frontend/.env.local`**

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-or-publishable-key
```

### 2. Install and database

```powershell
cd c:\Users\Admin\Desktop\SmartMeter
npm run install:all
# Password in backend/.env as SUPABASE_DB_PASSWORD, or:
# $env:SUPABASE_DB_PASSWORD = "your-db-password"
npm run db:push
```

### 3. Run

```powershell
npm run dev
```

- Frontend: http://localhost:3000 (or 3001)  
- API: http://localhost:3001/api/health  

### Payment gateway

| Feature | Endpoint |
|---------|----------|
| M-Pesa STK push | `POST /api/payments/stk-push` `{ bill_id, phone, amount }` |
| Daraja callback | `POST /api/payments/callback` (public HTTPS URL) |
| Payment status | `GET /api/payments/:id/status` |
| Invoice PDF | `GET /api/payments/bills/:billId/invoice.pdf` |
| Receipt PDF | `GET /api/payments/:id/receipt.pdf` |
| Bank / card / Airtel | `POST /api/payments/manual` |

Without M-Pesa credentials, STK push **simulates** a prompt and auto-completes after ~4 seconds (for demos). Run migration `003_payment_gateway.sql` via `npm run db:push`.

---

## Demo flow

1. `/register` → create account (e.g. `jane@example.com` for seed consumer data).
2. `/login` → sign in.
3. `/role-selection` → choose portal.
4. **Consumer:** view automated consumption readings and pay a bill.
5. **Admin:** fleet map, incidents, billing.

---

## HTTPS deployment

See **[DEPLOY.md](DEPLOY.md)** — Vercel (frontend) + Render (backend).

---

## Backend note

If you see `Missing SUPABASE_URL`, restart after pulling latest code. Env loads via `backend/src/loadEnv.js` before routes.

---

## Academic alignment

| Objective | Implementation |
|-----------|----------------|
| Automate consumption reading | `readings` table + dashboards |
| Web monitoring dashboard | Multi-role Next.js app |
| Wireless transmission (simulated) | `transmission_logs`, GSM/LoRa/MQTT |
| Database & security | Supabase PostgreSQL + Auth + RLS |
| Billing transparency | Bills, payments, consumer usage views |

---

University of Eastern Africa, Baraton · INSY492 · Mr Omari Dickson
