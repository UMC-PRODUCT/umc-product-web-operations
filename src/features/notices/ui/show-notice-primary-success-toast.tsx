import { showPrimarySuccessToast } from "@/shared/ui/show-primary-success-toast"

import type { ToastApi } from "@umc-product/react"

/** Figma Toast Bottom brand — 등록·삭제 성공·이미지 등록 성공 공통 */
export function showNoticePrimarySuccessToast(
  toast: ToastApi,
  message: string,
): void {
  showPrimarySuccessToast(toast, message)
}
