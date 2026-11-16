import { ResetIcon, WarningIcon } from "@umc-product/icons"
import { Button } from "@umc-product/react"

import { EmptyState } from "@/shared/ui/empty-state"

type NoticeListNetworkErrorProps = {
  onRetry?: () => void
}

export function NoticeListNetworkError({
  onRetry,
}: NoticeListNetworkErrorProps) {
  return (
    <EmptyState
      action={
        <Button
          color="white"
          leadingIcon={
            <ResetIcon
              aria-hidden
              className="text-icon-neutral-medium-500 scale-x-[-1]"
              size={14}
            />
          }
          onClick={onRetry}
          size="xs"
          type="button"
          variant="fill"
        >
          다시 시도
        </Button>
      }
      description="네트워크 상태를 확인하거나 잠시 후 다시 시도해 주세요"
      icon={
        <WarningIcon
          aria-hidden
          className="text-icon-disabled"
          size={48}
          weight="fill"
        />
      }
      role="alert"
      title="공지를 불러오지 못했어요"
    />
  )
}
