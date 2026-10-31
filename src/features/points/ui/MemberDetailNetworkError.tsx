import { ResetIcon, WarningIcon } from "@umc-product/icons"
import { Button } from "@umc-product/react"

type MemberDetailNetworkErrorProps = {
  onRetry?: () => void
}

export function MemberDetailNetworkError({
  onRetry,
}: MemberDetailNetworkErrorProps) {
  return (
    <div
      className="flex w-full flex-col items-center gap-(--umc-spacing-gap-16) pt-[80px] pr-(--umc-spacing-padding-20) pb-[40px]"
      role="alert"
    >
      <WarningIcon
        aria-hidden
        className="text-icon-disabled"
        size={48}
        weight="fill"
      />
      <div className="flex w-full flex-col items-center gap-(--umc-spacing-gap-8) text-center">
        <p className="text-title-4-semibold text-neutral-default-900 w-full">
          구성원 정보를 불러오지 못했어요
        </p>
        <p className="text-body-3-regular text-neutral-medium-600 w-full">
          네트워크 상태를 확인하거나 잠시 후 다시 시도해 주세요
        </p>
      </div>
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
    </div>
  )
}
