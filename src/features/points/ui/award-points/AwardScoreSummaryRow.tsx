import { ChevronRightIcon } from "@umc-product/icons"
import { TextButton } from "@umc-product/react"

import { cn } from "@/shared/lib/cn"

import { formatAwardScoreLabel } from "../../model/point-types"
import { AwardInfoRow } from "./AwardInfoRow"

type AwardScoreSummaryRowProps = {
  score: number | null
  onGoToOtherTab: () => void
}

/** 상점·벌점 탭: 선택한 유형의 점수 요약 */
export function AwardScoreSummaryRow({
  score,
  onGoToOtherTab,
}: AwardScoreSummaryRowProps) {
  return (
    <AwardInfoRow label="점수">
      <div className="flex min-w-0 flex-1 items-center justify-between gap-(--umc-spacing-gap-12)">
        <span
          className={cn(
            "text-body-1-semibold",
            score === null
              ? "text-neutral-medium-600"
              : score < 0
                ? "text-error"
                : "text-brand-default-600",
          )}
        >
          {score === null ? "0점" : formatAwardScoreLabel(score)}
        </span>
        <TextButton
          color="neutral"
          onClick={onGoToOtherTab}
          size="xs"
          trailingIcon={
            <ChevronRightIcon aria-hidden color="currentColor" size={16} />
          }
          type="button"
        >
          직접 정하려면 기타 탭
        </TextButton>
      </div>
    </AwardInfoRow>
  )
}
