export type TurnstileVerificationResult =
  | { ok: true }
  | { ok: false; message: string }

type CloudflareTurnstileResponse = {
  success: boolean
  "error-codes"?: string[]
}

export async function verifyTurnstileToken(token: string | null | undefined): Promise<TurnstileVerificationResult> {
  if (!token) {
    return { ok: false, message: "لطفاً تأیید امنیتی را انجام دهید." }
  }

  const secretKey = process.env.TURNSTILE_SECRET_KEY
  if (!secretKey) {
    return { ok: false, message: "کلید امنیتی Turnstile روی سرور تنظیم نشده است." }
  }

  try {
    const formData = new FormData()
    formData.append("secret", secretKey)
    formData.append("response", token)

    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: formData,
      cache: "no-store",
    })

    if (!response.ok) {
      return { ok: false, message: "تأیید امنیتی ناموفق بود. لطفاً دوباره تلاش کنید." }
    }

    const result = (await response.json()) as CloudflareTurnstileResponse
    if (!result.success) {
      return { ok: false, message: "تأیید امنیتی ناموفق بود. لطفاً دوباره تلاش کنید." }
    }

    return { ok: true }
  } catch {
    return { ok: false, message: "تأیید امنیتی ناموفق بود. لطفاً دوباره تلاش کنید." }
  }
}
