-- FIX_PRODUCT_INVENTORY_AND_IMAGES.sql
-- Idempotent corrective migration for product creation in self-hosted PostgreSQL fallback mode.

begin;

-- Keep the project-specific inventory warning threshold consistent with the
-- latest combined schema and repair any legacy nullable rows safely.
update public.inventory
set low_stock_threshold = 3
where low_stock_threshold is null;

alter table public.inventory
  alter column low_stock_threshold set default 3;

alter table public.inventory
  alter column low_stock_threshold set not null;

-- The admin form intentionally allows the threshold field to remain blank.
-- The database client can therefore submit an explicit NULL instead of omitting
-- the column, so normalize that value before the NOT NULL constraint is checked.
create or replace function public.ensure_inventory_low_stock_threshold()
returns trigger
language plpgsql
set search_path = public
as $function$
begin
  if new.low_stock_threshold is null then
    new.low_stock_threshold := 3;
  end if;
  return new;
end
$function$;

drop trigger if exists ensure_inventory_low_stock_threshold on public.inventory;
create trigger ensure_inventory_low_stock_threshold
before insert or update of low_stock_threshold
on public.inventory
for each row
execute function public.ensure_inventory_low_stock_threshold();

-- Preserve catalogue RLS and refresh only the self-hosted application-server
-- policies required by the product-creation flow.
alter table public.products enable row level security;
alter table public.inventory enable row level security;
alter table public.product_images enable row level security;

drop policy if exists "self-hosted app server manages products" on public.products;
drop policy if exists "self-hosted app server manages inventory" on public.inventory;
drop policy if exists "self-hosted app server manages product inventory" on public.inventory;
drop policy if exists "self-hosted app server manages product images" on public.product_images;

do $migration$
begin
  if exists (select 1 from pg_roles where rolname = 'sacouser') then
    grant usage on schema public to sacouser;
    grant select, insert, update, delete on table public.products to sacouser;
    grant select, insert, update, delete on table public.inventory to sacouser;
    grant select, insert, update, delete on table public.product_images to sacouser;
    grant execute on function public.ensure_inventory_low_stock_threshold() to sacouser;

    create policy "self-hosted app server manages products"
      on public.products
      as permissive
      for all
      to sacouser
      using (true)
      with check (true);

    create policy "self-hosted app server manages inventory"
      on public.inventory
      as permissive
      for all
      to sacouser
      using (true)
      with check (true);

    create policy "self-hosted app server manages product images"
      on public.product_images
      as permissive
      for all
      to sacouser
      using (true)
      with check (true);
  else
    raise notice 'Role sacouser does not exist; self-hosted product policies and grants were not created.';
  end if;
end
$migration$;

commit;
