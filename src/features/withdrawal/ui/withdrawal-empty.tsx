import { WarningIcon } from "@umc-product/icons"

import { EmptyState } from "@/shared/ui/empty-state"

/** 필터 없이 전체 조회했을 때 탈부 기록이 없는 상태 */
export function WithdrawalEmpty() {
  return (
    <EmptyState
      icon={
        <WarningIcon
          aria-hidden
          className="text-icon-disabled"
          size={48}
          weight="fill"
        />
      }
      title="아직 등록된 탈부 기록이 없어요"
    />
  )
}
