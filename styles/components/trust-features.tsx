"use client"

import { trustFeatures } from "@/lib/data"
import { Truck, Shield, Headphones, Settings } from "lucide-react"

const iconMap = {
  truck: Truck,
  shield: Shield,
  headphones: Headphones,
  settings: Settings,
}

export function TrustFeatures() {
  return (
    <section className="container mx-auto px-4 py-8">
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {trustFeatures.map((feature) => {
            const Icon = iconMap[feature.icon as keyof typeof iconMap]
            return (
              <div
                key={feature.id}
                className="flex flex-col md:flex-row items-center gap-3 text-center md:text-right"
              >
                <div className="w-14 h-14 bg-primary/5 rounded-xl flex items-center justify-center shrink-0">
                  <Icon className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
