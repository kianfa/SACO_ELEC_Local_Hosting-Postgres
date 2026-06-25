"use client"

import { Warp } from "@paper-design/shaders-react"
import { cn } from "@/lib/utils"

type HeroWarpBackgroundProps = {
  className?: string
}

const shaderColors = ["#020817", "#061328", "#08224a", "#0d2b58", "#1d4f95"]

export function HeroWarpBackground({ className }: HeroWarpBackgroundProps) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 z-0 overflow-hidden bg-[#061328]",
        className,
      )}
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_22%,rgba(29,78,216,0.56),transparent_30%),radial-gradient(circle_at_16%_20%,rgba(245,130,32,0.18),transparent_18%),linear-gradient(135deg,#020817_0%,#061328_42%,#08224a_74%,#020817_100%)]" />

      <div className="absolute -inset-[8%] opacity-[0.92] mix-blend-screen motion-reduce:hidden">
        <Warp
          style={{ height: "100%", width: "100%" }}
          proportion={0.42}
          softness={0.82}
          distortion={0.34}
          swirl={0.72}
          swirlIterations={9}
          shape="checks"
          shapeScale={0.075}
          scale={1.08}
          rotation={-8}
          speed={0.38}
          colors={shaderColors}
        />
      </div>

      <div className="hero-warp-visible-aurora absolute -inset-[16%] opacity-80 mix-blend-screen" />
      <div className="hero-warp-visible-grid absolute -inset-[6%] opacity-30 mix-blend-soft-light" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_68%_48%,rgba(37,99,235,0.24),transparent_42%),linear-gradient(90deg,rgba(2,8,23,0.18)_0%,rgba(6,19,40,0.36)_46%,rgba(2,8,23,0.82)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,8,23,0.24)_0%,rgba(6,19,40,0.10)_42%,rgba(2,8,23,0.58)_100%)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-blue-100/60 to-transparent" />
      <div className="absolute inset-x-10 bottom-0 h-px bg-gradient-to-l from-transparent via-blue-200/35 to-transparent" />
    </div>
  )
}
