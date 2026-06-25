"use client"

import { cn } from "@/lib/utils"

type WarpShaderProps = {
  className?: string
}

export function WarpShader({ className }: WarpShaderProps) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden="true">
      <div className="absolute inset-0 bg-[#061328]" />
      <div className="hero-warp-shader absolute -inset-[18%] opacity-95" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(245,130,32,0.16),transparent_28%),radial-gradient(circle_at_42%_35%,rgba(59,130,246,0.18),transparent_34%),linear-gradient(135deg,rgba(4,16,38,0.78)_0%,rgba(8,34,74,0.72)_48%,rgba(13,43,88,0.76)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,16,38,0.12)_0%,rgba(5,18,42,0.58)_48%,rgba(4,13,31,0.95)_100%)]" />
      <div className="absolute inset-0 opacity-[0.13] [background-image:linear-gradient(rgba(255,255,255,0.13)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.13)_1px,transparent_1px)] [background-size:42px_42px]" />
      <div className="absolute inset-0 opacity-[0.10] [background-image:radial-gradient(circle_at_center,rgba(255,255,255,0.45)_1px,transparent_1.5px)] [background-size:22px_22px]" />
      <div className="absolute inset-y-0 right-0 w-2/3 bg-[radial-gradient(circle_at_72%_50%,rgba(15,67,132,0.50),transparent_48%)]" />
      <div className="absolute -right-24 top-12 h-80 w-80 rounded-full bg-accent/16 blur-3xl" />
      <div className="absolute -bottom-28 left-5 h-96 w-96 rounded-full bg-blue-400/16 blur-3xl" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-white/45 to-transparent" />
    </div>
  )
}
