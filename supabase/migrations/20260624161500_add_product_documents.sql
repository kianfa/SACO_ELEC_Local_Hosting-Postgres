-- 20260624161500_add_product_documents.sql
-- Adds PostgreSQL/Supabase metadata support for product PDF datasheets/documents.
-- App code writes these exact fields through lib/repositories/admin-products-repository.ts:
-- product_id, title, file_name, file_url, storage_path, file_size, mime_type, sort_order.
-- Files are validated in app code as application/pdf and <= 5MB before upload.
-- The current project media layer uses local or MinIO-compatible storage. The
-- optional Supabase Storage bucket/policies below are guarded so this migration
-- also works on plain PostgreSQL/self-hosted deployments without storage schema.

begin;

create table if not exists public.product_documents (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  title text not null,
  file_name text not null,
  file_url text not null,
  storage_path text not null,
  file_size integer not null,
  mime_type text not null default 'application/pdf',
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
  title = coalesce(nullif(title, ''), nullif(file_name, ''), 'فایل PDF محصول'),
  file_name = coalesce(nullif(file_name, ''), 'document.pdf'),
  file_url = coalesce(nullif(file_url, ''), nullif(storage_path, ''), ''),
  storage_path = coalesce(
    nullif(storage_path, ''),
    nullif(file_url, ''),
    'products/' || coalesce(product_id::text, 'unknown-product') || '/documents/' || coalesce(nullif(file_name, ''), 'document.pdf')
  ),
  file_size = coalesce(nullif(file_size, 0), 1),
  mime_type = coalesce(nullif(mime_type, ''), 'application/pdf'),
  sort_order = coalesce(sort_order, 0),
  created_at = coalesce(created_at, now()),
  updated_at = coalesce(updated_at, now())
where title is null
  or btrim(coalesce(title, '')) = ''
  or file_name is null
  or btrim(coalesce(file_name, '')) = ''
  or file_url is null
  or storage_path is null
  or btrim(coalesce(storage_path, '')) = ''
  or file_size is null
  or file_size <= 0
  or mime_type is null
  or btrim(coalesce(mime_type, '')) = ''
  or sort_order is null
  or created_at is null
  or updated_at is null;

alter table public.product_documents
  alter column product_id set not null,
  alter column title set not null,
  alter column file_name set not null,
  alter column file_url set not null,
  alter column storage_path set not null,
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

alter table public.product_documents
  drop constraint if exists product_documents_storage_path_check,
  add constraint product_documents_storage_path_check check (btrim(storage_path) <> '');

create index if not exists product_documents_product_id_idx
  on public.product_documents(product_id);

create index if not exists product_documents_product_id_sort_idx
  on public.product_documents(product_id, sort_order, created_at);

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

drop trigger if exists update_product_documents_updated_at on public.product_documents;
create trigger update_product_documents_updated_at
before update on public.product_documents
for each row
execute function public.update_updated_at_column();

alter table public.product_documents enable row level security;

drop policy if exists "public read active product documents" on public.product_documents;
create policy "public read active product documents"
  on public.product_documents
  for select
  to public
  using (
    exists (
      select 1
      from public.products p
      where p.id = product_documents.product_id
        and p.is_active = true
    )
  );

drop policy if exists "admins manage product documents" on public.product_documents;
create policy "admins manage product documents"
  on public.product_documents
  for all
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- Trusted plain-PostgreSQL application-server role. Better Auth authorization is
-- enforced by Next.js before admin mutations reach DATABASE_URL.
do $product_documents_sacouser_policy$
begin
  if exists (select 1 from pg_roles where rolname = 'sacouser') then
    grant usage on schema public to sacouser;
    grant select, insert, update, delete on table public.product_documents to sacouser;

    drop policy if exists "self-hosted app server manages product documents" on public.product_documents;
    create policy "self-hosted app server manages product documents"
      on public.product_documents
      as permissive
      for all
      to sacouser
      using (true)
      with check (true);
  else
    raise notice 'Role sacouser does not exist; self-hosted product document grants/policies were not created.';
  end if;
end
$product_documents_sacouser_policy$;

grant select on table public.product_documents to anon, authenticated;
grant insert, update, delete on table public.product_documents to authenticated;

-- Optional Supabase Storage setup. The running app currently stores documents via
-- the existing media driver, but this bucket is ready if the project is moved to
-- Supabase Storage later.
do $product_documents_storage_bucket$
begin
  if to_regclass('storage.buckets') is not null then
    insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    values ('product-documents', 'product-documents', true, 5242880, array['application/pdf'])
    on conflict (id) do update
      set public = excluded.public,
          file_size_limit = excluded.file_size_limit,
          allowed_mime_types = excluded.allowed_mime_types;
  else
    raise notice 'Supabase Storage schema is not installed; skipped product-documents bucket setup.';
  end if;
end
$product_documents_storage_bucket$;

do $product_documents_storage_policies$
begin
  if to_regclass('storage.objects') is not null then
    execute 'drop policy if exists "public read product document objects" on storage.objects';
    execute 'create policy "public read product document objects" on storage.objects for select to public using (bucket_id = ''product-documents'')';

    execute 'drop policy if exists "admins upload product document objects" on storage.objects';
    execute 'create policy "admins upload product document objects" on storage.objects for insert to authenticated with check (bucket_id = ''product-documents'' and (select public.is_admin()))';

    execute 'drop policy if exists "admins update product document objects" on storage.objects';
    execute 'create policy "admins update product document objects" on storage.objects for update to authenticated using (bucket_id = ''product-documents'' and (select public.is_admin())) with check (bucket_id = ''product-documents'' and (select public.is_admin()))';

    execute 'drop policy if exists "admins delete product document objects" on storage.objects';
    execute 'create policy "admins delete product document objects" on storage.objects for delete to authenticated using (bucket_id = ''product-documents'' and (select public.is_admin()))';
  else
    raise notice 'Supabase Storage objects table is not installed; skipped product document object policies.';
  end if;
end
$product_documents_storage_policies$;

commit;
