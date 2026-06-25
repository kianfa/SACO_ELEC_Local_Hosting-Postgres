export const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"])
export const MAX_IMAGE_UPLOAD_BYTES = 5 * 1024 * 1024

export const ALLOWED_DOCUMENT_TYPES = new Set(["application/pdf"])
export const MAX_PRODUCT_DOCUMENT_UPLOAD_BYTES = 5 * 1024 * 1024

export type SafeImageExtension = "jpg" | "png" | "webp"
export type SafeDocumentExtension = "pdf"

export function assertSafeImageFile(file: File, options?: { maxBytes?: number }): void {
  const maxBytes = options?.maxBytes ?? MAX_IMAGE_UPLOAD_BYTES

  if (!file || file.size <= 0) {
    throw new Error("فایل تصویر معتبر نیست.")
  }

  if (file.size > maxBytes) {
    throw new Error("حجم تصویر نباید بیشتر از ۵ مگابایت باشد.")
  }

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error("فرمت تصویر باید JPG، PNG یا WebP باشد.")
  }
}

export function assertSafeProductDocumentFile(file: File, options?: { maxBytes?: number }): void {
  const maxBytes = options?.maxBytes ?? MAX_PRODUCT_DOCUMENT_UPLOAD_BYTES
  const fileName = file?.name?.toLowerCase() ?? ""
  const hasPdfName = fileName.endsWith(".pdf")
  const hasPdfMime = ALLOWED_DOCUMENT_TYPES.has(file?.type ?? "")

  if (!file || file.size <= 0) {
    throw new Error("فایل PDF معتبر نیست.")
  }

  if (file.size > maxBytes) {
    throw new Error("حجم هر فایل PDF نباید بیشتر از ۵ مگابایت باشد.")
  }

  if (!hasPdfName && !hasPdfMime) {
    throw new Error("فقط فایل PDF قابل آپلود است.")
  }
}

export function getSafeImageExtension(file: Pick<File, "type">): SafeImageExtension {
  if (file.type === "image/png") return "png"
  if (file.type === "image/jpeg") return "jpg"
  if (file.type === "image/webp") return "webp"
  throw new Error("فرمت تصویر باید JPG، PNG یا WebP باشد.")
}

export function getSafeProductDocumentExtension(file: Pick<File, "type" | "name">): SafeDocumentExtension {
  if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) return "pdf"
  throw new Error("فقط فایل PDF قابل آپلود است.")
}

export function assertSafeImageSignature(buffer: Buffer, mimeType: string): void {
  const isJpeg = buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff
  const isPng = buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  const isWebp = buffer.length >= 12 && buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP"

  const signatureMatches =
    (mimeType === "image/jpeg" && isJpeg) ||
    (mimeType === "image/png" && isPng) ||
    (mimeType === "image/webp" && isWebp)

  if (!signatureMatches) {
    throw new Error("محتوای فایل با فرمت تصویر انتخاب‌شده مطابقت ندارد.")
  }
}

export function assertSafePdfSignature(buffer: Buffer): void {
  const hasPdfHeader = buffer.length >= 5 && buffer.subarray(0, 5).toString("ascii") === "%PDF-"
  if (!hasPdfHeader) {
    throw new Error("محتوای فایل با فرمت PDF مطابقت ندارد.")
  }
}

export function toSafePathSegment(value: string, fallback = "file"): string {
  const safe = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")

  return safe || fallback
}

export function buildSafeStoragePath(parts: string[]): string {
  if (!parts.length) throw new Error("مسیر ذخیره‌سازی نامعتبر است.")
  return parts.map((part, index) => toSafePathSegment(part, index === parts.length - 1 ? "file" : "folder")).join("/")
}
