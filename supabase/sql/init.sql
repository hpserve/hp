-- ============================================================
-- HP Enterprise — Supabase Schema for hpserve.site
-- ============================================================

-- ---------- 1. hpe_settings (singleton business settings) ----------
create table if not exists public.hpe_settings (
  id           text primary key default 'singleton',
  data         jsonb not null default '{}'::jsonb,
  updated_at   timestamptz not null default now()
);

-- ---------- 2. hpe_departments ----------
create table if not exists public.hpe_departments (
  id              text primary key,
  name            text not null,
  "order"         int not null default 0,
  description     text,
  image           text,
  status          text not null default 'Active',
  display_order   int not null default 0,
  show_on_home    boolean not null default true,
  show_booking    boolean not null default true,
  show_enquiry    boolean not null default true,
  coming_soon_msg text default '',
  delay_msg       text default '',
  enable_price    boolean not null default true,
  enable_payment  boolean not null default true,
  enable_advance  boolean not null default true,
  min_booking     int not null default 1,
  contact_number  text default '',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ---------- 3. hpe_services ----------
create table if not exists public.hpe_services (
  id              text primary key,
  name            text not null,
  department      text,
  image           text,
  description     text default '',
  rate            numeric not null default 0,
  monthly         numeric,
  daily           numeric,
  hourly          numeric,
  visit           numeric,
  project         numeric,
  ot              numeric,
  gst             numeric not null default 18,
  min_booking     text,
  billing_type    text,
  exp             text,
  duty            text,
  pct_opts        text,
  def_pct         numeric,
  incl            text,
  excl            text,
  adv_req         boolean not null default false,
  no_adv          boolean not null default true,
  adv_pct         numeric not null default 25,
  adv_fixed       numeric not null default 0,
  full_pay        boolean not null default false,
  min_adv         numeric not null default 0,
  bal_type        text default 'Pay on site',
  pay_upi         boolean not null default true,
  pay_qr_code     boolean not null default true,
  pay_bank_transfer boolean not null default false,
  pay_cash_on_site boolean not null default true,
  pay_payment_gateway boolean not null default false,
  pay_enquiry_only boolean not null default true,
  status          text not null default 'Active',
  display_order   int not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ---------- 4. hpe_bookings ----------
create table if not exists public.hpe_bookings (
  id              text primary key default gen_random_uuid()::text,
  order_id        text not null unique,
  customer_name   text not null,
  mobile          text not null,
  email           text,
  company         text,
  department      text,
  service_name    text,
  pickup_location text,
  drop_location   text,
  lat             text,
  lng             text,
  maps_link       text,
  date_time       text,
  work_date       text,
  work_time       text,
  cart_items      jsonb,
  subtotal        numeric not null default 0,
  gst_percent     numeric not null default 0,
  gst_amount      numeric not null default 0,
  grand_total     numeric not null default 0,
  advance_amount  numeric not null default 0,
  balance_amount  numeric not null default 0,
  booking_type    text not null default 'enquiry',
  payment_status  text not null default 'Enquiry Only',
  booking_status  text not null default 'New',
  utr             text,
  notes           text,
  attachment      text,
  admin_notes     text default '',
  assigned_staff  text default '',
  assigned_vendor text default '',
  ntfy_status     text not null default 'Pending',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists hpe_bookings_created_at_idx on public.hpe_bookings (created_at desc);
create index if not exists hpe_bookings_status_idx on public.hpe_bookings (booking_status);
create index if not exists hpe_bookings_payment_idx on public.hpe_bookings (payment_status);

-- ---------- 5. hpe_enquiries ----------
create table if not exists public.hpe_enquiries (
  id          text primary key default gen_random_uuid()::text,
  name        text not null,
  phone       text not null,
  service     text,
  message     text,
  status      text not null default 'New',
  created_at  timestamptz not null default now()
);

-- ---------- 6. hpe_admin_users ----------
create table if not exists public.hpe_admin_users (
  id          text primary key default gen_random_uuid()::text,
  username    text not null unique,
  password    text not null,
  name        text,
  role        text not null default 'Super Admin',
  status      text not null default 'Active',
  last_login  text,
  created_at  timestamptz not null default now()
);

-- ============================================================
-- SEED DEFAULT DATA
-- ============================================================

insert into public.hpe_settings (id, data) values ('singleton', '{
  "name": "HP ENTERPRISE",
  "gstin": "29ANZPH4067Q1ZS",
  "udyam": "UDYAM-KR-10-0014648",
  "ph1": "+91 9538110059",
  "ph2": "+91 9538110059",
  "wa": "+91 9538110059",
  "email": "parcelmaadipm@gmail.com",
  "upi": "953811029@ybl",
  "cov": "Bengaluru & PAN India",
  "tag": "Safe • Compliant • Reliable • PAN India",
  "addr": "HP ENTERPRISE, Venkateshwara Nilaya, behind Hanuman Mandir, Nagenahalli, Hosadurga, Karnataka 577515",
  "days": "Mon–Sat",
  "hrs": "9 AM – 7 PM",
  "gst": 18,
  "toggles": { "enquiry": true, "booking": true, "advancePayment": true, "fullPayment": true, "cashPayLater": true, "dummyOrders": false },
  "websiteContent": {
    "heroTitle": "HP Enterprise",
    "heroTitleGold": "Enterprise",
    "heroSubtitle": "All-in-One Construction, Safety, Manpower, Agriculture and Project Support Services",
    "heroDesc": "Book safety officers, housekeeping, labour, technical teams, agriculture work, construction materials, cutting and chipping, RMC, DG, equipment rental, water tanker and project support with live location and instant enquiry across Bengaluru and PAN India.",
    "heroBadge": "India's First All-in-One Service Platform",
    "heroBg": "images/departments/engineering.jpg",
    "aboutTitle": "Why Choose HP ENTERPRISE",
    "aboutText": "HP Enterprise is India's first all-in-one safety, manpower and project support platform. We deliver Safe, Compliant and Reliable services across construction, industrial and infrastructure projects with live location tracking and instant quotations.",
    "seoTitle": "HP Enterprise | Safety Management, Consultancy & Project Support",
    "seoDesc": "HP Enterprise - India's First All-in-One Service Platform. Safety Management, Manpower, Engineering, Project Support. Book online, pay via UPI.",
    "banner": "",
    "footerText": "Safe | Compliant | Reliable | PAN India"
  }
}'::jsonb)
on conflict (id) do nothing;

insert into public.hpe_admin_users (username, password, name, role, status)
values ('admin', 'HASH_THIS_PASSWORD', 'HariPrasad N P', 'Super Admin', 'Active')
on conflict (username) do nothing;
