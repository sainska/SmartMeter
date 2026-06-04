# Supabase database

## Project

- **URL:** `https://yerwxvhgsqjermnzfqov.supabase.co`
- **Schema file:** `schema.sql` (tables, RLS, seed data from UI mocks)

## Tables

| Table | Purpose |
|-------|---------|
| `profiles` | User roles (consumer, admin, technician, billing, manager) |
| `consumers` | Consumer accounts |
| `meters` | Smart meter fleet |
| `readings` | kWh readings |
| `tariffs` | Pricing tiers |
| `bills` | Invoices |
| `payments` | M-Pesa, bank, etc. |
| `alerts` | Notifications |
| `incidents` | Fault / outage workflow |
| `tamper_events` | Tamper detection |
| `work_orders` | Technician jobs |
| `maintenance_records` | Field maintenance |
| `transmission_logs` | GSM / LoRa / MQTT logs |
| `audit_logs` | Super admin audit trail |
| `notification_preferences` | Per-user channel settings |
| `system_settings` | Regional config |

## RLS summary

- **Consumers** see only their own consumer, meters, readings, bills, payments, alerts.
- **Staff** (`admin`, `manager`, `billing`, `technician`) see operational data per role policies.
- **Backend** uses `SUPABASE_SERVICE_ROLE_KEY` and bypasses RLS.

## Apply schema and migrations

Runs `schema.sql` once, then any new files in `supabase/migrations/` (tracked in `schema_migrations`):

```powershell
cd c:\Users\Admin\Desktop\SmartMeter
$env:SUPABASE_DB_PASSWORD = "your-db-password"
npm run db:push
```

Or paste SQL into **Supabase Dashboard → SQL → New query → Run**.

## Auth and roles

1. **Register** at `/register` (consumer, staff, or installer).
2. **Sign in** at `/login` with email + password (Supabase Auth).
3. **Select role** at `/role-selection` — updates `profiles.role` and links consumer by email when role is `consumer`.
4. Seed consumer `jane@example.com` links automatically if you register with that email.

Disable email confirmation in Supabase **Auth → Providers → Email** for local dev if sign-up does not return a session immediately.

## Environment variables

**Frontend** (`frontend/.env.local`):

```
NEXT_PUBLIC_SUPABASE_URL=https://yerwxvhgsqjermnzfqov.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-publishable-or-anon-key
```

**Backend** (`backend/.env`):

```
SUPABASE_URL=https://yerwxvhgsqjermnzfqov.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Get the **service role** key from Dashboard → **Settings → API** (keep secret).

## Link auth users to consumers

After a user signs up, link their profile to a consumer row:

```sql
update public.consumers
set profile_id = 'USER_UUID_FROM_AUTH'
where email = 'jane@example.com';
```

On signup, set role in metadata: `{ "role": "admin" }` (handled by `handle_new_user` trigger).
