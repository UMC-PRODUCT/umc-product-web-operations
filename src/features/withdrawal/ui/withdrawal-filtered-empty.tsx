import { ResetIcon, WarningIcon } from "@umc-product/icons"
import { Button } from "@umc-product/react"

import { EmptyState } from "@/shared/ui/empty-state"

type WithdrawalFilteredEmptyProps = {
  onResetFilters?: () => void
}

/** 필터·검색 적용 후 결과가 없을 때 */
export function WithdrawalFilteredEmpty({
  onResetFilters,
}: WithdrawalFilteredEmptyProps) {
  return (
    <EmptyState
      action={
        <Button
          color="white"
          leadingIcon={
            <ResetIcon
              aria-hidden
              className="text-icon-neutral-medium-500"
              size={14}
            />
          }
          onClick={onResetFilters}
          size="xs"
          type="button"
          variant="fill"
        >
          필터 초기화
        </Button>
      }
      description="필터를 바꾸거나 초기화해 보세요"
      icon={
        <WarningIcon
          aria-hidden
          className="text-icon-disabled"
          size={48}
          weight="fill"
        />
      }
      title="조건에 맞는 구성원이 없어요"
    />
  )
}
