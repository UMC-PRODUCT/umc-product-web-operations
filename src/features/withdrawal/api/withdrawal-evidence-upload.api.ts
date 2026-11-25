import { uploadStorageFiles } from "@/shared/api/storage.api"

const WITHDRAWAL_EVIDENCE_STORAGE_CATEGORY =
  "CHALLENGER_DEACTIVATION_EVIDENCE" as const

export async function uploadWithdrawalEvidenceImages(
  files: File[],
): Promise<string[]> {
  if (files.length === 0) {
    return []
  }
  return uploadStorageFiles(files, WITHDRAWAL_EVIDENCE_STORAGE_CATEGORY)
}
