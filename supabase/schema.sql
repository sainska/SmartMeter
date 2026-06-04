-- SmartMeter Rural Platform — full schema + RLS + seed data
-- Project: yerwxvhgsqjermnzfqov

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- =============================================================================
-- ENUMS
-- =============================================================================
do $$ begin
  create type public.user_role as enum (
    'consumer', 'admin', 'technician', 'billing', 'manager'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.meter_status as enum ('online', 'offline', 'fault');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.consumer_status as enum ('active', 'suspended');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.bill_status as enum ('unpaid', 'paid', 'overdue');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.alert_type as enum ('high', 'fault', 'tamper', 'connectivity', 'low_balance');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.incident_status as enum ('open', 'in_progress', 'resolved');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.work_order_status as enum ('pending', 'accepted', 'completed', 'cancelled');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.priority_level as enum ('low', 'medium', 'high');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.transmission_status as enum ('success', 'failed');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.comm_tech as enum ('GSM', 'LoRa', 'WiFi', 'MQTT');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.payment_method as enum ('M-Pesa', 'Airtel Money', 'Bank', 'Card');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.tamper_status as enum ('under_review', 'confirmed', 'cleared');
exception when duplicate_object then null;
end $$;

-- =============================================================================
-- PROFILES (extends auth.users)
-- =============================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  phone text,
  email text,
  role public.user_role not null default 'consumer',
  employee_id text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_role_idx on public.profiles (role);
create index if not exists profiles_email_idx on public.profiles (email);

-- =============================================================================
-- TARIFFS
-- =============================================================================
create table if not exists public.tariffs (
  id text primary key,
  name text not null,
  tier_description text not null,
  rural_subsidy_pct numeric(5, 2) not null default 0,
  currency text not null default 'KES',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- =============================================================================
-- CONSUMERS
-- =============================================================================
create table if not exists public.consumers (
  id text primary key,
  profile_id uuid references public.profiles (id) on delete set null,
  full_name text not null,
  phone text not null,
  email text,
  ward text,
  service_address text,
  status public.consumer_status not null default 'active',
  outstanding_balance numeric(12, 2) not null default 0,
  currency text not null default 'KES',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists consumers_profile_id_idx on public.consumers (profile_id);
create index if not exists consumers_status_idx on public.consumers (status);

-- =============================================================================
-- METERS
-- =============================================================================
create table if not exists public.meters (
  id uuid primary key default uuid_generate_v4(),
  serial_number text not null unique,
  consumer_id text references public.consumers (id) on delete set null,
  display_name text,
  location text not null,
  region text not null,
  ward text,
  status public.meter_status not null default 'online',
  battery_pct smallint not null default 100 check (battery_pct between 0 and 100),
  signal_strength smallint not null default 5 check (signal_strength between 0 and 5),
  grid_lat smallint,
  grid_lng smallint,
  firmware_version text default 'v3.2.1',
  installation_date date,
  voltage numeric(8, 2),
  current_amp numeric(8, 2),
  connectivity text default 'online',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists meters_consumer_id_idx on public.meters (consumer_id);
create index if not exists meters_status_idx on public.meters (status);
create index if not exists meters_region_idx on public.meters (region);

-- =============================================================================
-- READINGS
-- =============================================================================
create table if not exists public.readings (
  id uuid primary key default uuid_generate_v4(),
  meter_id uuid not null references public.meters (id) on delete cascade,
  kwh numeric(12, 4) not null check (kwh >= 0),
  recorded_at timestamptz not null default now()
);

create index if not exists readings_meter_id_idx on public.readings (meter_id);
create index if not exists readings_recorded_at_idx on public.readings (recorded_at desc);

-- =============================================================================
-- BILLS
-- =============================================================================
create table if not exists public.bills (
  id uuid primary key default uuid_generate_v4(),
  consumer_id text not null references public.consumers (id) on delete cascade,
  period_label text not null,
  amount numeric(12, 2) not null check (amount >= 0),
  consumption_charges numeric(12, 2) not null default 0,
  taxes_fees numeric(12, 2) not null default 0,
  status public.bill_status not null default 'unpaid',
  due_date date not null,
  currency text not null default 'KES',
  created_at timestamptz not null default now()
);

create index if not exists bills_consumer_id_idx on public.bills (consumer_id);
create index if not exists bills_status_idx on public.bills (status);

-- =============================================================================
-- PAYMENTS
-- =============================================================================
create table if not exists public.payments (
  id uuid primary key default uuid_generate_v4(),
  consumer_id text not null references public.consumers (id) on delete cascade,
  bill_id uuid references public.bills (id) on delete set null,
  amount numeric(12, 2) not null check (amount > 0),
  method public.payment_method not null,
  reference_code text,
  status text not null default 'completed',
  paid_at timestamptz not null default now()
);

create index if not exists payments_consumer_id_idx on public.payments (consumer_id);

-- =============================================================================
-- ALERTS
-- =============================================================================
create table if not exists public.alerts (
  id uuid primary key default uuid_generate_v4(),
  consumer_id text references public.consumers (id) on delete cascade,
  meter_id uuid references public.meters (id) on delete set null,
  alert_type public.alert_type not null,
  title text not null,
  body text,
  is_read boolean not null default false,
  is_system_wide boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists alerts_consumer_id_idx on public.alerts (consumer_id);
create index if not exists alerts_created_at_idx on public.alerts (created_at desc);

-- =============================================================================
-- INCIDENTS
-- =============================================================================
create table if not exists public.incidents (
  id text primary key,
  incident_type text not null,
  meter_id uuid references public.meters (id) on delete set null,
  status public.incident_status not null default 'open',
  assignee_name text,
  assignee_profile_id uuid references public.profiles (id) on delete set null,
  description text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index if not exists incidents_status_idx on public.incidents (status);

-- =============================================================================
-- TAMPER EVENTS
-- =============================================================================
create table if not exists public.tamper_events (
  id text primary key,
  meter_id uuid references public.meters (id) on delete set null,
  event_type text not null,
  status public.tamper_status not null default 'under_review',
  notes text,
  created_at timestamptz not null default now()
);

-- =============================================================================
-- WORK ORDERS
-- =============================================================================
create table if not exists public.work_orders (
  id text primary key,
  task text not null,
  description text,
  location text not null,
  meter_id uuid references public.meters (id) on delete set null,
  priority public.priority_level not null default 'medium',
  status public.work_order_status not null default 'pending',
  scheduled_date date,
  assignee_profile_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists work_orders_status_idx on public.work_orders (status);

-- =============================================================================
-- MAINTENANCE RECORDS
-- =============================================================================
create table if not exists public.maintenance_records (
  id uuid primary key default uuid_generate_v4(),
  meter_id uuid references public.meters (id) on delete set null,
  work_order_id text references public.work_orders (id) on delete set null,
  record_type text not null,
  notes text,
  performed_at date not null default current_date,
  technician_name text
);

-- =============================================================================
-- TRANSMISSION LOGS
-- =============================================================================
create table if not exists public.transmission_logs (
  id uuid primary key default uuid_generate_v4(),
  meter_id uuid not null references public.meters (id) on delete cascade,
  transmitted_at timestamptz not null default now(),
  status public.transmission_status not null,
  technology public.comm_tech not null,
  latency_ms integer,
  error_message text
);

create index if not exists transmission_logs_meter_id_idx on public.transmission_logs (meter_id);

-- =============================================================================
-- AUDIT LOGS
-- =============================================================================
create table if not exists public.audit_logs (
  id uuid primary key default uuid_generate_v4(),
  actor_email text,
  actor_profile_id uuid references public.profiles (id) on delete set null,
  action text not null,
  detail text,
  created_at timestamptz not null default now()
);

-- =============================================================================
-- NOTIFICATION PREFERENCES
-- =============================================================================
create table if not exists public.notification_preferences (
  profile_id uuid primary key references public.profiles (id) on delete cascade,
  sms_bill boolean not null default true,
  sms_payment boolean not null default true,
  sms_fault boolean not null default true,
  email_statement boolean not null default false,
  push_connectivity boolean not null default true,
  updated_at timestamptz not null default now()
);

-- =============================================================================
-- SYSTEM SETTINGS
-- =============================================================================
create table if not exists public.system_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- =============================================================================
-- HELPER FUNCTIONS (RLS)
-- =============================================================================
create or replace function public.get_my_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role in ('admin', 'manager', 'billing', 'technician') from public.profiles where id = auth.uid()),
    false
  );
$$;

create or replace function public.is_admin_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role in ('admin', 'manager') from public.profiles where id = auth.uid()),
    false
  );
$$;

create or replace function public.my_consumer_id()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select id from public.consumers where profile_id = auth.uid() limit 1;
$$;

create or replace function public.my_meter_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select m.id from public.meters m
  join public.consumers c on c.id = m.consumer_id
  where c.profile_id = auth.uid();
$$;

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data->>'phone',
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'consumer')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================
alter table public.profiles enable row level security;
alter table public.consumers enable row level security;
alter table public.meters enable row level security;
alter table public.readings enable row level security;
alter table public.tariffs enable row level security;
alter table public.bills enable row level security;
alter table public.payments enable row level security;
alter table public.alerts enable row level security;
alter table public.incidents enable row level security;
alter table public.tamper_events enable row level security;
alter table public.work_orders enable row level security;
alter table public.maintenance_records enable row level security;
alter table public.transmission_logs enable row level security;
alter table public.audit_logs enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.system_settings enable row level security;

-- Profiles
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
drop policy if exists "profiles_select_staff" on public.profiles;
create policy "profiles_select_staff" on public.profiles for select using (public.is_staff());
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- Consumers
drop policy if exists "consumers_select_own" on public.consumers;
create policy "consumers_select_own" on public.consumers for select using (profile_id = auth.uid());
drop policy if exists "consumers_select_staff" on public.consumers;
create policy "consumers_select_staff" on public.consumers for select using (public.is_staff());
drop policy if exists "consumers_insert_staff" on public.consumers;
create policy "consumers_insert_staff" on public.consumers for insert with check (public.is_admin_staff() or public.get_my_role() = 'billing');
drop policy if exists "consumers_update_staff" on public.consumers;
create policy "consumers_update_staff" on public.consumers for update using (public.is_admin_staff() or public.get_my_role() = 'billing');

-- Meters
drop policy if exists "meters_select_own" on public.meters;
create policy "meters_select_own" on public.meters for select using (id in (select public.my_meter_ids()));
drop policy if exists "meters_select_staff" on public.meters;
create policy "meters_select_staff" on public.meters for select using (public.is_staff());
drop policy if exists "meters_modify_admin" on public.meters;
create policy "meters_modify_admin" on public.meters for all using (public.is_admin_staff());

-- Readings
drop policy if exists "readings_select_own" on public.readings;
create policy "readings_select_own" on public.readings for select using (meter_id in (select public.my_meter_ids()));
drop policy if exists "readings_select_staff" on public.readings;
create policy "readings_select_staff" on public.readings for select using (public.is_staff());
drop policy if exists "readings_insert_staff" on public.readings;
create policy "readings_insert_staff" on public.readings for insert with check (public.is_staff());

-- Tariffs (read all authenticated; write admin/billing)
drop policy if exists "tariffs_select_auth" on public.tariffs;
create policy "tariffs_select_auth" on public.tariffs for select to authenticated using (true);
drop policy if exists "tariffs_modify_billing" on public.tariffs;
create policy "tariffs_modify_billing" on public.tariffs for all using (
  public.get_my_role() in ('admin', 'billing', 'manager')
);

-- Bills
drop policy if exists "bills_select_own" on public.bills;
create policy "bills_select_own" on public.bills for select using (consumer_id = public.my_consumer_id());
drop policy if exists "bills_select_staff" on public.bills;
create policy "bills_select_staff" on public.bills for select using (public.is_staff());
drop policy if exists "bills_modify_billing" on public.bills;
create policy "bills_modify_billing" on public.bills for all using (
  public.get_my_role() in ('admin', 'billing', 'manager')
);

-- Payments
drop policy if exists "payments_select_own" on public.payments;
create policy "payments_select_own" on public.payments for select using (consumer_id = public.my_consumer_id());
drop policy if exists "payments_insert_own" on public.payments;
create policy "payments_insert_own" on public.payments for insert with check (consumer_id = public.my_consumer_id());
drop policy if exists "payments_select_staff" on public.payments;
create policy "payments_select_staff" on public.payments for select using (public.is_staff());

-- Alerts
drop policy if exists "alerts_select_own" on public.alerts;
create policy "alerts_select_own" on public.alerts for select using (
  consumer_id = public.my_consumer_id() or is_system_wide = true
);
drop policy if exists "alerts_select_staff" on public.alerts;
create policy "alerts_select_staff" on public.alerts for select using (public.is_staff());
drop policy if exists "alerts_update_own" on public.alerts;
create policy "alerts_update_own" on public.alerts for update using (consumer_id = public.my_consumer_id());

-- Incidents, tamper, work orders, maintenance, transmission — staff
drop policy if exists "incidents_staff" on public.incidents;
create policy "incidents_staff" on public.incidents for all using (public.is_staff());
drop policy if exists "tamper_staff" on public.tamper_events;
create policy "tamper_staff" on public.tamper_events for all using (public.is_staff());
drop policy if exists "work_orders_staff" on public.work_orders;
create policy "work_orders_staff" on public.work_orders for all using (public.is_staff());
drop policy if exists "work_orders_technician_update" on public.work_orders;
create policy "work_orders_technician_update" on public.work_orders for update using (
  public.get_my_role() = 'technician' and (assignee_profile_id = auth.uid() or assignee_profile_id is null)
);
drop policy if exists "maintenance_staff" on public.maintenance_records;
create policy "maintenance_staff" on public.maintenance_records for all using (public.is_staff());
drop policy if exists "transmission_staff" on public.transmission_logs;
create policy "transmission_staff" on public.transmission_logs for all using (public.is_staff());
drop policy if exists "transmission_consumer_read" on public.transmission_logs;
create policy "transmission_consumer_read" on public.transmission_logs for select using (
  meter_id in (select public.my_meter_ids())
);

-- Audit logs — admin only read; insert staff
drop policy if exists "audit_admin_read" on public.audit_logs;
create policy "audit_admin_read" on public.audit_logs for select using (public.get_my_role() = 'admin');
drop policy if exists "audit_staff_insert" on public.audit_logs;
create policy "audit_staff_insert" on public.audit_logs for insert with check (public.is_staff());

-- Notification prefs
drop policy if exists "notif_own" on public.notification_preferences;
create policy "notif_own" on public.notification_preferences for all using (profile_id = auth.uid());

-- System settings — staff read, admin write
drop policy if exists "settings_staff_read" on public.system_settings;
create policy "settings_staff_read" on public.system_settings for select using (public.is_staff());
drop policy if exists "settings_admin_write" on public.system_settings;
create policy "settings_admin_write" on public.system_settings for all using (public.get_my_role() = 'admin');

-- Anon: no access (default deny). Backend service_role bypasses RLS.

-- =============================================================================
-- SEED DATA (from UI mock data)
-- =============================================================================

insert into public.tariffs (id, name, tier_description, rural_subsidy_pct)
values
  ('T1', 'Rural domestic', '0-50 / 51-200 / 200+', 15),
  ('T2', 'Small business', 'Flat + peak', 0)
on conflict (id) do update set
  name = excluded.name,
  tier_description = excluded.tier_description,
  rural_subsidy_pct = excluded.rural_subsidy_pct;

insert into public.consumers (id, full_name, phone, email, ward, status, outstanding_balance)
values
  ('C-1001', 'Jane Wanjiku', '+254712345678', 'jane@example.com', 'Kirinyaga Ward 4', 'active', 1200),
  ('C-1002', 'Peter Ochieng', '+254723456789', 'peter@example.com', 'Homa Bay Sector 2', 'suspended', 0),
  ('C-1003', 'Mary Akinyi', '+254734567890', 'mary@example.com', 'Kisumu Rural Route 7', 'active', 0),
  ('C-1004', 'James Mutua', '+254745678901', 'james@example.com', 'Machakos East 12', 'active', 0),
  ('C-1005', 'Grace Mwangi', '+254756789012', 'grace@example.com', 'Embu North 3', 'active', 0)
on conflict (id) do update set
  full_name = excluded.full_name,
  phone = excluded.phone,
  email = excluded.email,
  ward = excluded.ward,
  status = excluded.status,
  outstanding_balance = excluded.outstanding_balance;

insert into public.meters (
  serial_number, consumer_id, display_name, location, region, ward,
  status, battery_pct, signal_strength, grid_lat, grid_lng,
  installation_date, voltage, current_amp
)
values
  ('SM-001-A', 'C-1001', 'Jane Wanjiku', 'Kirinyaga Ward 4', 'Central', 'Kirinyaga Ward 4', 'online', 87, 4, 2, 1, '2024-03-12', 230, 4.2),
  ('SM-002-B', 'C-1002', 'Peter Ochieng', 'Homa Bay Sector 2', 'Nyanza', 'Homa Bay Sector 2', 'offline', 12, 1, 1, 2, '2024-01-20', 0, 0),
  ('SM-003-C', 'C-1003', 'Mary Akinyi', 'Kisumu Rural Route 7', 'Nyanza', 'Kisumu Rural Route 7', 'online', 64, 3, 2, 3, '2024-05-08', 228, 3.8),
  ('SM-004-D', 'C-1004', 'James Mutua', 'Machakos East 12', 'Eastern', 'Machakos East 12', 'fault', 45, 2, 3, 2, '2024-02-14', 225, 5.1),
  ('SM-005-E', null, 'Unassigned', 'Kirinyaga Ward 9', 'Central', 'Kirinyaga Ward 9', 'online', 92, 5, 1, 1, '2025-11-01', 231, 0),
  ('SM-006-F', 'C-1005', 'Grace Mwangi', 'Embu North 3', 'Eastern', 'Embu North 3', 'online', 71, 4, 3, 1, '2024-06-22', 229, 3.5)
on conflict (serial_number) do update set
  consumer_id = excluded.consumer_id,
  display_name = excluded.display_name,
  location = excluded.location,
  region = excluded.region,
  status = excluded.status,
  battery_pct = excluded.battery_pct,
  signal_strength = excluded.signal_strength;

-- Bills
insert into public.bills (consumer_id, period_label, amount, consumption_charges, taxes_fees, status, due_date)
select 'C-1001', 'May 2026', 2840, 2420, 420, 'unpaid', '2026-06-10'
where not exists (select 1 from public.bills where consumer_id = 'C-1001' and period_label = 'May 2026');

insert into public.bills (consumer_id, period_label, amount, consumption_charges, taxes_fees, status, due_date)
select 'C-1001', 'Apr 2026', 2650, 2280, 370, 'paid', '2026-05-10'
where not exists (select 1 from public.bills where consumer_id = 'C-1001' and period_label = 'Apr 2026');

insert into public.bills (consumer_id, period_label, amount, consumption_charges, taxes_fees, status, due_date)
select 'C-1001', 'Mar 2026', 2410, 2100, 310, 'paid', '2026-04-10'
where not exists (select 1 from public.bills where consumer_id = 'C-1001' and period_label = 'Mar 2026');

-- Payments
insert into public.payments (consumer_id, amount, method, reference_code, paid_at)
select 'C-1001', 2650, 'M-Pesa', 'QHK7X2', '2026-05-08'::timestamptz
where not exists (select 1 from public.payments where reference_code = 'QHK7X2');

insert into public.payments (consumer_id, amount, method, reference_code, paid_at)
select 'C-1001', 2410, 'Bank', 'BNK-9921', '2026-04-09'::timestamptz
where not exists (select 1 from public.payments where reference_code = 'BNK-9921');

-- Readings (sample per meter)
insert into public.readings (meter_id, kwh, recorded_at)
select m.id, v.kwh, v.recorded_at
from public.meters m
cross join lateral (
  values
    (24.8::numeric, now() - interval '2 hours'),
    (22.1::numeric, now() - interval '1 day'),
    (18.4::numeric, now() - interval '7 days')
) as v(kwh, recorded_at)
where m.serial_number = 'SM-001-A'
  and not exists (
    select 1 from public.readings r
    where r.meter_id = m.id and r.recorded_at > now() - interval '3 hours'
    limit 1
  );

-- Alerts
insert into public.alerts (consumer_id, meter_id, alert_type, title, is_read, created_at)
select 'C-1001', m.id, 'high', 'High consumption detected', false, now() - interval '2 hours'
from public.meters m where m.serial_number = 'SM-001-A'
  and not exists (select 1 from public.alerts where title = 'High consumption detected' and consumer_id = 'C-1001');

insert into public.alerts (consumer_id, meter_id, alert_type, title, is_read, created_at)
select 'C-1001', m.id, 'fault', 'Brief connectivity drop', true, now() - interval '1 day'
from public.meters m where m.serial_number = 'SM-001-A'
  and not exists (select 1 from public.alerts where title = 'Brief connectivity drop' and consumer_id = 'C-1001');

insert into public.alerts (consumer_id, meter_id, alert_type, title, is_read, created_at)
select 'C-1001', m.id, 'tamper', 'Tamper check cleared', true, now() - interval '3 days'
from public.meters m where m.serial_number = 'SM-001-A'
  and not exists (select 1 from public.alerts where title = 'Tamper check cleared' and consumer_id = 'C-1001');

-- Incidents
insert into public.incidents (id, incident_type, meter_id, status, assignee_name)
select 'INC-2401', 'Communication failure', m.id, 'open', 'Unassigned'
from public.meters m where m.serial_number = 'SM-002-B'
on conflict (id) do nothing;

insert into public.incidents (id, incident_type, meter_id, status, assignee_name)
select 'INC-2402', 'Battery low', m.id, 'in_progress', 'Samuel K.'
from public.meters m where m.serial_number = 'SM-002-B'
on conflict (id) do nothing;

insert into public.incidents (id, incident_type, meter_id, status, assignee_name)
select 'INC-2403', 'Tamper alert', m.id, 'resolved', 'Grace M.'
from public.meters m where m.serial_number = 'SM-004-D'
on conflict (id) do nothing;

-- Tamper events
insert into public.tamper_events (id, meter_id, event_type, status)
select 'T-01', m.id, 'Meter opening', 'under_review'
from public.meters m where m.serial_number = 'SM-004-D'
on conflict (id) do nothing;

insert into public.tamper_events (id, meter_id, event_type, status)
select 'T-02', m.id, 'Bypass attempt', 'confirmed'
from public.meters m where m.serial_number = 'SM-002-B'
on conflict (id) do nothing;

insert into public.tamper_events (id, meter_id, event_type, status)
select 'T-03', m.id, 'Data anomaly', 'cleared'
from public.meters m where m.serial_number = 'SM-001-A'
on conflict (id) do nothing;

-- Work orders
insert into public.work_orders (id, task, description, location, meter_id, priority, status, scheduled_date)
select 'WO-501', 'Replace meter battery',
  'Battery below 15%. Replace pack and verify transmission.',
  'Homa Bay Sector 2', m.id, 'high', 'pending', '2026-06-05'
from public.meters m where m.serial_number = 'SM-002-B'
on conflict (id) do nothing;

insert into public.work_orders (id, task, description, location, meter_id, priority, status, scheduled_date)
select 'WO-502', 'New installation',
  'Install prepaid smart meter for new consumer connection.',
  'Kirinyaga Ward 9', m.id, 'medium', 'accepted', '2026-06-06'
from public.meters m where m.serial_number = 'SM-005-E'
on conflict (id) do nothing;

insert into public.work_orders (id, task, description, location, meter_id, priority, status, scheduled_date, completed_at)
select 'WO-503', 'Signal diagnostics',
  'LoRa/GSM signal test and antenna check completed.',
  'Kisumu Rural Route 7', m.id, 'low', 'completed', '2026-06-01', '2026-06-01'::timestamptz
from public.meters m where m.serial_number = 'SM-003-C'
on conflict (id) do nothing;

-- Maintenance records
insert into public.maintenance_records (meter_id, work_order_id, record_type, notes, performed_at, technician_name)
select m.id, 'WO-501', 'Battery replacement', 'Scheduled', '2026-05-28', 'Samuel K.'
from public.meters m where m.serial_number = 'SM-002-B'
  and not exists (select 1 from public.maintenance_records where work_order_id = 'WO-501');

insert into public.maintenance_records (meter_id, record_type, notes, performed_at, technician_name)
select m.id, 'Inspection', 'Passed', '2026-05-20', 'Samuel K.'
from public.meters m where m.serial_number = 'SM-001-A'
  and not exists (select 1 from public.maintenance_records where meter_id = m.id and record_type = 'Inspection');

-- Transmission logs
insert into public.transmission_logs (meter_id, transmitted_at, status, technology)
select m.id, now() - interval '10 minutes', 'success', 'GSM'
from public.meters m where m.serial_number = 'SM-001-A';

insert into public.transmission_logs (meter_id, transmitted_at, status, technology, error_message)
select m.id, now() - interval '15 minutes', 'failed', 'LoRa', 'Timeout after 3 retries'
from public.meters m where m.serial_number = 'SM-002-B';

insert into public.transmission_logs (meter_id, transmitted_at, status, technology)
select m.id, now() - interval '20 minutes', 'success', 'MQTT'
from public.meters m where m.serial_number = 'SM-003-C';

-- Audit logs
insert into public.audit_logs (actor_email, action, detail, created_at)
select v.actor_email, v.action, v.detail, v.created_at
from (values
  ('admin@utility.ke', 'Login', 'Success', now() - interval '1 hour'),
  ('system', 'Meter action', 'Remote sync SM-001-A', now() - interval '2 hours'),
  ('billing@utility.ke', 'Tariff edit', 'Rural domestic updated', now() - interval '1 day')
) as v(actor_email, action, detail, created_at)
where not exists (select 1 from public.audit_logs limit 1);

-- System settings
insert into public.system_settings (key, value)
values
  ('regional', '{"region":"Central Kenya","currency":"KES","timezone":"Africa/Nairobi"}'::jsonb),
  ('app_version', '"2.4.1"'::jsonb)
on conflict (key) do update set value = excluded.value, updated_at = now();

-- Grant API access
grant usage on schema public to anon, authenticated;
grant select on all tables in schema public to anon, authenticated;
grant insert, update, delete on all tables in schema public to authenticated;
grant all on all tables in schema public to service_role;
