import { WarningIcon } from "@umc-product/icons"

import type { ToastApi } from "@umc-product/react"

/** Figma Toast Bottom error — 연한 error 배경, red-700 문구, Warning 24px, 닫기 */
export function showErrorBottomToast(toast: ToastApi, message: string): void {
  toast.show({
    message,
    color: "error",
    icon: <WarningIcon aria-hidden size={24} weight="fill" />,
  })
}
