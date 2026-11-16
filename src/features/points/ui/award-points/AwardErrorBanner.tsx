import { InlineAlert } from "@/shared/ui/inline-alert"

import { getAwardErrorMessage } from "./award-points-model"

import type { PointAwardTab } from "../../model/point-types"
import type { AwardError } from "./award-points-model"

type AwardErrorBannerProps = {
  error: AwardError
  tab: PointAwardTab
}

export function AwardErrorBanner({ error, tab }: AwardErrorBannerProps) {
  return (
    <InlineAlert tone="error">{getAwardErrorMessage(error, tab)}</InlineAlert>
  )
}
