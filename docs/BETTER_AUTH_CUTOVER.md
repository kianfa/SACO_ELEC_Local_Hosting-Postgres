# Better Auth cutover

The application now uses Better Auth for email/password authentication and database-backed cookie sessions. Supabase remains the database provider for catalog and content queries. Old Supabase Auth users are intentionally not migrated.

## Install

```bash
npm install
```

## Environment

Set `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `NEXT_PUBLIC_SITE_URL`, `SUPABASE_SECRET_KEY`, and SMTP variables. Keep `MEDIA_UPLOAD_DIR=./public/uploads` and `NEXT_PUBLIC_MEDIA_BASE_URL=/uploads`.

## Apply schema after a backup

```bash
psql "$DATABASE_URL" -f supabase/migrations/20260606_replace_supabase_auth_with_better_auth.sql
```

The included SQL creates the Better Auth core tables, rewires application foreign keys for new UUID users, keeps the old Supabase `auth` schema for rollback safety, and revokes direct legacy Supabase-JWT writes.

The Better Auth CLI is also available for future schema updates:

```bash
npm run auth:migrate
```

## Create the first admin

```bash
ADMIN_EMAIL=admin@example.com \
ADMIN_PASSWORD='replace-me' \
ADMIN_FULL_NAME='Site Admin' \
ADMIN_PHONE='09000000000' \
npm run auth:create-admin
```

The command never prints the password. Re-running it updates the profile role and metadata without resetting an existing password.

## Future move to self-hosted PostgreSQL

Better Auth uses only `DATABASE_URL`. To move authentication storage later, copy the Better Auth tables (`user`, `session`, `account`, `verification`) and change `DATABASE_URL`. Supabase catalog/content queries remain separate until you migrate that data layer intentionally.
