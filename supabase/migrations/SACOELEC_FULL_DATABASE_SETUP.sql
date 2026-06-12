-- SACOELEC_FULL_DATABASE_SETUP.sql
-- Standalone PostgreSQL setup for Saco Electric.
-- ASCII-only for reliable execution from Windows psql clients.
-- Safe for a new empty database and rerunnable without deleting business data.

begin;

-- -----------------------------------------------------------------------------
-- 1. Extensions and compatibility roles
-- -----------------------------------------------------------------------------
create extension if not exists pgcrypto;

-- Plain PostgreSQL fallback roles. Existing Supabase roles are preserved.
do $roles$
begin
  if not exists (select 1 from pg_roles where rolname = 'sacouser') then
    create role sacouser login;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then
    create role service_role nologin bypassrls;
  end if;
exception
  when insufficient_privilege then
    raise notice 'Role bootstrap skipped because the current database user cannot create roles.';
end
$roles$;

-- Supabase provides auth.uid(). Plain PostgreSQL does not. The stub is created
-- only when absent so Supabase installations retain the real implementation.
create schema if not exists auth;
do $auth_uid$
begin
  if to_regprocedure('auth.uid()') is null then
    execute 'create function auth.uid() returns uuid language sql stable as ''select null::uuid''';
  end if;
end
$auth_uid$;

do $auth_grants$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    grant usage on schema auth to anon;
    grant execute on function auth.uid() to anon;
  end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    grant usage on schema auth to authenticated;
    grant execute on function auth.uid() to authenticated;
  end if;
  if exists (select 1 from pg_roles where rolname = 'service_role') then
    grant usage on schema auth to service_role;
    grant execute on function auth.uid() to service_role;
  end if;
  if exists (select 1 from pg_roles where rolname = 'sacouser') then
    grant usage on schema auth to sacouser;
    grant execute on function auth.uid() to sacouser;
  end if;
end
$auth_grants$;

