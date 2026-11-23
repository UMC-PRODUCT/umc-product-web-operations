import { showErrorBottomToast } from "@/shared/ui/show-error-bottom-toast"

import type { ToastApi } from "@umc-product/react"

/** Toast Bottom error */
export const WITHDRAWAL_REGISTER_FAILURE_TOAST_MESSAGE =
  "탈부 등록을 하지 못했어요. 입력한 내용은 그대로 있어요" as const

/** 탈부 등록 API 실패 시. 입력 폼은 유지 */
export function showWithdrawalRegisterFailureToast(toast: ToastApi): void {
  showErrorBottomToast(toast, WITHDRAWAL_REGISTER_FAILURE_TOAST_MESSAGE)
}
