import { uploadStorageFile, uploadStorageFiles } from "@/shared/api/storage.api"

const NOTICE_IMAGE_STORAGE_CATEGORY = "NOTICE_ATTACHMENT" as const

/** 공지 이미지 — STORAGE-001/002 후 NOTICE-101/104에 전달할 fileId */
export async function uploadNoticeImageFile(file: File): Promise<string> {
  return uploadStorageFile(file, NOTICE_IMAGE_STORAGE_CATEGORY)
}

export async function uploadNoticeImageFiles(files: File[]): Promise<string[]> {
  return uploadStorageFiles(files, NOTICE_IMAGE_STORAGE_CATEGORY)
}
