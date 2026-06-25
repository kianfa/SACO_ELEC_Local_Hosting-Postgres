import "server-only"

import crypto from "node:crypto"
import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
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

const UPLOAD_ERROR_MESSAGE = "ذخیره‌سازی تصویر با خطا مواجه شد. لطفاً دوباره تلاش کنید."

export type UploadMinioMediaOptions = {
  folder: string
  preferredBaseName?: string
  fixedFileName?: string
}

type SafeMinioDiagnostics = {
  storageDriver?: string
  endpointHost?: string
  bucket?: string
  objectKey?: string
  contentType?: string
  fileSize?: number
}

type MinioConfig = {
  endpoint: string
  endpointHost: string
  region: string
  bucket: string
  publicBaseUrl: string
  accessKeyId: string
  secretAccessKey: string
  forcePathStyle: boolean
}

function redactError(error: unknown) {
  const candidate = error as { name?: unknown; message?: unknown; Code?: unknown; code?: unknown; $metadata?: { httpStatusCode?: number } }
  return {
    name: typeof candidate?.name === "string" ? candidate.name : error instanceof Error ? error.name : "UnknownError",
    message: typeof candidate?.message === "string" ? candidate.message : error instanceof Error ? error.message : "Unknown MinIO error",
    code: typeof candidate?.Code === "string" ? candidate.Code : typeof candidate?.code === "string" ? candidate.code : undefined,
    httpStatusCode: candidate?.$metadata?.httpStatusCode,
  }
}

function logMinioFailure(action: string, error: unknown, diagnostics: SafeMinioDiagnostics = {}): void {
  console.error("[media:minio]", {
    action,
    error: redactError(error),
    storageDriver: diagnostics.storageDriver ?? process.env.MEDIA_STORAGE_DRIVER ?? "local",
    endpointHost: diagnostics.endpointHost,
    bucket: diagnostics.bucket,
    objectKey: diagnostics.objectKey,
    contentType: diagnostics.contentType,
    fileSize: diagnostics.fileSize,
  })
}

function requireEnv(name: string): string {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`Missing required MinIO environment variable: ${name}`)
  return value
}

function normalizeEndpoint(rawEndpoint: string): { endpoint: string; endpointHost: string } {
  const withProtocol = /^https?:\/\//i.test(rawEndpoint)
    ? rawEndpoint
    : /^(localhost|127\.0\.0\.1|0\.0\.0\.0)(:|$)/i.test(rawEndpoint)
      ? `http://${rawEndpoint}`
      : `https://${rawEndpoint}`

  const parsed = new URL(withProtocol)
  return {
    endpoint: parsed.toString().replace(/\/+$/, ""),
    endpointHost: parsed.host,
  }
}

function readMinioConfig(): MinioConfig {
  const rawEndpoint = requireEnv("MINIO_ENDPOINT")
  const { endpoint, endpointHost } = normalizeEndpoint(rawEndpoint)
  const accessKeyId = requireEnv("MINIO_ACCESS_KEY")
  const secretAccessKey = requireEnv("MINIO_SECRET_KEY")
  const bucket = requireEnv("MINIO_BUCKET")
  const rawPublicBaseUrl = requireEnv("MINIO_PUBLIC_BASE_URL")
  const publicBaseUrl = new URL(rawPublicBaseUrl).toString().replace(/\/+$/, "")

  return {
    endpoint,
    endpointHost,
    region: process.env.MINIO_REGION?.trim() || "us-east-1",
    bucket,
    publicBaseUrl,
    accessKeyId,
    secretAccessKey,
    forcePathStyle: process.env.MINIO_FORCE_PATH_STYLE !== "false",
  }
}

function getMinioClient(config: MinioConfig): S3Client {
  return new S3Client({
    region: config.region,
    endpoint: config.endpoint,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    forcePathStyle: config.forcePathStyle,
    requestChecksumCalculation: "WHEN_REQUIRED",
  })
}

