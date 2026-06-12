import { Zap, Layers, Activity, Shield } from "lucide-react"

interface SpecsSummaryProps {
  specs: { label: string; value: string }[]
}

const iconMap: Record<string, React.ReactNode> = {
  "جریان نامی": <Zap className="w-6 h-6" />,
  "تعداد پل": <Layers className="w-6 h-6" />,
  "قدرت قطع": <Activity className="w-6 h-6" />,
  "نوع حفاظت": <Shield className="w-6 h-6" />,
}

export function SpecsSummary({ specs }: SpecsSummaryProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {specs.map((spec, index) => (
        <div
          key={index}
          className="bg-card border border-border rounded-2xl p-4 flex flex-col items-center text-center hover:border-primary/50 hover:shadow-md transition-all"
        >
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-3">
            {iconMap[spec.label] || <Zap className="w-6 h-6" />}
          </div>
          <p className="text-sm text-muted-foreground mb-1">{spec.label}</p>
          <p className="font-bold text-foreground">{spec.value}</p>
        </div>
      ))}
    </div>
  )
}
