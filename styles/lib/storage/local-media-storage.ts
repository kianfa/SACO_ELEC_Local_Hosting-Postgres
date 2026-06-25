import "server-only"

import path from "node:path"
import crypto from "node:crypto"
import { mkdir, writeFile, unlink } from "node:fs/promises"
import { withFileOperationTimeout } from "@/lib/performance/server-timing"
import {
  assertSafeImageFile,
  assertSafeImageSignature,
  assertSafePdfSignature,
  assertSafeProductDocumentFile,
  getSafeImageExtension,
  getSafeProductDocumentExtension,
  toSafePathSegment,
  type SafeDocumentExtension,
  type SafeImageExtension,
} from "@/lib/security/file-upload"

const DEFAULT_PUBLIC_BASE_URL = "/uploads"

function uploadRoot(): string {
  const configured = process.env.MEDIA_UPLOAD_DIR?.trim()
  const value = configured || path.join(/* turbopackIgnore: true */ process.cwd(), "public", "uploads")
  return path.resolve(value)
}

function publicBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_MEDIA_BASE_URL?.trim() || DEFAULT_PUBLIC_BASE_URL
  const pathname = configured.startsWith("/") ? configured : `/${configured}`
  return pathname.replace(/\/+$/, "") || DEFAULT_PUBLIC_BASE_URL
}

function assertSafeRelativePath(relativePath: string): string {
  const normalized = relativePath.replace(/\\/g, "/").replace(/^\/+/, "")
  const parts = normalized.split("/")
  if (!normalized || parts.some((part) => !part || part === "." || part === "..")) {
    throw new Error("مسیر ذخیره‌سازی نامعتبر است.")
  }
  return normalized
}

export function resolveSafeUploadPath(relativePath: string): string {
  const root = uploadRoot()
  const safeRelativePath = assertSafeRelativePath(relativePath)
  const resolved = path.resolve(root, safeRelativePath)
  if (resolved !== root && !resolved.startsWith(`${root}${path.sep}`)) {
    throw new Error("مسیر ذخیره‌سازی خارج از پوشه مجاز است.")
  }
  return resolved
}

export function publicUrlFromRelativePath(relativePath: string): string {
  const safeRelativePath = assertSafeRelativePath(relativePath)
  return `${publicBaseUrl()}/${safeRelativePath}`
}

export function relativePathFromLocalPublicUrl(value: string | null | undefined): string | null {
  if (!value?.trim()) return null
  const trimmed = value.trim()
  if (/^https?:\/\//i.test(trimmed)) return null

  const base = publicBaseUrl()
  if (trimmed === base) return null
  if (!trimmed.startsWith(`${base}/`)) return null

  try {
    return assertSafeRelativePath(decodeURIComponent(trimmed.slice(base.length + 1)))
  } catch {
    return null
  }
}

function createUniqueName(extension: SafeImageExtension | SafeDocumentExtension, preferredBaseName?: string, fallbackBaseName = "file"): string {
  const safeBaseName = preferredBaseName ? toSafePathSegment(preferredBaseName.replace(/\.[^.]+$/, ""), fallbackBaseName) : fallbackBaseName
  return `${safeBaseName}-${crypto.randomUUID()}.${extension}`
}

export type UploadLocalMediaOptions = {
  folder: string
  preferredBaseName?: string
  fixedFileName?: string
}

export async function uploadLocalMedia(file: File, options: UploadLocalMediaOptions): Promise<{ publicUrl: string; relativePath: string }> {
  assertSafeImageFile(file)
  const buffer = Buffer.from(await file.arrayBuffer())
  assertSafeImageSignature(buffer, file.type)

  const extension = getSafeImageExtension(file)
  const folder = assertSafeRelativePath(options.folder)
  const fixedBaseName = options.fixedFileName?.replace(/\.[^.]+$/, "")
  const fileName = fixedBaseName
    ? `${toSafePathSegment(fixedBaseName, "image")}.${extension}`
    : createUniqueName(extension, options.preferredBaseName, "image")
  const relativePath = assertSafeRelativePath(`${folder}/${fileName}`)
  const destination = resolveSafeUploadPath(relativePath)

  await withFileOperationTimeout("create media directory", mkdir(path.dirname(destination), { recursive: true }))
  await withFileOperationTimeout("write local media file", writeFile(destination, buffer))

  if (fixedBaseName) {
    const safeBaseName = toSafePathSegment(fixedBaseName, "image")
    for (const oldExtension of ["jpg", "png", "webp"] as const) {
      const siblingRelativePath = assertSafeRelativePath(`${folder}/${safeBaseName}.${oldExtension}`)
      if (siblingRelativePath === relativePath) continue
      try {
        await withFileOperationTimeout("remove previous local media file", unlink(resolveSafeUploadPath(siblingRelativePath)))
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
          throw new Error("پاک‌سازی نسخه قبلی تصویر از فضای هاست ناموفق بود.")
        }
      }
    }
  }

  return { publicUrl: publicUrlFromRelativePath(relativePath), relativePath }
}

export async function uploadLocalProductDocument(file: File, options: UploadLocalMediaOptions): Promise<{ publicUrl: string; relativePath: string }> {
  assertSafeProductDocumentFile(file)
  const buffer = Buffer.from(await file.arrayBuffer())
  assertSafePdfSignature(buffer)

  const extension = getSafeProductDocumentExtension(file)
  const folder = assertSafeRelativePath(options.folder)
  const fixedBaseName = options.fixedFileName?.replace(/\.[^.]+$/, "")
  const fileName = fixedBaseName
    ? `${toSafePathSegment(fixedBaseName, "document")}.${extension}`
    : createUniqueName(extension, options.preferredBaseName, "document")
  const relativePath = assertSafeRelativePath(`${folder}/${fileName}`)
  const destination = resolveSafeUploadPath(relativePath)

  await withFileOperationTimeout("create document directory", mkdir(path.dirname(destination), { recursive: true }))
  await withFileOperationTimeout("write local product document", writeFile(destination, buffer))

  if (fixedBaseName) {
    const safeBaseName = toSafePathSegment(fixedBaseName, "document")
    const siblingRelativePath = assertSafeRelativePath(`${folder}/${safeBaseName}.pdf`)
    if (siblingRelativePath !== relativePath) {
      try {
        await withFileOperationTimeout("remove previous local product document", unlink(resolveSafeUploadPath(siblingRelativePath)))
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
          throw new Error("پاک‌سازی نسخه قبلی فایل PDF از فضای هاست ناموفق بود.")
        }
      }
    }
  }

  return { publicUrl: publicUrlFromRelativePath(relativePath), relativePath }
}

export async function deleteLocalMediaByPublicUrl(value: string | null | undefined): Promise<boolean> {
  const relativePath = relativePathFromLocalPublicUrl(value)
  if (!relativePath) return false

  const destination = resolveSafeUploadPath(relativePath)
  try {
    await withFileOperationTimeout("delete local media file", unlink(destination))
    return true
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return false
    throw new Error("حذف فایل از فضای هاست ناموفق بود.")
  }
}