function getPublicBaseUrl(): string {
  return readMinioConfig().publicBaseUrl
}

function assertSafeObjectKey(value: string): string {
  if (value.includes("\\")) throw new Error("مسیر ذخیره‌سازی نامعتبر است.")
  const normalized = value.replace(/^\/+/, "")
  const parts = normalized.split("/")
  if (!normalized || parts.some((part) => !part || part === "." || part === "..")) {
    throw new Error("مسیر ذخیره‌سازی نامعتبر است.")
  }
  return normalized
}

function createUniqueName(extension: SafeImageExtension | SafeDocumentExtension, preferredBaseName?: string, fallbackBaseName = "file"): string {
  const safeBaseName = preferredBaseName ? toSafePathSegment(preferredBaseName.replace(/\.[^.]+$/, ""), fallbackBaseName) : fallbackBaseName
  return `${safeBaseName}-${crypto.randomUUID()}.${extension}`
}

export function getPublicMinioMediaUrl(objectKey: string): string {
  return `${getPublicBaseUrl()}/${assertSafeObjectKey(objectKey)}`
}

export function objectKeyFromMinioPublicUrl(value: string | null | undefined): string | null {
  if (!value?.trim()) return null
  const trimmed = value.trim()

  try {
    const publicBaseUrl = getPublicBaseUrl()
    const candidate = new URL(trimmed)
    const base = new URL(publicBaseUrl)
    if (candidate.origin !== base.origin) return null

    const basePath = base.pathname.replace(/\/+$/, "")
    const candidatePath = candidate.pathname
    if (candidatePath === basePath) return null
    if (!candidatePath.startsWith(`${basePath}/`)) return null

    return assertSafeObjectKey(decodeURIComponent(candidatePath.slice(basePath.length + 1)))
  } catch {
    return null
  }
}

export function isMinioManagedMediaUrl(value: string | null | undefined): boolean {
  return objectKeyFromMinioPublicUrl(value) !== null
}

async function deleteMinioObjectIfExists(objectKey: string): Promise<void> {
  const config = readMinioConfig()
  const safeObjectKey = assertSafeObjectKey(objectKey)
  await getMinioClient(config).send(
    new DeleteObjectCommand({
      Bucket: config.bucket,
      Key: safeObjectKey,
    })
  )
}

export async function uploadMinioMedia(file: File, options: UploadMinioMediaOptions): Promise<{ publicUrl: string; objectKey: string }> {
  assertSafeImageFile(file)
  const buffer = Buffer.from(await file.arrayBuffer())
  assertSafeImageSignature(buffer, file.type)

  const extension = getSafeImageExtension(file)
  const folder = assertSafeObjectKey(options.folder)
  const fixedBaseName = options.fixedFileName?.replace(/\.[^.]+$/, "")
  const fileName = fixedBaseName
    ? `${toSafePathSegment(fixedBaseName, "image")}.${extension}`
    : createUniqueName(extension, options.preferredBaseName, "image")
  const objectKey = assertSafeObjectKey(`${folder}/${fileName}`)
  let config: MinioConfig | null = null

  try {
    config = readMinioConfig()
    await getMinioClient(config).send(
      new PutObjectCommand({
        Bucket: config.bucket,
        Key: objectKey,
        Body: buffer,
        ContentLength: buffer.byteLength,
        ContentType: file.type,
      })
    )

    if (fixedBaseName) {
      const safeBaseName = toSafePathSegment(fixedBaseName, "image")
      await Promise.all(
        (["jpg", "png", "webp"] as const)
          .map((oldExtension) => assertSafeObjectKey(`${folder}/${safeBaseName}.${oldExtension}`))
          .filter((siblingKey) => siblingKey !== objectKey)
          .map((siblingKey) => deleteMinioObjectIfExists(siblingKey).catch((error) => {
            logMinioFailure("delete-stale-sibling-after-fixed-name-upload", error, {
              storageDriver: process.env.MEDIA_STORAGE_DRIVER,
              endpointHost: config?.endpointHost,
              bucket: config?.bucket,
              objectKey: siblingKey,
            })
            return undefined
          }))
      )
    }

    return { publicUrl: `${config.publicBaseUrl}/${objectKey}`, objectKey }
  } catch (error) {
    logMinioFailure("upload", error, {
      storageDriver: process.env.MEDIA_STORAGE_DRIVER,
      endpointHost: config?.endpointHost,
      bucket: config?.bucket ?? process.env.MINIO_BUCKET?.trim(),
      objectKey,
      contentType: file.type,
      fileSize: file.size,
    })
    throw new Error(UPLOAD_ERROR_MESSAGE)
  }
}

