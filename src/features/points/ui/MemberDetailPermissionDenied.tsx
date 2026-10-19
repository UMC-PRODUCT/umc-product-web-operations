import { EyeInvisibleIcon } from "@umc-product/icons"
import { Button } from "@umc-product/react"

type MemberDetailPermissionDeniedProps = {
  onGoToList?: () => void
}

export function MemberDetailPermissionDenied({
  onGoToList,
}: MemberDetailPermissionDeniedProps) {
  return (
    <div
      className="flex w-full flex-col items-center gap-(--umc-spacing-gap-16) pt-[80px] pr-(--umc-spacing-padding-20) pb-[40px]"
      role="status"
    >
      <EyeInvisibleIcon aria-hidden className="text-icon-disabled" size={48} />
      <div className="flex w-full flex-col items-center gap-(--umc-spacing-gap-8) text-center">
        <p className="text-title-4-semibold text-neutral-default-900 w-full">
          이 구성원은 볼 수 없어요
        </p>
        <p className="text-body-3-regular text-neutral-medium-600 w-full">
          본인 학교의 구성원만 조회할 수 있어요
        </p>
      </div>
      <Button
        color="white"
        onClick={onGoToList}
        size="xs"
        type="button"
        variant="fill"
      >
        구성원 목록으로
      </Button>
    </div>
  )
}
