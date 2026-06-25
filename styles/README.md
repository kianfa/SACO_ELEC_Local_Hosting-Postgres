# v0-industrial-electrical-homepage

This is a [Next.js](https://nextjs.org) project bootstrapped with [v0](https://v0.app).

## Built with v0

This repository is linked to a [v0](https://v0.app) project. You can continue developing by visiting the link below -- start new chats to make changes, and v0 will push commits directly to this repo. Every merge to `main` will automatically deploy.

[Continue working on v0 →](https://v0.app/chat/projects/prj_sc7WcPoiD3OAFuKCAw0MvUBrVrZt)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Learn More

To learn more, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [v0 Documentation](https://v0.app/docs) - learn about v0 and how to use it.

<a href="https://v0.app/chat/api/kiro/clone/kianfa/v0-industrial-electrical-homepage" alt="Open in Kiro"><img src="https://pdgvvgmkdvyeydso.public.blob.vercel-storage.com/open%20in%20kiro.svg?sanitize=true" /></a>

## MinIO media storage

Supabase remains the database and authentication provider where configured. New image uploads are stored in MinIO through the S3-compatible AWS SDK, and the database continues to store public image URLs as strings.

Install dependencies:

```bash
pnpm install
```

Required media environment variables:

```env
MEDIA_STORAGE_DRIVER=minio
MINIO_ENDPOINT=http://localhost:9000
MINIO_REGION=us-east-1
MINIO_ACCESS_KEY=
MINIO_SECRET_KEY=
MINIO_BUCKET=saco-media
MINIO_PUBLIC_BASE_URL=http://localhost:9000/saco-media
MINIO_FORCE_PATH_STYLE=true
```

Production example:

```env
MEDIA_STORAGE_DRIVER=minio
MINIO_ENDPOINT=https://minio.example.com
MINIO_REGION=us-east-1
MINIO_ACCESS_KEY=your-access-key
MINIO_SECRET_KEY=your-secret-key
MINIO_BUCKET=saco-media
MINIO_PUBLIC_BASE_URL=https://cdn.example.com
MINIO_FORCE_PATH_STYLE=true
```

`MINIO_PUBLIC_BASE_URL` is the public URL prefix saved in image fields and used for displaying uploaded images. Do not expose `MINIO_SECRET_KEY` to the browser, and do not prefix it with `NEXT_PUBLIC_`.

Local MinIO example:

```bash
docker run -p 9000:9000 -p 9001:9001   -e MINIO_ROOT_USER=minioadmin   -e MINIO_ROOT_PASSWORD=minioadmin   quay.io/minio/minio server /data --console-address ":9001"
```

Create the bucket before uploading:

```text
saco-media
```

The bucket policy, reverse proxy, or CDN must make uploaded objects publicly readable through `MINIO_PUBLIC_BASE_URL`.

New uploads use object keys such as:

```text
products/product-slug/image.webp
site-media/banners/banner-123.webp
site-media/categories/category-slug/image.webp
site-media/brands/brand-slug/logo.webp
site-media/homepage/hero.webp
```

Legacy `/uploads/...`, legacy Supabase Storage, and external image URLs remain supported for display. Existing image URLs are not automatically rewritten, and legacy Supabase/local media are not deleted by this MinIO refactor.

Supabase Storage buckets are not required for new uploads. Do not configure Storage write policies for the new media pipeline. Existing buckets may remain available only so legacy image URLs continue to display.

## Performance diagnostics

Admin login routes intentionally use a minimal root layout and do not fetch storefront settings. Storefront routes load cached public settings from `app/(storefront)/layout.tsx` with a 60-second revalidation window. Protected admin pages perform an authoritative Better Auth session check and `profiles.role = 'admin'` verification in the protected server layout and in protected Server Actions.

To print concise server-side timings temporarily:

```env
DEBUG_PERFORMANCE=true
```

Timing logs never include passwords, cookies, tokens, session objects, database URLs, or keys. Disable the flag after diagnosis.

Measure Supabase network latency independently from Next.js rendering:

```bash
pnpm debug:supabase-latency
```

The diagnostic script reports repeated DNS, Supabase Auth settings endpoint, and lightweight database-query timings with min, max, and average durations. It does not print credentials.

Compare development and production behavior:

```bash
pnpm dev
pnpm build
pnpm start
```

Then request:

```txt
/admin/login
/admin/products
/api/auth/customer/status
```

Apply the reviewed non-destructive performance index migration manually after taking a database backup:

```txt
supabase/migrations/20260605_optimize_admin_performance.sql
```

## Homepage duplicate-request diagnostics

The storefront shares customer auth status and footer categories through layout-level providers so the loading shell and resolved page do not independently refetch the same data. For the audit details and runtime verification commands, see `docs/HOMEPAGE_DUPLICATE_REQUEST_FIX_REPORT.md`.

Run the dependency-free structural check with:

```bash
pnpm debug:homepage-request-sources
```


## Admin new-product route diagnostics

For a dependency-free source audit of `/admin/products/new`, run:

```bash
pnpm debug:admin-new-product-route
```

Enable temporary server-stage logging with:

```env
DEBUG_PERFORMANCE=true
EXTERNAL_REQUEST_TIMEOUT_MS=20000
AUTH_REQUEST_TIMEOUT_MS=25000
PUBLIC_DATA_TIMEOUT_MS=20000
ADMIN_MUTATION_TIMEOUT_MS=30000
FILE_OPERATION_TIMEOUT_MS=15000
```


## Runtime timeout profiles for slow networks

The application keeps bounded timeout protection while allowing slower hosting connections. Configure these values in production:

```env
EXTERNAL_REQUEST_TIMEOUT_MS=20000
AUTH_REQUEST_TIMEOUT_MS=25000
PUBLIC_DATA_TIMEOUT_MS=20000
ADMIN_MUTATION_TIMEOUT_MS=30000
FILE_OPERATION_TIMEOUT_MS=15000
```

Timeout purposes:

- `EXTERNAL_REQUEST_TIMEOUT_MS`: default fallback for external requests without a more specific profile.
- `AUTH_REQUEST_TIMEOUT_MS`: Better Auth session validation and authenticated profile lookups.
- `PUBLIC_DATA_TIMEOUT_MS`: public storefront reads such as settings, categories, banners, and footer data.
- `ADMIN_MUTATION_TIMEOUT_MS`: protected admin create, update, delete, and toggle operations.
- `FILE_OPERATION_TIMEOUT_MS`: local filesystem media directory creation, writes, replacement cleanup, and deletes.

Missing, non-numeric, unreasonably small, or excessively large values fall back to safe bounded defaults. Timeouts are never unlimited. Compatible Supabase PostgREST requests receive abort signals so timed-out network work is cancelled rather than left running in the background.

## Better Auth authentication

Runtime authentication is handled by Better Auth with PostgreSQL-backed sessions and secure HTTP-only cookies. Supabase remains in use for database hosting and public catalog/content queries, but not for login, registration, logout, session reads, or password reset.

Required server environment values:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE
BETTER_AUTH_SECRET=replace-with-a-long-random-secret-at-least-32-characters
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SUPABASE_SECRET_KEY=your-server-only-supabase-secret-key
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=
MEDIA_STORAGE_DRIVER=minio
MINIO_ENDPOINT=http://localhost:9000
MINIO_REGION=us-east-1
MINIO_ACCESS_KEY=
MINIO_SECRET_KEY=
MINIO_BUCKET=saco-media
MINIO_PUBLIC_BASE_URL=http://localhost:9000/saco-media
MINIO_FORCE_PATH_STYLE=true
```

Back up the PostgreSQL database, then apply:

```bash
psql "$DATABASE_URL" -f supabase/migrations/20260606_replace_supabase_auth_with_better_auth.sql
```

Create the first admin with environment variables and `npm run auth:create-admin`. See `docs/BETTER_AUTH_CUTOVER.md` for the cutover and future PostgreSQL-host move instructions.


## Admin login rate limiting

The admin login page does not use Cloudflare Turnstile. Customer login and registration Turnstile flows remain unchanged. Admin login is protected by a PostgreSQL-backed atomic limiter: the first 3 attempts within 60 seconds are accepted, while the 4th attempt is blocked until the window expires. The database stores only an HMAC-SHA256 identifier derived from request IP plus normalized email; it does not store raw IP addresses.

Apply the migration manually after backing up PostgreSQL:

```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/migrations/20260607_admin_login_rate_limits.sql
```

Run the database-backed verification after applying the migration:

```bash
pnpm run test:admin-login-rate-limit
```