-- -----------------------------------------------------------------------------
-- 2. Better Auth tables
-- -----------------------------------------------------------------------------
create table if not exists public."user" (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  "emailVerified" boolean not null default false,
  image text,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create table if not exists public.session (
  id uuid primary key default gen_random_uuid(),
  "expiresAt" timestamptz not null,
  token text not null unique,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  "ipAddress" text,
  "userAgent" text,
  "userId" uuid not null references public."user"(id) on delete cascade
);

create table if not exists public.account (
  id uuid primary key default gen_random_uuid(),
  "accountId" text not null,
  "providerId" text not null,
  "userId" uuid not null references public."user"(id) on delete cascade,
  "accessToken" text,
  "refreshToken" text,
  "idToken" text,
  "accessTokenExpiresAt" timestamptz,
  "refreshTokenExpiresAt" timestamptz,
  scope text,
  password text,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  unique ("providerId", "accountId")
);

create table if not exists public.verification (
  id uuid primary key default gen_random_uuid(),
  identifier text not null,
  value text not null,
  "expiresAt" timestamptz not null,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

create index if not exists session_user_id_idx on public.session ("userId");
create index if not exists account_user_id_idx on public.account ("userId");
create index if not exists verification_identifier_idx on public.verification (identifier);

-- -----------------------------------------------------------------------------
-- 3. Catalogue tables
-- -----------------------------------------------------------------------------
create table if not exists public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  logo_url text,
  description text,
  logo_alt_text text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  image_alt_text text,
  parent_id uuid references public.categories(id) on delete set null,
  show_on_homepage boolean not null default true,
  homepage_sort_order integer not null default 0,
  homepage_title text,
  homepage_display_title text,
  homepage_url text,
  homepage_image_url text,
  homepage_image_alt_text text,
  homepage_icon_url text,
  homepage_icon_alt_text text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  brand_id uuid references public.brands(id) on delete set null,
  name text not null,
  slug text not null unique,
  model text,
  sku text unique,
  short_description text,
  description text,
  price numeric not null default 0 check (price >= 0),
  old_price numeric,
  discount_percent integer not null default 0,
  warranty text,
  has_warranty boolean not null default true,
  origin_country text,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  rating numeric not null default 0,
  review_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  label text not null check (btrim(label) <> ''),
  price numeric not null check (price >= 0),
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade,
  url text not null,
  image_url text,
  alt_text text,
  sort_order integer not null default 0,
  is_main boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.product_specs (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade,
  spec_name text not null,
  spec_value text not null,
  label text,
  name text,
  value text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.inventory (
  id uuid primary key default gen_random_uuid(),
  product_id uuid unique references public.products(id) on delete cascade,
  quantity integer not null default 0,
  stock_quantity integer not null default 0,
  low_stock_threshold integer not null default 3,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_price_history (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete set null,
  old_price numeric,
  new_price numeric,
  changed_by uuid references public."user"(id) on delete set null,
  reason text,
  created_at timestamptz not null default now()
);

create table if not exists public.product_comments (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null,
  email text,
  comment_text text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_comment_rate_limits (
  key text primary key,
  submission_count integer not null default 0,
  window_started_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- 4. Users, orders, and payments
-- -----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references public."user"(id) on delete cascade,
  full_name text,
  phone text,
  role text not null default 'customer' check (role in ('admin', 'customer')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public."user"(id) on delete cascade,
  full_name text not null,
  phone text not null,
  province text not null,
  city text not null,
  postal_code text,
  address_line text not null,
  unit text,
  notes text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.shipping_methods (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  base_price numeric not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.discount_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  description text,
  discount_type text not null default 'percent',
  discount_value numeric not null default 0,
  min_order_amount numeric not null default 0,
  max_discount_amount numeric,
  usage_limit integer,
  used_count integer not null default 0,
  starts_at timestamptz,
  expires_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public."user"(id) on delete set null,
  address_id uuid references public.addresses(id) on delete set null,
  order_number text not null unique,
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  buyer_type text not null default 'individual',
  company_name text,
  national_id text,
  wants_official_invoice boolean not null default false,
  status text not null default 'pending',
  payment_status text not null default 'unpaid',
  subtotal numeric not null default 0,
  discount_total numeric not null default 0,
  shipping_cost numeric not null default 0,
  tax_total numeric not null default 0,
  total_amount numeric not null default 0,
  shipping_method text,
  payment_method text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  product_model text,
  product_sku text,
  brand_name text,
  quantity integer not null check (quantity > 0),
  unit_price numeric not null check (unit_price >= 0),
  total_price numeric not null check (total_price >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete set null,
  gateway text not null,
  amount numeric not null,
  status text not null default 'pending',
  authority text,
  ref_id text,
  track_id text,
  card_pan text,
  request_payload jsonb,
  verify_payload jsonb,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- 5. Purchase requests
-- -----------------------------------------------------------------------------
create or replace function public.generate_purchase_request_number()
returns text
language sql
volatile
set search_path = public, pg_temp
as $$
  select 'REQ-'
    || to_char(clock_timestamp(), 'YYMMDDHH24MISSMS')
    || '-'
    || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 4));
$$;

create table if not exists public.purchase_requests (
  id uuid primary key default gen_random_uuid(),
  request_number text not null default public.generate_purchase_request_number(),
  customer_name text not null,
  phone text not null,
  description text,
  preferred_contact_time text,
  preferred_contact_time_note text,
  source text not null default 'checkout',
  status text not null default 'new' check (status in (
    'new', 'contacted', 'message_sent_waiting_response', 'follow_up_required',
    'price_confirmed', 'waiting_for_payment', 'payment_received', 'completed', 'cancelled'
  )),
  estimated_total numeric not null default 0,
  admin_note text,
  next_follow_up_at timestamptz,
  last_contacted_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.purchase_request_items (
  id uuid primary key default gen_random_uuid(),
  purchase_request_id uuid not null references public.purchase_requests(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  product_model text,
  product_sku text,
  brand_name text,
  quantity integer not null check (quantity > 0),
  unit_price numeric not null check (unit_price >= 0),
  total_price numeric not null check (total_price >= 0),
  variant_id uuid references public.product_variants(id) on delete set null,
  variant_label text,
  created_at timestamptz not null default now()
);

create table if not exists public.purchase_request_activities (
  id uuid primary key default gen_random_uuid(),
  purchase_request_id uuid not null references public.purchase_requests(id) on delete cascade,
  action text not null,
  note text,
  created_by uuid references public."user"(id) on delete set null,
  created_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- 6. CMS and admin tables
-- -----------------------------------------------------------------------------
create table if not exists public.homepage_sections (
  id uuid primary key default gen_random_uuid(),
  section_key text not null unique,
  title text,
  subtitle text,
  description text,
  image_url text,
  mobile_image_url text,
  primary_button_text text,
  primary_button_url text,
  secondary_button_text text,
  secondary_button_url text,
  metadata jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  description text,
  image_url text,
  image_alt_text text,
  button_text text,
  button_url text,
  badge_text text,
  placement text not null,
  is_active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_price_update_logs (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid references public."user"(id) on delete set null,
  change_type text not null,
  percent numeric not null,
  target_type text not null,
  target_value text,
  affected_count integer not null default 0,
  rounding_mode text,
  old_price_behavior text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_login_rate_limits (
  key text primary key,
  attempt_count integer not null default 0 check (attempt_count >= 0),
  window_started_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- 7. Additive upgrades for older partial installations
-- -----------------------------------------------------------------------------
alter table public.categories
  add column if not exists image_alt_text text,
  add column if not exists homepage_title text,
  add column if not exists homepage_display_title text,
  add column if not exists homepage_url text,
  add column if not exists homepage_image_url text,
  add column if not exists homepage_image_alt_text text,
  add column if not exists homepage_icon_url text,
  add column if not exists homepage_icon_alt_text text,
  add column if not exists show_on_homepage boolean not null default true,
  add column if not exists homepage_sort_order integer not null default 0,
  add column if not exists is_active boolean not null default true,
  add column if not exists updated_at timestamptz not null default now();

alter table public.site_banners
  add column if not exists image_alt_text text;

alter table public.purchase_requests
  add column if not exists request_number text,
  add column if not exists preferred_contact_time_note text,
  add column if not exists next_follow_up_at timestamptz,
  add column if not exists last_contacted_at timestamptz,
  add column if not exists completed_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();

update public.purchase_requests
set request_number = public.generate_purchase_request_number()
where request_number is null or btrim(request_number) = '';

alter table public.purchase_requests
  alter column request_number set default public.generate_purchase_request_number();

alter table public.purchase_request_items
  add column if not exists variant_id uuid,
  add column if not exists variant_label text;

alter table public.admin_login_rate_limits
  add column if not exists updated_at timestamptz not null default now();

-- -----------------------------------------------------------------------------
-- 8. Indexes
-- -----------------------------------------------------------------------------
create index if not exists categories_parent_id_idx on public.categories(parent_id);
create index if not exists categories_homepage_visibility_idx on public.categories(is_active, show_on_homepage, homepage_sort_order, name);
create index if not exists idx_product_variants_product_id on public.product_variants(product_id);
create unique index if not exists idx_product_variants_product_label_unique on public.product_variants(product_id, lower(btrim(label)));
create index if not exists idx_product_images_product_id_sort_order on public.product_images(product_id, sort_order, created_at);
create index if not exists purchase_requests_created_at_idx on public.purchase_requests(created_at desc);
create index if not exists purchase_requests_status_idx on public.purchase_requests(status);
create index if not exists purchase_requests_phone_idx on public.purchase_requests(phone);
create index if not exists purchase_requests_next_follow_up_at_idx on public.purchase_requests(next_follow_up_at);
create unique index if not exists purchase_requests_request_number_uidx on public.purchase_requests(request_number);
create index if not exists purchase_request_items_request_id_idx on public.purchase_request_items(purchase_request_id);
create index if not exists purchase_request_items_product_id_idx on public.purchase_request_items(product_id);
create index if not exists purchase_request_activities_request_id_idx on public.purchase_request_activities(purchase_request_id);
create index if not exists idx_site_banners_public_lookup on public.site_banners(placement, is_active, sort_order, created_at desc);
create index if not exists admin_login_rate_limits_window_started_at_idx on public.admin_login_rate_limits(window_started_at);

-- -----------------------------------------------------------------------------
-- 9. Functions and triggers
-- -----------------------------------------------------------------------------
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
revoke all on function public.generate_purchase_request_number() from public;

-- Exact positional six-argument signature used by the latest PostgreSQL shim.
drop function if exists public.create_purchase_request(text, text, text, text, text, jsonb);

create function public.create_purchase_request(
  p_customer_name text,
  p_phone text,
  p_description text default null,
  p_preferred_contact_time text default 'as soon as possible',
  p_preferred_contact_time_note text default null,
  p_items jsonb default '[]'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_request_id uuid;
  v_request_number text;
  v_created_at timestamptz;
  v_item jsonb;
  v_product record;
  v_product_id uuid;
  v_quantity integer;
  v_unit_price numeric;
  v_estimated_total numeric := 0;
begin
  if char_length(trim(coalesce(p_customer_name, ''))) < 2 then
    raise exception 'invalid_customer_name';
  end if;
  if trim(coalesce(p_phone, '')) !~ '^09[0-9]{9}$' then
    raise exception 'invalid_phone';
  end if;
  if jsonb_typeof(coalesce(p_items, '[]'::jsonb)) <> 'array' then
    raise exception 'invalid_cart';
  end if;
  if jsonb_array_length(coalesce(p_items, '[]'::jsonb)) = 0 then
    raise exception 'empty_cart';
  end if;
  if exists (
    select 1 from public.purchase_requests
    where phone = trim(p_phone)
      and source = 'checkout'
      and created_at > now() - interval '90 seconds'
  ) then
    raise exception 'duplicate_request';
  end if;

  insert into public.purchase_requests (
    request_number, customer_name, phone, description,
    preferred_contact_time, preferred_contact_time_note,
    source, status, estimated_total
  ) values (
    public.generate_purchase_request_number(),
    trim(p_customer_name),
    trim(p_phone),
    nullif(trim(coalesce(p_description, '')), ''),
    coalesce(nullif(trim(coalesce(p_preferred_contact_time, '')), ''), 'as soon as possible'),
    nullif(trim(coalesce(p_preferred_contact_time_note, '')), ''),
    'checkout', 'new', 0
  ) returning id, request_number, created_at
    into v_request_id, v_request_number, v_created_at;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    if jsonb_typeof(v_item) <> 'object' then
      raise exception 'invalid_cart_item';
    end if;
    begin
      v_product_id := nullif(v_item ->> 'productId', '')::uuid;
    exception when others then
      raise exception 'invalid_product_id';
    end;
    if v_product_id is null then
      raise exception 'invalid_product_id';
    end if;
    begin
      v_quantity := (v_item ->> 'quantity')::integer;
    exception when others then
      raise exception 'invalid_quantity';
    end;
    if v_quantity is null or v_quantity < 1 or v_quantity > 100 then
      raise exception 'invalid_quantity';
    end if;

    select p.id, p.name, p.model, p.sku,
           greatest(0, coalesce(p.price, 0)) as unit_price,
           b.name as brand_name
      into v_product
      from public.products p
      left join public.brands b on b.id = p.brand_id
     where p.id = v_product_id
       and coalesce(p.is_active, true) = true;
    if not found then
      raise exception 'invalid_or_inactive_product';
    end if;

    v_unit_price := v_product.unit_price;
    insert into public.purchase_request_items (
      purchase_request_id, product_id, product_name, product_model,
      product_sku, brand_name, quantity, unit_price, total_price
    ) values (
      v_request_id, v_product.id, v_product.name, v_product.model,
      v_product.sku, v_product.brand_name, v_quantity,
      v_unit_price, v_unit_price * v_quantity
    );
    v_estimated_total := v_estimated_total + (v_unit_price * v_quantity);
  end loop;

  update public.purchase_requests
     set estimated_total = v_estimated_total,
         updated_at = now()
   where id = v_request_id;

  insert into public.purchase_request_activities (purchase_request_id, action)
  values (v_request_id, 'Checkout contact request created');

  return jsonb_build_object(
    'id', v_request_id,
    'requestNumber', v_request_number,
    'createdAt', v_created_at
  );
end;
$$;

-- Updated-at triggers. Drop first so reruns are safe.
do $triggers$
declare
  item record;
begin
  for item in
    select * from (values
      ('profiles', 'update_profiles_updated_at'),
      ('brands', 'update_brands_updated_at'),
      ('categories', 'update_categories_updated_at'),
      ('products', 'update_products_updated_at'),
      ('product_variants', 'update_product_variants_updated_at'),
      ('inventory', 'update_inventory_updated_at'),
      ('product_comments', 'update_product_comments_updated_at'),
      ('addresses', 'update_addresses_updated_at'),
      ('shipping_methods', 'update_shipping_methods_updated_at'),
      ('discount_codes', 'update_discount_codes_updated_at'),
      ('orders', 'update_orders_updated_at'),
      ('payments', 'update_payments_updated_at'),
      ('homepage_sections', 'update_homepage_sections_updated_at'),
      ('site_banners', 'update_site_banners_updated_at'),
      ('site_settings', 'update_site_settings_updated_at')
    ) as v(table_name, trigger_name)
  loop
    execute format('drop trigger if exists %I on public.%I', item.trigger_name, item.table_name);
    execute format('create trigger %I before update on public.%I for each row execute function public.update_updated_at_column()', item.trigger_name, item.table_name);
  end loop;
end
$triggers$;

drop trigger if exists set_purchase_requests_updated_at on public.purchase_requests;
create trigger set_purchase_requests_updated_at
before update on public.purchase_requests
for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 10. RLS configuration
-- -----------------------------------------------------------------------------
-- Better Auth and server-only limiter tables are accessed through trusted server
-- code, not through public Supabase clients.
alter table public."user" disable row level security;
alter table public.session disable row level security;
alter table public.account disable row level security;
alter table public.verification disable row level security;
alter table public.profiles disable row level security;
alter table public.admin_login_rate_limits disable row level security;
alter table public.product_comment_rate_limits disable row level security;

-- Application tables keep RLS enabled.
alter table public.brands enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_images enable row level security;
alter table public.product_specs enable row level security;
alter table public.inventory enable row level security;
alter table public.product_price_history enable row level security;
alter table public.product_comments enable row level security;
alter table public.addresses enable row level security;
alter table public.shipping_methods enable row level security;
alter table public.discount_codes enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.purchase_requests enable row level security;
alter table public.purchase_request_items enable row level security;
alter table public.purchase_request_activities enable row level security;
alter table public.homepage_sections enable row level security;
alter table public.site_banners enable row level security;
alter table public.site_settings enable row level security;
alter table public.admin_price_update_logs enable row level security;

-- Public and Supabase authenticated read policies.
drop policy if exists "public read active brands" on public.brands;
create policy "public read active brands" on public.brands for select to public using (is_active = true);

drop policy if exists "public read active categories" on public.categories;
create policy "public read active categories" on public.categories for select to public using (is_active = true);

drop policy if exists "public read active products" on public.products;
create policy "public read active products" on public.products for select to public using (is_active = true);

drop policy if exists "public reads active product variants" on public.product_variants;
create policy "public reads active product variants" on public.product_variants for select to public using (is_active = true);

drop policy if exists "public read active product images" on public.product_images;
create policy "public read active product images" on public.product_images for select to public
using (exists (select 1 from public.products p where p.id = product_images.product_id and p.is_active = true));

drop policy if exists "public read active product specs" on public.product_specs;
create policy "public read active product specs" on public.product_specs for select to public
using (exists (select 1 from public.products p where p.id = product_specs.product_id and p.is_active = true));

drop policy if exists "public read active product inventory" on public.inventory;
create policy "public read active product inventory" on public.inventory for select to public
using (exists (select 1 from public.products p where p.id = inventory.product_id and p.is_active = true));

drop policy if exists "public read active homepage sections" on public.homepage_sections;
create policy "public read active homepage sections" on public.homepage_sections for select to public using (is_active = true);

drop policy if exists "public read active site banners" on public.site_banners;
create policy "public read active site banners" on public.site_banners for select to public
using (is_active = true and (starts_at is null or starts_at <= now()) and (ends_at is null or ends_at >= now()));

drop policy if exists "public read safe site settings" on public.site_settings;
create policy "public read safe site settings" on public.site_settings for select to public
using (key = any (array['contact_info','social_links','footer_info','manual_checkout','site_contact','site_info']));

drop policy if exists "public read active shipping methods" on public.shipping_methods;
create policy "public read active shipping methods" on public.shipping_methods for select to public using (is_active = true);

drop policy if exists "public read approved product comments" on public.product_comments;
create policy "public read approved product comments" on public.product_comments for select to public using (status = 'approved');

drop policy if exists "public create pending product comments" on public.product_comments;
create policy "public create pending product comments" on public.product_comments for insert to public with check (status = 'pending');

-- Supabase JWT policies retained for compatibility. Server-side Better Auth
-- actions use a server secret in Supabase mode and sacouser in plain PG mode.
drop policy if exists "users manage own addresses, admins manage all" on public.addresses;
create policy "users manage own addresses, admins manage all" on public.addresses for all to authenticated
using (public.is_admin() or user_id = auth.uid()) with check (public.is_admin() or user_id = auth.uid());

drop policy if exists "users read own orders, admins read all" on public.orders;
create policy "users read own orders, admins read all" on public.orders for select to authenticated
using (public.is_admin() or user_id = auth.uid());

-- Admin policies for Supabase authenticated sessions.
do $admin_policies$
declare
  table_name text;
  policy_name text;
begin
  foreach table_name in array array[
    'brands','categories','products','product_variants','product_images','product_specs','inventory',
    'product_price_history','product_comments','shipping_methods','discount_codes','orders','order_items','payments',
    'purchase_requests','purchase_request_items','purchase_request_activities',
    'homepage_sections','site_banners','site_settings','admin_price_update_logs'
  ]
  loop
    policy_name := 'admins manage ' || replace(table_name, '_', ' ');
    execute format('drop policy if exists %I on public.%I', policy_name, table_name);
    execute format('create policy %I on public.%I for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()))', policy_name, table_name);
  end loop;
end
$admin_policies$;

-- Trusted self-hosted application-server policies. Better Auth authorization is
-- enforced by Next.js before admin mutations reach DATABASE_URL.
do $sacouser_policies$
declare
  table_name text;
  policy_name text;
begin
  if exists (select 1 from pg_roles where rolname = 'sacouser') then
    foreach table_name in array array[
      'brands','categories','products','product_variants','product_images','product_specs','inventory',
      'product_price_history','product_comments','addresses','shipping_methods','discount_codes','orders','order_items','payments',
      'homepage_sections','site_banners','site_settings','admin_price_update_logs'
    ]
    loop
      policy_name := 'self-hosted app server manages ' || replace(table_name, '_', ' ');
      execute format('drop policy if exists %I on public.%I', policy_name, table_name);
      execute format('create policy %I on public.%I as permissive for all to sacouser using (true) with check (true)', policy_name, table_name);
    end loop;

    drop policy if exists "self-hosted app server reads purchase requests" on public.purchase_requests;
    create policy "self-hosted app server reads purchase requests" on public.purchase_requests for select to sacouser using (true);
    drop policy if exists "self-hosted app server updates purchase requests" on public.purchase_requests;
    create policy "self-hosted app server updates purchase requests" on public.purchase_requests for update to sacouser using (true) with check (true);
    drop policy if exists "self-hosted app server reads purchase request items" on public.purchase_request_items;
    create policy "self-hosted app server reads purchase request items" on public.purchase_request_items for select to sacouser using (true);
    drop policy if exists "self-hosted app server reads purchase request activities" on public.purchase_request_activities;
    create policy "self-hosted app server reads purchase request activities" on public.purchase_request_activities for select to sacouser using (true);
    drop policy if exists "self-hosted app server creates purchase request activities" on public.purchase_request_activities;
    create policy "self-hosted app server creates purchase request activities" on public.purchase_request_activities for insert to sacouser with check (true);
  end if;
end
$sacouser_policies$;

-- -----------------------------------------------------------------------------
-- 11. Grants
-- -----------------------------------------------------------------------------
revoke all on table public."user", public.session, public.account, public.verification,
  public.profiles, public.admin_login_rate_limits, public.product_comment_rate_limits
from public, anon, authenticated;

-- Public API reads and controlled comment insert.
grant usage on schema public to anon, authenticated;
grant select on table public.brands, public.categories, public.products, public.product_variants,
  public.product_images, public.product_specs, public.inventory, public.homepage_sections,
  public.site_banners, public.site_settings, public.shipping_methods, public.product_comments
  to anon, authenticated;
grant insert on table public.product_comments to anon, authenticated;

-- Better Auth intentionally avoids direct browser writes. Supabase server-secret
-- connections retain their own elevated behavior.
revoke insert, update, delete on table public.brands, public.categories, public.products,
  public.product_variants, public.product_images, public.product_specs, public.inventory,
  public.product_price_history, public.product_comments, public.addresses, public.shipping_methods,
  public.discount_codes, public.orders, public.order_items, public.payments, public.purchase_requests,
  public.purchase_request_items, public.purchase_request_activities, public.homepage_sections,
  public.site_banners, public.site_settings, public.admin_price_update_logs
from anon, authenticated;

-- RPC permissions.
revoke all on function public.create_purchase_request(text, text, text, text, text, jsonb) from public;
grant execute on function public.create_purchase_request(text, text, text, text, text, jsonb) to anon, authenticated;
grant execute on function public.is_admin() to anon, authenticated;
-- Product comments are public-submission records with an RLS pending-only check.
grant insert on table public.product_comments to anon, authenticated;

-- Trusted plain PostgreSQL server role.
do $sacouser_grants$
begin
  if exists (select 1 from pg_roles where rolname = 'sacouser') then
    grant usage on schema public to sacouser;
    grant all privileges on all tables in schema public to sacouser;
    grant all privileges on all sequences in schema public to sacouser;
    grant execute on all functions in schema public to sacouser;
    alter default privileges in schema public grant all on tables to sacouser;
    alter default privileges in schema public grant all on sequences to sacouser;
    alter default privileges in schema public grant execute on functions to sacouser;
  end if;
end
$sacouser_grants$;

-- Supabase service role grants are conditional for plain PostgreSQL installs.
do $service_role_grants$
begin
  if exists (select 1 from pg_roles where rolname = 'service_role') then
    grant usage on schema public to service_role;
    grant all privileges on all tables in schema public to service_role;
    grant all privileges on all sequences in schema public to service_role;
    grant execute on all functions in schema public to service_role;
  end if;
end
$service_role_grants$;

-- -----------------------------------------------------------------------------
-- 12. Minimal seed rows and normalization
-- -----------------------------------------------------------------------------
insert into public.site_settings (key, value) values
  ('contact_info', '{}'::jsonb),
  ('footer_info', '{}'::jsonb),
  ('manual_checkout', '{}'::jsonb),
  ('social_links', '{}'::jsonb)
on conflict (key) do nothing;

update public.site_banners
set placement = 'homepage_promo'
where placement is null
   or btrim(placement) = ''
   or placement in ('promo_banner', 'homepage_banner', 'home_promo', 'homepage-promo');

-- Exact checkout RPC contract validation.
do $assert_checkout_rpc$
declare
  v_proc regprocedure;
  v_argument_names text[];
begin
  v_proc := to_regprocedure('public.create_purchase_request(text,text,text,text,text,jsonb)');
  if v_proc is null then
    raise exception 'Exact checkout RPC signature is missing.';
  end if;
  select p.proargnames into v_argument_names from pg_proc p where p.oid = v_proc::oid;
  if v_argument_names[1:6] is distinct from array[
    'p_customer_name','p_phone','p_description','p_preferred_contact_time','p_preferred_contact_time_note','p_items'
  ]::text[] then
    raise exception 'Checkout RPC argument names do not match the application contract: %', v_argument_names;
  end if;
end
$assert_checkout_rpc$;

commit;

-- -----------------------------------------------------------------------------
-- 13. Read-only validation queries
-- -----------------------------------------------------------------------------
select 'required_tables' as validation_group,
       table_name,
       (to_regclass('public.' || quote_ident(table_name)) is not null) as exists
from (values
  ('user'),('session'),('account'),('verification'),('profiles'),
  ('brands'),('categories'),('products'),('product_variants'),('product_images'),('product_specs'),('inventory'),
  ('product_price_history'),('product_comments'),('product_comment_rate_limits'),
  ('addresses'),('shipping_methods'),('discount_codes'),('orders'),('order_items'),('payments'),
  ('purchase_requests'),('purchase_request_items'),('purchase_request_activities'),
  ('homepage_sections'),('site_banners'),('site_settings'),('admin_price_update_logs'),('admin_login_rate_limits')
) as required(table_name)
order by table_name;

select 'checkout_columns' as validation_group, column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public'
  and table_name = 'purchase_requests'
order by ordinal_position;

select 'checkout_rpc' as validation_group,
       n.nspname as schema_name,
       p.proname as function_name,
       p.oid::regprocedure as signature,
       pg_get_function_arguments(p.oid) as arguments,
       pg_get_function_result(p.oid) as return_type,
       p.proargnames as argument_names,
       case when exists (select 1 from pg_roles where rolname = 'sacouser')
            then has_function_privilege('sacouser', p.oid, 'execute')
            else null end as sacouser_can_execute
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname = 'create_purchase_request';

select 'triggers' as validation_group, event_object_table as table_name, trigger_name
from information_schema.triggers
where trigger_schema = 'public'
order by event_object_table, trigger_name;

select 'policies' as validation_group, schemaname, tablename, policyname, roles, cmd
from pg_policies
where schemaname = 'public'
order by tablename, policyname;

select 'indexes' as validation_group, tablename, indexname
from pg_indexes
where schemaname = 'public'
order by tablename, indexname;

select 'sacouser_table_grants' as validation_group, table_name, privilege_type
from information_schema.role_table_grants
where grantee = 'sacouser' and table_schema = 'public'
order by table_name, privilege_type;

select 'sacouser_sequence_grants' as validation_group, object_name as sequence_name, privilege_type
from information_schema.role_usage_grants
where grantee = 'sacouser' and object_schema = 'public' and object_type = 'SEQUENCE'
order by object_name, privilege_type;
