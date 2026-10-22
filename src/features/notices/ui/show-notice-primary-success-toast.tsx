import { CheckCircleIcon } from "@umc-product/icons"

import type { ToastApi } from "@umc-product/react"

/** Figma Toast Bottom primary — 등록·삭제 성공·이미지 등록 성공 공통 */
export function showNoticePrimarySuccessToast(
  toast: ToastApi,
  message: string,
): void {
  toast.show({
    message,
    color: "primary",
    icon: <CheckCircleIcon aria-hidden size={24} weight="fill" />,
  })
}
