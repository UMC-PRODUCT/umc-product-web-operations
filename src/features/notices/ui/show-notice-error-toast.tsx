import { WarningIcon } from "@umc-product/icons"

import { showErrorBottomToast } from "@/shared/ui/show-error-bottom-toast"

import {
  NOTICE_CREATE_PUBLISH_FAILURE_RETRY_LABEL,
  NOTICE_CREATE_PUBLISH_FAILURE_TOAST_MESSAGE,
  NOTICE_CREATE_PUBLISH_FAILURE_TOAST_WIDTH,
} from "../model/notice-outcomes"

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

/** Figma 2704:48597 — 게시 실패 (목록 화면, 텍스트 버튼 5~8초) */
export function showNoticeCreatePublishFailureToast(
  toast: ToastApi,
  onRetry: () => void,
  message: string = NOTICE_CREATE_PUBLISH_FAILURE_TOAST_MESSAGE,
): void {
  toast.show({
    action: {
      label: NOTICE_CREATE_PUBLISH_FAILURE_RETRY_LABEL,
      onClick: onRetry,
    },
    color: "error",
    duration: 6000,
    icon: <WarningIcon aria-hidden size={24} weight="fill" />,
    message,
    width: NOTICE_CREATE_PUBLISH_FAILURE_TOAST_WIDTH,
  })
}
