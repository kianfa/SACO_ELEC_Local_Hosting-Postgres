import "server-only"

import nodemailer from "nodemailer"

type PasswordResetEmailInput = { to: string; resetUrl: string }

export async function sendPasswordResetEmail({ to, resetUrl }: PasswordResetEmailInput): Promise<void> {
  const host = process.env.SMTP_HOST
  const port = Number(process.env.SMTP_PORT || "587")
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASSWORD
  const from = process.env.SMTP_FROM

  if (!host || !from || !Number.isFinite(port)) {
    throw new Error("SMTP is not configured")
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: process.env.SMTP_SECURE === "true",
    auth: user && pass ? { user, pass } : undefined,
  })

  await transporter.sendMail({
    from,
    to,
    subject: "بازیابی رمز عبور",
    text: `برای تغییر رمز عبور از این لینک استفاده کنید: ${resetUrl}`,
  })
}
