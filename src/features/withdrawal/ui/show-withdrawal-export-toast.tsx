import { CheckCircleIcon, WarningIcon } from "@umc-product/icons"

import type { ToastApi } from "@umc-product/react"

/** Figma 2547:49103 — 탈부 CSV 내보내기 성공 */
export function showWithdrawalExportSuccessToast(
  toast: ToastApi,
  count: number,
): void {
  toast.show({
    message: `탈부 기록 ${count}건을 CSV로 내려받았어요`,
    color: "brand",
    icon: <CheckCircleIcon aria-hidden size={24} weight="fill" />,
  })
}

/** Figma 2547:49812 — 탈부 CSV 내보내기 실패 */
export function showWithdrawalExportFailureToast(toast: ToastApi): void {
  toast.show({
    message: "CSV 파일을 만들지 못했어요. 잠시 후 다시 시도해 주세요",
    color: "error",
    icon: <WarningIcon aria-hidden size={24} weight="fill" />,
  })
}
