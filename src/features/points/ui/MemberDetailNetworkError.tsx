import { ResetIcon } from "@umc-product/icons"
import { Button } from "@umc-product/react"

import { FullPageError } from "@/shared/ui/full-page-error"

type MemberDetailNetworkErrorProps = {
  onRetry?: () => void
}

export function MemberDetailNetworkError({
  onRetry,
}: MemberDetailNetworkErrorProps) {
  return (
    <FullPageError
      actions={
        <Button
          color="white"
          leadingIcon={
            <ResetIcon
              aria-hidden
              className="text-icon-neutral-medium-500"
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
      body="네트워크 상태를 확인하거나 잠시 후 다시 시도해 주세요"
      placement="content"
      title="구성원 정보를 불러오지 못했어요"
    />
  )
}
