# Admin login rate limit

Cloudflare Turnstile is intentionally removed only from `/admin/login`.
Customer login, customer registration, and password-reset forms keep their existing Turnstile behavior.

Admin login is protected by a PostgreSQL-backed limiter:

- maximum 3 attempts
- 60-second window
- 4th attempt is blocked until the window expires
- key is `sha256(ip + ':' + normalizedEmail)`
- raw IP addresses are not stored
- successful admin login clears the matching row
- expired rows are cleaned during checks

Apply the migration before testing:

```sql
supabase/migrations/20260607_admin_login_rate_limits.sql
```

Blocked message:

```txt
تعداد تلاش‌های ورود بیش از حد مجاز است. لطفاً ۱ دقیقه دیگر دوباره تلاش کنید.
```

## Verification

After applying the SQL migration, run:

```bash
pnpm run test:admin-login-rate-limit
```

The script uses a synthetic hashed key, checks the first three accepted attempts, verifies that the fourth attempt is blocked, advances the synthetic row past the 60-second window, and removes its test record.
