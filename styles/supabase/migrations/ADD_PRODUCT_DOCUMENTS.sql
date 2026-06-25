-- ADD_PRODUCT_DOCUMENTS.sql
-- Adds product PDF datasheet/document metadata.
-- The project currently stores uploaded files through the existing server media
-- layer (local uploads or MinIO-compatible object storage), not Supabase Storage.
-- If you later switch to Supabase Storage, create a bucket such as
-- product-documents and keep this metadata table as the product/document link.

begin;

create table if not exists public.product_documents (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  title text not null,
  file_name text not null,
  file_url text not null,
  storage_path text,
  file_size integer not null check (file_size > 0 and file_size <= 5242880),
  mime_type text not null default 'application/pdf' check (mime_type = 'application/pdf'),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.product_documents
  add column if not exists product_id uuid references public.products(id) on delete cascade,
  add column if not exists title text,
  add column if not exists file_name text,
  add column if not exists file_url text,
  add column if not exists storage_path text,
  add column if not exists file_size integer,
  add column if not exists mime_type text default 'application/pdf',
  add column if not exists sort_order integer default 0,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

update public.product_documents
set
  title = coalesce(nullif(title, ''), file_name, 'فایل PDF محصول'),
  file_name = coalesce(nullif(file_name, ''), 'document.pdf'),
  mime_type = coalesce(nullif(mime_type, ''), 'application/pdf'),
  sort_order = coalesce(sort_order, 0),
  created_at = coalesce(created_at, now()),
  updated_at = coalesce(updated_at, now())
where title is null
  or file_name is null
  or mime_type is null
  or sort_order is null
  or created_at is null
  or updated_at is null;

alter table public.product_documents
  alter column product_id set not null,
  alter column title set not null,
  alter column file_name set not null,
  alter column file_url set not null,
  alter column file_size set not null,
  alter column mime_type set default 'application/pdf',
  alter column mime_type set not null,
  alter column sort_order set default 0,
  alter column sort_order set not null,
  alter column created_at set default now(),
  alter column created_at set not null,
  alter column updated_at set default now(),
  alter column updated_at set not null;

alter table public.product_documents
  drop constraint if exists product_documents_file_size_check,
  add constraint product_documents_file_size_check check (file_size > 0 and file_size <= 5242880);

alter table public.product_documents
  drop constraint if exists product_documents_mime_type_check,
  add constraint product_documents_mime_type_check check (mime_type = 'application/pdf');

create index if not exists product_documents_product_id_sort_idx
  on public.product_documents(product_id, sort_order, created_at);

create or replace function public.set_product_documents_updated_at()
returns trigger
language plpgsql
set search_path = public
as $function$
begin
  new.updated_at := now();
  return new;
end
$function$;

drop trigger if exists set_product_documents_updated_at on public.product_documents;
create trigger set_product_documents_updated_at
before update on public.product_documents
for each row
execute function public.set_product_documents_updated_at();

alter table public.product_documents enable row level security;

drop policy if exists "public reads active product documents" on public.product_documents;
drop policy if exists "self-hosted app server manages product documents" on public.product_documents;

create policy "public reads active product documents"
  on public.product_documents
  as permissive
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.products
      where products.id = product_documents.product_id
        and coalesce(products.is_active, true) = true
    )
  );

grant select on table public.product_documents to anon, authenticated;

do $migration$
begin
  if exists (select 1 from pg_roles where rolname = 'sacouser') then
    grant usage on schema public to sacouser;
    grant select, insert, update, delete on table public.product_documents to sacouser;
    grant execute on function public.set_product_documents_updated_at() to sacouser;

    create policy "self-hosted app server manages product documents"
      on public.product_documents
      as permissive
      for all
      to sacouser
      using (true)
      with check (true);
  else
    raise notice 'Role sacouser does not exist; self-hosted product document policies and grants were not created.';
  end if;
end
$migration$;

commit;
