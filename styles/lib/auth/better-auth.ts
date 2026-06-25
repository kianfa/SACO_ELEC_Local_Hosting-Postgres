import "server-only"

import { betterAuth } from "better-auth"
import { nextCookies } from "better-auth/next-js"
import { Pool } from "pg"
import { sendPasswordResetEmail } from "@/lib/auth/password-reset-email"

export const authPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  allowExitOnIdle: true,
})

export const auth = betterAuth({
  database: authPool,
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET,
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    revokeSessionsOnPasswordReset: true,
    resetPasswordTokenExpiresIn: 60 * 60,
    sendResetPassword: async ({ user, url }) => {
      void sendPasswordResetEmail({ to: user.email, resetUrl: url }).catch(() => {
        console.error("[auth] password reset email delivery failed")
      })
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  advanced: {
    database: { generateId: "uuid" },
    defaultCookieAttributes: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    },
  },
  plugins: [nextCookies()],
})
