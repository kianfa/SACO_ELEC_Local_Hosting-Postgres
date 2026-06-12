-- Idempotent priced product-options feature migration.
-- Reuses public.product_variants and preserves simple products, inventory, images, and historical requests.

begin;

-- Preserve the existing project-specific inventory threshold behavior.
update public.inventory
set low_stock_threshold = 3
where low_stock_threshold is null;

alter table public.inventory
  alter column low_stock_threshold set default 3,
  alter column low_stock_threshold set not null;

alter table public.products
  add column if not exists option_group_title text;

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  label text not null check (btrim(label) <> ''),
  price numeric not null check (price >= 0),
  sku text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.product_variants
  add column if not exists sku text,
  add column if not exists sort_order integer not null default 0,
  add column if not exists is_active boolean not null default true,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

create index if not exists idx_product_variants_product_id
  on public.product_variants(product_id);

create unique index if not exists idx_product_variants_product_label_unique
  on public.product_variants(product_id, lower(btrim(label)));

create unique index if not exists idx_product_variants_product_sku_unique
  on public.product_variants(product_id, lower(btrim(sku)))
  where nullif(btrim(sku), '') is not null;

alter table public.purchase_request_items
  add column if not exists variant_id uuid references public.product_variants(id) on delete set null,
  add column if not exists variant_group_title text,
  add column if not exists variant_label text;

-- Keep updated_at accurate for option edits when the helper exists.
do $variant_trigger$
begin
  if to_regprocedure('public.update_updated_at_column()') is not null then
    drop trigger if exists update_product_variants_updated_at on public.product_variants;
    create trigger update_product_variants_updated_at
      before update on public.product_variants
      for each row execute function public.update_updated_at_column();
  end if;
end
$variant_trigger$;

alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.inventory enable row level security;
alter table public.purchase_requests enable row level security;
alter table public.purchase_request_items enable row level security;

drop policy if exists "public reads active product variants" on public.product_variants;
create policy "public reads active product variants"
  on public.product_variants for select
  to anon, authenticated
  using (is_active = true);

-- Trusted plain-PostgreSQL server role. Better Auth remains enforced by Next.js.
do $sacouser_access$
begin
  if exists (select 1 from pg_roles where rolname = 'sacouser') then
    grant usage on schema public to sacouser;
    grant select, insert, update, delete on table public.products to sacouser;
    grant select, insert, update, delete on table public.product_variants to sacouser;
    grant select, insert, update, delete on table public.inventory to sacouser;
    grant select, insert, update on table public.purchase_requests to sacouser;
    grant select, insert, update on table public.purchase_request_items to sacouser;
    grant usage, select on all sequences in schema public to sacouser;

    drop policy if exists "self-hosted app server manages products" on public.products;
    create policy "self-hosted app server manages products"
      on public.products as permissive for all to sacouser using (true) with check (true);

    drop policy if exists "self-hosted app server manages product variants" on public.product_variants;
    create policy "self-hosted app server manages product variants"
      on public.product_variants as permissive for all to sacouser using (true) with check (true);

    drop policy if exists "self-hosted app server manages inventory" on public.inventory;
    create policy "self-hosted app server manages inventory"
      on public.inventory as permissive for all to sacouser using (true) with check (true);

    drop policy if exists "self-hosted app server reads purchase requests" on public.purchase_requests;
    create policy "self-hosted app server reads purchase requests"
      on public.purchase_requests for select to sacouser using (true);

    drop policy if exists "self-hosted app server updates purchase requests" on public.purchase_requests;
    create policy "self-hosted app server updates purchase requests"
      on public.purchase_requests for update to sacouser using (true) with check (true);

    drop policy if exists "self-hosted app server reads purchase request items" on public.purchase_request_items;
    create policy "self-hosted app server reads purchase request items"
      on public.purchase_request_items for select to sacouser using (true);

    drop policy if exists "self-hosted app server creates purchase request items" on public.purchase_request_items;
    create policy "self-hosted app server creates purchase request items"
      on public.purchase_request_items for insert to sacouser with check (true);
  end if;
end
$sacouser_access$;

grant select on table public.product_variants to anon, authenticated;

-- Exact positional six-argument signature used by the PostgreSQL shim and Supabase RPC.
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
  v_variant record;
  v_product_id uuid;
  v_variant_id uuid;
  v_variant_group_title text;
  v_variant_label text;
  v_quantity integer;
  v_unit_price numeric;
  v_estimated_total numeric := 0;
