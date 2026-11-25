import type { SubmitNoticeCreateProgress } from "./submit-notice-create"

const STORAGE_KEY = "notice-create-publish-progress"

export function readNoticeCreatePublishProgress(): SubmitNoticeCreateProgress | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (raw == null) {
      return null
    }
    return JSON.parse(raw) as SubmitNoticeCreateProgress
  } catch {
    return null
  }
}

export function writeNoticeCreatePublishProgress(
  progress: SubmitNoticeCreateProgress | null,
): void {
  if (progress == null) {
    sessionStorage.removeItem(STORAGE_KEY)
    return
  }
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
}
