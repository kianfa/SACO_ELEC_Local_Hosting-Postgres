import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { ArrowUpLeft, Phone } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface ContactCardAction {
  label: string
  href: string
  external?: boolean
}

interface ContactCardProps {
  icon: LucideIcon
  title: string
  value: string
  description: string
  phone?: string
  actions: ContactCardAction[]
  badges?: string[]
}

export function ContactCard({ icon: Icon, title, value, description, phone, actions, badges }: ContactCardProps) {
  return (
    <Card className="group h-full overflow-hidden rounded-2xl border-border/80 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <CardContent className="flex h-full flex-col p-5 md:p-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            <Icon className="h-6 w-6" />
          </div>
          {badges && badges.length > 0 && (
            <div className="flex flex-wrap justify-end gap-1.5">
              {badges.map((badge) => (
                <Badge key={badge} variant="secondary" className="rounded-full bg-accent/10 text-accent-foreground">
                  {badge}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <h3 className="mb-2 text-lg font-extrabold text-foreground">{title}</h3>
        <p className="mb-2 text-xl font-black text-primary" dir="auto">
          {value}
        </p>
        {phone && (
          <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="h-4 w-4 text-accent" />
            <span>شماره تماس:</span>
            <span dir="ltr" className="font-bold text-foreground">
              {phone}
            </span>
          </div>
        )}
        <p className="mb-5 flex-1 text-sm leading-7 text-muted-foreground">{description}</p>

        <div className="flex flex-wrap gap-2">
          {actions.map((action) => (
            <Button key={action.label} asChild variant={actions.length > 1 ? "outline" : "default"} className="rounded-xl">
              <Link href={action.href} target={action.external ? "_blank" : undefined} rel={action.external ? "noreferrer" : undefined}>
                {action.label}
                {action.external && <ArrowUpLeft className="mr-2 h-4 w-4" />}
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
