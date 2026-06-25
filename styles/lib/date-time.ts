export type DateTimeValue = string | Date | null | undefined

export function toDateTime(value: unknown): Date | null {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value
  }

  if (typeof value !== "string") return null
  const trimmed = value.trim()
  if (!trimmed) return null

  const date = new Date(trimmed)
  return Number.isNaN(date.getTime()) ? null : date
}

export function normalizeDateTimeValue(value: unknown): string | null {
  if (value == null) return null
  if (typeof value === "string") return value.trim() || null

  const date = toDateTime(value)
  return date ? date.toISOString() : null
}

function twoDigits(value: number): string {
  return String(value).padStart(2, "0")
}

export function formatDateTimeLocalInput(value: unknown): string {
  if (typeof value === "string") {
    const trimmed = value.trim()
    if (!trimmed) return ""

    // Preserve an already-local datetime-local value exactly as entered.
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(trimmed)) return trimmed
  }

  const date = toDateTime(value)
  if (!date) return ""

  return [
    date.getFullYear(),
    "-",
    twoDigits(date.getMonth() + 1),
    "-",
    twoDigits(date.getDate()),
    "T",
    twoDigits(date.getHours()),
    ":",
    twoDigits(date.getMinutes()),
  ].join("")
}
