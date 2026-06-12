# Supabase Auth and Storage removal status

Runtime authentication uses Better Auth only. Login, registration, logout, password reset, cookie handling, and server-side session validation do not call Supabase Auth APIs.

New media uploads use the host filesystem under `public/uploads/` by default, or the directory configured by `MEDIA_UPLOAD_DIR`. New database URLs use relative public paths beginning with `/uploads/`. Safe deletion accepts only local URLs under the configured public media base URL and refuses remote URLs or traversal paths.

Legacy Supabase-hosted image URLs remain readable for old database rows. The legacy URL normalization helpers and the Supabase image remote pattern are display-only compatibility code. They do not upload, delete, or generate signed URLs for new files. Existing legacy Supabase files are not deleted automatically.

Supabase temporarily remains as the PostgreSQL/PostgREST provider for application tables. Calls such as `supabase.from("products")`, `supabase.from("categories")`, `supabase.from("brands")`, `supabase.from("profiles")`, and `supabase.from("site_banners")` remain intentionally. When the database is moved to self-hosted PostgreSQL, replace these table calls with direct PostgreSQL queries or an ORM and remove `@supabase/supabase-js` plus the temporary Supabase environment variables.

Historical SQL migrations retain old RLS and Storage-policy statements because they document and reproduce the migration path for earlier deployments. The later Better Auth and host-storage migrations supersede those runtime assumptions.
