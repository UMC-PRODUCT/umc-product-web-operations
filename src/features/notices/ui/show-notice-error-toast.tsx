import { showErrorBottomToast } from "@/shared/ui/show-error-bottom-toast"

import type { ToastApi } from "@umc-product/react"

/** Figma 598:9622 — 이미지 업로드 실패 */
export function showNoticeImageUploadFailureToast(
  toast: ToastApi,
  message: string,
): void {
  showErrorBottomToast(toast, message)
}

/** Figma 598:9538 — 작성 권한 없음(403) */
export function showNoticeCreateForbiddenToast(
  toast: ToastApi,
  message: string,
): void {
  showErrorBottomToast(toast, message)
}

/** Figma 1221:17756 — 공지 수정 실패 */
export function showNoticeEditFailureToast(
  toast: ToastApi,
  message: string,
): void {
  showErrorBottomToast(toast, message)
}

/** Figma 516:12555 — 하단 error Toast (삭제 실패 등) */
export function showNoticeErrorToast(toast: ToastApi, message: string): void {
  showErrorBottomToast(toast, message)
}
