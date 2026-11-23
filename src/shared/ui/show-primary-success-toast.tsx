import { CheckCircleIcon } from "@umc-product/icons"

import type { ToastApi } from "@umc-product/react"

/** Figma Toast Bottom brand — 등록·삭제 성공 등 공통 */
export function showPrimarySuccessToast(
  toast: ToastApi,
  message: string,
): void {
  toast.show({
    message,
    color: "brand",
    icon: <CheckCircleIcon aria-hidden size={24} weight="fill" />,
  })
}
