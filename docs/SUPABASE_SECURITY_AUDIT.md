# Supabase Security Audit Summary

## Scope reviewed
- Public catalog reads: products, brands, categories, inventory, images, specs
- Admin auth and route protection
- Admin server actions for products, content, media, and bulk price update
- Supabase client separation
- Storage upload paths and file validation
- RLS policy coverage for current and future tables

## Findings
1. **RLS needed central hardening.** Earlier migrations added some policies, but storage write policies were added incrementally during testing and could leave broad anon write policies behind.
2. **Admin pages use server-side protection.** `/admin/(protected)/layout.tsx` calls `requireAdminAccess()`, and `proxy.ts` redirects non-admin users early.
3. **No service role key was found in the codebase.** Only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are used.
4. **Admin actions re-check admin server-side.** Product, content, and bulk price actions call `requireAdminAccess()` before writes.
5. **Image uploads needed stricter validation.** The project now validates MIME type and file size and sanitizes storage path segments before upload.
6. **Bulk price update has the correct safety pattern.** Preview and final apply are separate server actions, and final apply re-generates the preview server-side before updating.

## Files changed
- `lib/security/file-upload.ts`
- `lib/repositories/admin-products-repository.ts`
- `lib/services/site-content-service.ts`
- `supabase/migrations/20260526_security_hardening.sql`
- `docs/SUPABASE_SECURITY_AUDIT.md`

## Required Supabase step
Run this migration in Supabase SQL Editor:

```txt
supabase/migrations/20260526_security_hardening.sql
```

## Important production notes
- Keep `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` public; this is expected.
- Never expose a service role key as `NEXT_PUBLIC_*`.
- If a service role key is added later, use it only in server-only files and never import it into client components.
- Historical note: legacy rows may still reference the former `product-images` and `site-media` buckets. New uploads are written to the host filesystem, so Supabase Storage write policies are no longer part of the active upload pipeline.
- The migration cleanup now removes legacy Storage insert, update, and delete policies without recreating them. Read-only policies remain solely for old hosted URLs.

## Test checklist
1. Anonymous visitor can open `/`, `/products`, and `/products/[slug]`.
2. Anonymous visitor cannot open `/admin/products`; they are redirected to `/admin/login`.
3. Non-admin authenticated user cannot open admin pages.
4. Admin user can open all admin pages.
5. Admin can create/edit product and upload product image.
6. Admin can edit homepage hero/banner and upload site media.
7. Anonymous users cannot invoke protected admin upload actions. Legacy Supabase Storage buckets may remain readable only so old image URLs continue to render.
8. Admin can preview bulk price update without changing database.
9. Bulk price apply requires final confirmation in UI and writes audit logs.
10. Public homepage still shows hero slider/banner fallback if no active content exists.
