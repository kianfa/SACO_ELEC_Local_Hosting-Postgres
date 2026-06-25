# Checkout finalization paths

This update presents two equally important ways to finalize a manual purchase:

1. Direct messaging through Telegram, WhatsApp, Bale, or Rubika.
2. A sales callback request with the current cart snapshot attached automatically.

## Required incremental migration

If `20260601_purchase_requests.sql` was already run, execute this file in Supabase SQL Editor:

```txt
supabase/migrations/20260602_purchase_request_checkout_paths.sql
```

It adds `purchase_requests.request_number`, backfills existing rows, and upgrades the controlled `create_purchase_request` RPC so checkout can show a tracking number plus registration date/time without exposing private request rows publicly.

## Security

Public visitors still cannot select, update, or delete callback requests. They can only invoke the restricted RPC. Admin RLS rules continue to protect list/detail pages and customer phone numbers.
