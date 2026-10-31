/** STORAGE-001 — PrepareUploadRequest.category */
export type StorageFileCategory =
  | "PROFILE_IMAGE"
  | "POST_IMAGE"
  | "POST_ATTACHMENT"
  | "NOTICE_ATTACHMENT"
  | "WORKBOOK_SUBMISSION"
  | "SCHOOL_LOGO"
  | "PORTFOLIO"
  | "CERTIFICATE"
  | "PROJECT_THUMBNAIL"
  | "PROJECT_LOGO"
  | "UMC_PRODUCT_PROFILE_IMAGE"
  | "ETC"

/** STORAGE-001 */
export type PrepareStorageUploadRequest = {
  category: StorageFileCategory
  contentType: string
  fileName: string
  fileSize: number
}

/** STORAGE-001 — PrepareUploadResponse */
export type PrepareStorageUploadResponse = {
  expiresAt?: string
  fileId: string
  headers?: Record<string, string>
  uploadMethod: string
  uploadUrl: string
}
