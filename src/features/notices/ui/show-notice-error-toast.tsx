import { WarningIcon } from "@umc-product/icons"

import type { ToastApi } from "@umc-product/react"

/** Figma 516:12555 — 하단 error Toast, 아이콘은 이미지 불러오기 실패(525:7982)와 동일 Warning */
export function showNoticeErrorToast(toast: ToastApi, message: string): void {
  toast.show({
    message,
    color: "error",
    icon: <WarningIcon aria-hidden size={24} weight="fill" />,
  })
}

/** Figma 1288:32869 — Toast Bottom `warning`(neutral dark bg, warning icon) */
export function showNoticeWarningToast(toast: ToastApi, message: string): void {
  toast.show({
    message,
    color: "warning",
    icon: <WarningIcon aria-hidden size={24} weight="fill" />,
  })
}