begin
  if char_length(trim(coalesce(p_customer_name, ''))) < 2 then raise exception 'invalid_customer_name'; end if;
  if trim(coalesce(p_phone, '')) !~ '^09[0-9]{9}$' then raise exception 'invalid_phone'; end if;
  if jsonb_typeof(coalesce(p_items, '[]'::jsonb)) <> 'array' then raise exception 'invalid_cart'; end if;
  if jsonb_array_length(coalesce(p_items, '[]'::jsonb)) = 0 then raise exception 'empty_cart'; end if;

  if exists (
    select 1 from public.purchase_requests
    where phone = trim(p_phone)
      and source = 'checkout'
      and created_at > now() - interval '90 seconds'
  ) then raise exception 'duplicate_request'; end if;

  insert into public.purchase_requests (
    request_number, customer_name, phone, description,
    preferred_contact_time, preferred_contact_time_note,
    source, status, estimated_total
  ) values (
    public.generate_purchase_request_number(), trim(p_customer_name), trim(p_phone),
    nullif(trim(coalesce(p_description, '')), ''),
    coalesce(nullif(trim(coalesce(p_preferred_contact_time, '')), ''), 'as soon as possible'),
    nullif(trim(coalesce(p_preferred_contact_time_note, '')), ''),
    'checkout', 'new', 0
  ) returning id, request_number, created_at into v_request_id, v_request_number, v_created_at;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    if jsonb_typeof(v_item) <> 'object' then raise exception 'invalid_cart_item'; end if;
    begin v_product_id := nullif(v_item ->> 'productId', '')::uuid;
    exception when others then raise exception 'invalid_product_id'; end;
    if v_product_id is null then raise exception 'invalid_product_id'; end if;
    begin v_quantity := (v_item ->> 'quantity')::integer;
    exception when others then raise exception 'invalid_quantity'; end;
    if v_quantity is null or v_quantity < 1 or v_quantity > 100 then raise exception 'invalid_quantity'; end if;

    select p.id, p.name, p.model, p.sku, p.option_group_title,
           greatest(0, coalesce(p.price, 0)) as unit_price,
           b.name as brand_name
      into v_product
      from public.products p
      left join public.brands b on b.id = p.brand_id
     where p.id = v_product_id and coalesce(p.is_active, true) = true;
    if not found then raise exception 'invalid_or_inactive_product'; end if;

    v_variant_id := null;
    v_variant_group_title := null;
    v_variant_label := null;
    v_unit_price := v_product.unit_price;

    if exists (select 1 from public.product_variants pv where pv.product_id = v_product.id and pv.is_active = true) then
      begin v_variant_id := nullif(v_item ->> 'variantId', '')::uuid;
      exception when others then raise exception 'invalid_variant'; end;
      if v_variant_id is null then raise exception 'variant_required'; end if;
      select pv.id, pv.label, pv.price into v_variant
      from public.product_variants pv
      where pv.id = v_variant_id and pv.product_id = v_product.id and pv.is_active = true;
      if not found then raise exception 'invalid_or_inactive_variant'; end if;
      v_variant_group_title := nullif(trim(coalesce(v_product.option_group_title, '')), '');
      v_variant_label := v_variant.label;
      v_unit_price := greatest(0, coalesce(v_variant.price, 0));
    elsif nullif(v_item ->> 'variantId', '') is not null then
      raise exception 'invalid_variant';
    end if;

    insert into public.purchase_request_items (
      purchase_request_id, product_id, product_name, product_model, product_sku,
      brand_name, variant_id, variant_group_title, variant_label,
      quantity, unit_price, total_price
    ) values (
      v_request_id, v_product.id, v_product.name, v_product.model, v_product.sku,
      v_product.brand_name, v_variant_id, v_variant_group_title, v_variant_label,
      v_quantity, v_unit_price, v_unit_price * v_quantity
    );
    v_estimated_total := v_estimated_total + (v_unit_price * v_quantity);
  end loop;

  update public.purchase_requests set estimated_total = v_estimated_total, updated_at = now() where id = v_request_id;
  insert into public.purchase_request_activities (purchase_request_id, action) values (v_request_id, 'Checkout contact request created');
  return jsonb_build_object('id', v_request_id, 'requestNumber', v_request_number, 'createdAt', v_created_at);
end;
$$;

revoke all on function public.create_purchase_request(text, text, text, text, text, jsonb) from public;
grant execute on function public.create_purchase_request(text, text, text, text, text, jsonb) to anon, authenticated;

do $sacouser_rpc$
begin
  if exists (select 1 from pg_roles where rolname = 'sacouser') then
    grant execute on function public.create_purchase_request(text, text, text, text, text, jsonb) to sacouser;
  end if;
end
$sacouser_rpc$;

commit;
