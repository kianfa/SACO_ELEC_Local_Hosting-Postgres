import "server-only"

import { deleteLocalMediaByPublicUrl, publicUrlFromRelativePath, relativePathFromLocalPublicUrl, uploadLocalMedia, uploadLocalProductDocument } from "@/lib/storage/local-media-storage"
import {
  deleteMinioMediaByPublicUrl,
  getPublicMinioMediaUrl,
  isMinioManagedMediaUrl,
  objectKeyFromMinioPublicUrl,
  uploadMinioMedia,
  uploadMinioProductDocument,
} from "@/lib/storage/minio-media-storage"

export type UploadMediaOptions = {
  folder: string
  preferredBaseName?: string
  fixedFileName?: string
}

export type UploadedMedia = {
  publicUrl: string
  storagePath: string
}

export function mediaStorageDriver(): "minio" | "local" {
  return process.env.MEDIA_STORAGE_DRIVER === "minio" ? "minio" : "local"
}

export async function uploadMedia(file: File, options: UploadMediaOptions): Promise<UploadedMedia> {
  if (mediaStorageDriver() === "minio") {
    const uploaded = await uploadMinioMedia(file, options)
    return { publicUrl: uploaded.publicUrl, storagePath: uploaded.objectKey }
  }

  const uploaded = await uploadLocalMedia(file, options)
  return { publicUrl: uploaded.publicUrl, storagePath: uploaded.relativePath }
}

export async function uploadProductDocumentMedia(file: File, options: UploadMediaOptions): Promise<UploadedMedia> {
  if (mediaStorageDriver() === "minio") {
    const uploaded = await uploadMinioProductDocument(file, options)
    return { publicUrl: uploaded.publicUrl, storagePath: uploaded.objectKey }
  }

  const uploaded = await uploadLocalProductDocument(file, options)
  return { publicUrl: uploaded.publicUrl, storagePath: uploaded.relativePath }
}

export async function deleteMediaByPublicUrl(value: string | null | undefined): Promise<boolean> {
  if (mediaStorageDriver() === "minio") return deleteMinioMediaByPublicUrl(value)
  return deleteLocalMediaByPublicUrl(value)
}

export function getPublicMediaUrl(storagePath: string): string {
  if (mediaStorageDriver() === "minio") return getPublicMinioMediaUrl(storagePath)
  return publicUrlFromRelativePath(storagePath)
}

export function storagePathFromPublicUrl(value: string | null | undefined): string | null {
  return objectKeyFromMinioPublicUrl(value) ?? relativePathFromLocalPublicUrl(value)
}

export function isManagedMediaUrl(value: string | null | undefined): boolean {
  if (mediaStorageDriver() === "minio") return isMinioManagedMediaUrl(value)
  return relativePathFromLocalPublicUrl(value) !== null
}
