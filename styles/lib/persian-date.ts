import { toDateTime } from "@/lib/date-time"

const fallback = "—"

export function formatPersianDate(value: unknown): string {
  const date = toDateTime(value)
  if (!date) return fallback
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date)
}

export function formatPersianTime(value: unknown): string {
  const date = toDateTime(value)
  if (!date) return fallback
  return new Intl.DateTimeFormat("fa-IR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

export function formatPersianDateTime(value: unknown): string {
  const date = toDateTime(value)
  if (!date) return fallback
  return new Intl.DateTimeFormat("fa-IR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)
}
