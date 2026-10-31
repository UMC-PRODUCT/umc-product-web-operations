import { WarningIcon } from "@umc-product/icons"

import type { ToastApi } from "@umc-product/react"

/** Figma Toast Bottom error — 연한 error 배경, red-700 문구, Warning 24px, 닫기 */
function showNoticeErrorBottomToast(toast: ToastApi, message: string): void {
  toast.show({
    message,
    color: "error",
    icon: <WarningIcon aria-hidden size={24} weight="fill" />,
  })
}

/** Figma 598:9622 — 이미지 업로드 실패 */
export function showNoticeImageUploadFailureToast(
  toast: ToastApi,
  message: string,
): void {
  showNoticeErrorBottomToast(toast, message)
}

/** Figma 598:9538 — 작성 권한 없음(403) */
export function showNoticeCreateForbiddenToast(
  toast: ToastApi,
  message: string,
): void {
  showNoticeErrorBottomToast(toast, message)
}

/** Figma 1221:17756 — 공지 수정 실패 */
export function showNoticeEditFailureToast(
  toast: ToastApi,
  message: string,
): void {
  showNoticeErrorBottomToast(toast, message)
}

/** Figma 516:12555 — 하단 error Toast (삭제 실패 등) */
export function showNoticeErrorToast(toast: ToastApi, message: string): void {
  showNoticeErrorBottomToast(toast, message)
}
