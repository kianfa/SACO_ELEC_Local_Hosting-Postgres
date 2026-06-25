"use client"

import Script from "next/script"
import { useEffect, useId, useRef, useState } from "react"
import { AlertCircle } from "lucide-react"

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string
          callback?: (token: string) => void
          "expired-callback"?: () => void
          "error-callback"?: () => void
          theme?: "light" | "dark" | "auto"
          language?: string
        },
      ) => string
      reset: (widgetId?: string) => void
      remove: (widgetId: string) => void
    }
  }
}

type TurnstileCaptchaProps = {
  /** Existing customer forms pass token/onTokenChange and render their own hidden input. */
  token?: string
  onTokenChange?: (token: string) => void
  /** Admin form uses resetSignal and relies on this component to render hidden input. */
  resetSignal?: unknown
  helperText?: string
}

export function TurnstileCaptcha({ onTokenChange, resetSignal, helperText }: TurnstileCaptchaProps) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  const rawId = useId()
  const widgetContainerId = `turnstile-${rawId.replace(/:/g, "")}`
  const containerRef = useRef<HTMLDivElement | null>(null)
  const widgetIdRef = useRef<string | null>(null)
  const [internalToken, setInternalToken] = useState("")
  const [scriptReady, setScriptReady] = useState(false)

  const setToken = (value: string) => {
    setInternalToken(value)
    onTokenChange?.(value)
  }

  useEffect(() => {
    if (!siteKey || !scriptReady || !containerRef.current || !window.turnstile || widgetIdRef.current) return

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      theme: "light",
      language: "fa",
      callback: (value) => setToken(value),
      "expired-callback": () => setToken(""),
      "error-callback": () => setToken(""),
    })
  }, [scriptReady, siteKey])

  useEffect(() => {
    setToken("")
    if (widgetIdRef.current && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current)
    }
    // resetSignal intentionally controls external reset; setToken identity should not trigger this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetSignal])

  useEffect(() => {
    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current)
        widgetIdRef.current = null
      }
    }
  }, [])

  if (!siteKey) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-7 text-amber-800">
        <div className="flex items-start gap-2">
          <AlertCircle className="mt-1 h-4 w-4 shrink-0" />
          <p>
            کلید عمومی Turnstile تنظیم نشده است. مقدار <span dir="ltr">NEXT_PUBLIC_TURNSTILE_SITE_KEY</span> را در فایل env قرار دهید.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
      />
      {!onTokenChange ? <input type="hidden" name="turnstileToken" value={internalToken} /> : null}
      <div id={widgetContainerId} ref={containerRef} className="flex min-h-[65px] justify-center" />
      <p className="text-xs leading-6 text-muted-foreground">
        {helperText ?? "برای امنیت بیشتر، ورود و ثبت‌نام با Cloudflare Turnstile محافظت می‌شود."}
      </p>
    </div>
  )
}
