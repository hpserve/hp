-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES FOR HPE TABLES
-- ============================================================

-- Enable RLS on all tables
alter table public.hpe_bookings enable row level security;
alter table public.hpe_enquiries enable row level security;
alter table public.hpe_admin_users enable row level security;
alter table public.hpe_settings enable row level security;
alter table public.hpe_departments enable row level security;
alter table public.hpe_services enable row level security;

-- ============================================================
-- hpe_bookings - Allow public to create, authenticated admin to view/update
-- ============================================================

-- Allow anyone to insert bookings from website
create policy "Allow public to create bookings" on public.hpe_bookings
  for insert
  with check (true);

-- Allow customers to view their own bookings (by email)
create policy "Customers view own bookings" on public.hpe_bookings
  for select
  using (
    auth.jwt() ->> 'email' = email
    or auth.jwt() ->> 'role' = 'admin'
  );

-- Allow admin to view/update all bookings
create policy "Admin view all bookings" on public.hpe_bookings
  for select
  using (auth.jwt() ->> 'role' = 'admin');

create policy "Admin update bookings" on public.hpe_bookings
  for update
  using (auth.jwt() ->> 'role' = 'admin')
  with check (auth.jwt() ->> 'role' = 'admin');

create policy "Admin delete bookings" on public.hpe_bookings
  for delete
  using (auth.jwt() ->> 'role' = 'admin');

-- ============================================================
-- hpe_enquiries - Allow public to create, admin to view
-- ============================================================

create policy "Allow public to create enquiries" on public.hpe_enquiries
  for insert
  with check (true);

create policy "Admin view all enquiries" on public.hpe_enquiries
  for select
  using (auth.jwt() ->> 'role' = 'admin');

-- ============================================================
-- hpe_settings - Allow public to view, admin to update
-- ============================================================

create policy "Allow public to view settings" on public.hpe_settings
  for select
  using (true);

create policy "Admin update settings" on public.hpe_settings
  for update
  using (auth.jwt() ->> 'role' = 'admin')
  with check (auth.jwt() ->> 'role' = 'admin');

-- ============================================================
-- hpe_departments - Allow public to view
-- ============================================================

create policy "Allow public to view departments" on public.hpe_departments
  for select
  using (true);

create policy "Admin manage departments" on public.hpe_departments
  for all
  using (auth.jwt() ->> 'role' = 'admin')
  with check (auth.jwt() ->> 'role' = 'admin');

-- ============================================================
-- hpe_services - Allow public to view
-- ============================================================

create policy "Allow public to view services" on public.hpe_services
  for select
  using (true);

create policy "Admin manage services" on public.hpe_services
  for all
  using (auth.jwt() ->> 'role' = 'admin')
  with check (auth.jwt() ->> 'role' = 'admin');
