-- Payment gateway: STK push tracking, callbacks, invoice numbers

alter table public.bills
  add column if not exists invoice_number text;

update public.bills
set invoice_number = 'INV-' || upper(substring(replace(id::text, '-', '') from 1 for 8))
where invoice_number is null;

create unique index if not exists bills_invoice_number_idx on public.bills (invoice_number)
  where invoice_number is not null;

alter table public.payments
  add column if not exists phone text,
  add column if not exists checkout_request_id text,
  add column if not exists merchant_request_id text,
  add column if not exists mpesa_receipt text,
  add column if not exists callback_payload jsonb,
  add column if not exists failure_reason text,
  add column if not exists updated_at timestamptz not null default now();

create unique index if not exists payments_checkout_request_id_idx
  on public.payments (checkout_request_id)
  where checkout_request_id is not null;

create index if not exists payments_status_idx on public.payments (status);

comment on column public.payments.status is 'pending | processing | completed | failed | cancelled';
