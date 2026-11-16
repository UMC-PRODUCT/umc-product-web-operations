import { CheckCircleIcon } from "@umc-product/icons"

import { getAwardErrorMessage } from "./award-points-model"

import type { PointAwardTab } from "../../model/point-types"
import type { AwardError } from "./award-points-model"

type AwardErrorBannerProps = {
  error: AwardError
  tab: PointAwardTab
}

export function AwardErrorBanner({ error, tab }: AwardErrorBannerProps) {
  return (
    <div
      className="flex min-h-11 w-full items-center gap-(--umc-spacing-gap-8) rounded-(--umc-radius-14) bg-[var(--umc-toast-error-bg,#fed7d7)] py-(--umc-spacing-padding-12) pr-(--umc-spacing-padding-16) pl-[14px] shadow-[0_4px_16px_rgba(64,68,67,0.16)]"
      role="alert"
    >
      <CheckCircleIcon
        aria-hidden
        className="shrink-0 text-[var(--umc-color-icon-error,#dc3d3d)]"
        size={24}
        weight="fill"
      />
      <p className="text-label-3-medium min-w-0 flex-1 text-[var(--umc-color-red-700,#a60303)]">
        {getAwardErrorMessage(error, tab)}
      </p>
    </div>
  )
}
