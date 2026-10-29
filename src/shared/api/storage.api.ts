import { api } from "@/shared/api/client"
import { unwrapApiResult } from "@/shared/api/unwrap-api-result"

import type {
  PrepareStorageUploadRequest,
  PrepareStorageUploadResponse,
  StorageFileCategory,
} from "./storage-api.types"

/** STORAGE-001 — Signed URL 발급 */
export async function prepareStorageUpload(
  body: PrepareStorageUploadRequest,
): Promise<PrepareStorageUploadResponse> {
  const { data } = await api.post<unknown>("/v1/storage/prepare-upload", body)
  return unwrapApiResult<PrepareStorageUploadResponse>(data)
}

async function uploadToSignedUrl(
  prepared: PrepareStorageUploadResponse,
  file: File,
): Promise<void> {
  const method = prepared.uploadMethod.toUpperCase()
  const headers = new Headers(prepared.headers ?? {})

  if (!headers.has("Content-Type") && file.type) {
    headers.set("Content-Type", file.type)
  }

  const response = await fetch(prepared.uploadUrl, {
    method,
    body: file,
    headers,
  })

  if (!response.ok) {
    throw new Error(`Signed URL upload failed with status ${response.status}.`)
  }
}

/** STORAGE-002 — 업로드 완료 등록 */
export async function confirmStorageUpload(fileId: string): Promise<void> {
  const { data } = await api.post<unknown>(`/v1/storage/${fileId}/confirm`, {})
  if (data !== null && data !== undefined && data !== "") {
    unwrapApiResult<unknown>(data)
  }
}

/** STORAGE-003 — 파일 삭제 */
export async function deleteStorageFile(fileId: string): Promise<void> {
  const { data } = await api.delete<unknown>(`/v1/storage/${fileId}`)
  if (data !== null && data !== undefined && data !== "") {
    unwrapApiResult<unknown>(data)
  }
}

/** STORAGE-001 → Signed URL 업로드 → STORAGE-002 */
export async function uploadStorageFile(
  file: File,
  category: StorageFileCategory,
): Promise<string> {
  const prepared = await prepareStorageUpload({
    category,
    contentType: file.type || "application/octet-stream",
    fileName: file.name,
    fileSize: file.size,
  })

  await uploadToSignedUrl(prepared, file)
  await confirmStorageUpload(prepared.fileId)

  return prepared.fileId
}

export async function uploadStorageFiles(
  files: File[],
  category: StorageFileCategory,
): Promise<string[]> {
  const fileIds: string[] = []
  for (const file of files) {
    fileIds.push(await uploadStorageFile(file, category))
  }
  return fileIds
}
