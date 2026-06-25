import { cn } from "@/lib/utils"

type HeroWarpBackgroundProps = {
  className?: string
}

export function HeroWarpBackground({ className }: HeroWarpBackgroundProps) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 z-0 overflow-hidden bg-[#081225]",
        className,
      )}
      aria-hidden="true"
    >
      <div
        className="hero-industrial-photo absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/hero/industrial-data-center-corridor.webp')" }}
      />
      <div className="hero-industrial-photo-overlay absolute inset-0" />
      <div className="hero-industrial-photo-depth absolute inset-0" />
      <div className="hero-industrial-left-stage absolute inset-y-0 left-0 w-full lg:w-[58%]" />

      <div className="hero-industrial-directional-light absolute inset-0" />
      <div className="hero-industrial-blueprint absolute -inset-[8%] opacity-[0.08]" />

      <div className="hero-industrial-glow hero-industrial-glow-one absolute left-[8%] top-[28%] h-64 w-64 rounded-full bg-cyan-300/5 blur-2xl sm:h-80 sm:w-80 lg:h-96 lg:w-96" />
      <div className="hero-industrial-glow hero-industrial-glow-two absolute right-[14%] bottom-[-8rem] h-72 w-72 rounded-full bg-blue-500/6 blur-2xl sm:h-[22rem] sm:w-[22rem] lg:h-[26rem] lg:w-[26rem]" />
      <div className="hero-industrial-glow hero-industrial-glow-four absolute right-10 top-8 h-44 w-44 rounded-full bg-accent/5 blur-2xl lg:h-52 lg:w-52" />

      <div className="hero-industrial-noise absolute inset-0 opacity-[0.045]" />
      <div className="hero-industrial-photo-vignette absolute inset-0" />
    </div>
  )
}
