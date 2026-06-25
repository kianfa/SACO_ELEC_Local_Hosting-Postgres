# Create-admin script on Windows

The standalone `pnpm run auth:create-admin` command now reads `.env.local` and `.env` before opening its PostgreSQL pool. Explicit PowerShell environment variables still take priority.

## Required project environment values

```env
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=replace-with-a-random-secret-at-least-32-characters
BETTER_AUTH_URL=http://localhost:3000
```

## Create an admin in PowerShell

```powershell
$env:ADMIN_EMAIL="admin@example.com"
$env:ADMIN_PASSWORD="Choose-A-Strong-Password-Here"
$env:ADMIN_FULL_NAME="مدیر سایت"
$env:ADMIN_PHONE="03"
pnpm run auth:create-admin
```

After success:

```powershell
Remove-Item Env:ADMIN_EMAIL
Remove-Item Env:ADMIN_PASSWORD
Remove-Item Env:ADMIN_FULL_NAME
Remove-Item Env:ADMIN_PHONE
```

The command performs a safe PostgreSQL connection test and checks the Better Auth tables before creating the account. Error output is sanitized and does not print database URLs, passwords, or secrets.