export async function uploadMinioProductDocument(file: File, options: UploadMinioMediaOptions): Promise<{ publicUrl: string; objectKey: string }> {
  assertSafeProductDocumentFile(file)
  const buffer = Buffer.from(await file.arrayBuffer())
  assertSafePdfSignature(buffer)

  const extension = getSafeProductDocumentExtension(file)
  const folder = assertSafeObjectKey(options.folder)
  const fixedBaseName = options.fixedFileName?.replace(/\.[^.]+$/, "")
  const fileName = fixedBaseName
    ? `${toSafePathSegment(fixedBaseName, "document")}.${extension}`
    : createUniqueName(extension, options.preferredBaseName, "document")
  const objectKey = assertSafeObjectKey(`${folder}/${fileName}`)
  let config: MinioConfig | null = null

  try {
    config = readMinioConfig()
    await getMinioClient(config).send(
      new PutObjectCommand({
        Bucket: config.bucket,
        Key: objectKey,
        Body: buffer,
        ContentLength: buffer.byteLength,
        ContentType: "application/pdf",
      })
    )

    if (fixedBaseName) {
      const safeBaseName = toSafePathSegment(fixedBaseName, "document")
      const siblingKey = assertSafeObjectKey(`${folder}/${safeBaseName}.pdf`)
      if (siblingKey !== objectKey) {
        await deleteMinioObjectIfExists(siblingKey).catch((error) => {
          logMinioFailure("delete-stale-product-document-after-fixed-name-upload", error, {
            storageDriver: process.env.MEDIA_STORAGE_DRIVER,
            endpointHost: config?.endpointHost,
            bucket: config?.bucket,
            objectKey: siblingKey,
          })
          return undefined
        })
      }
    }

    return { publicUrl: `${config.publicBaseUrl}/${objectKey}`, objectKey }
  } catch (error) {
    logMinioFailure("upload-product-document", error, {
      storageDriver: process.env.MEDIA_STORAGE_DRIVER,
      endpointHost: config?.endpointHost,
      bucket: config?.bucket ?? process.env.MINIO_BUCKET?.trim(),
      objectKey,
      contentType: "application/pdf",
      fileSize: file.size,
    })
    throw new Error("ذخیره‌سازی فایل PDF با خطا مواجه شد. لطفاً دوباره تلاش کنید.")
  }
}

export async function deleteMinioMediaByPublicUrl(value: string | null | undefined): Promise<boolean> {
  const objectKey = objectKeyFromMinioPublicUrl(value)
  if (!objectKey) return false

  let config: MinioConfig | null = null
  try {
    config = readMinioConfig()
    await getMinioClient(config).send(
      new DeleteObjectCommand({
        Bucket: config.bucket,
        Key: objectKey,
      })
    )
    return true
  } catch (error) {
    logMinioFailure("delete", error, {
      storageDriver: process.env.MEDIA_STORAGE_DRIVER,
      endpointHost: config?.endpointHost,
      bucket: config?.bucket ?? process.env.MINIO_BUCKET?.trim(),
      objectKey,
    })
    return false
  }
}
