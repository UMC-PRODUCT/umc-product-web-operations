import { EyeInvisibleIcon } from "@umc-product/icons"

export function MemberPermissionDenied() {
  return (
    <div
      className="flex w-full flex-col items-center gap-(--umc-spacing-gap-16) py-[40px] pr-(--umc-spacing-padding-20)"
      role="status"
    >
      <EyeInvisibleIcon aria-hidden className="text-icon-disabled" size={48} />
      <div className="flex w-full flex-col items-center gap-(--umc-spacing-gap-8) text-center">
        <p className="text-title-4-semibold text-neutral-strong-800 w-full">
          내 학교 구성원만 볼 수 있어요
        </p>
        <p className="text-body-3-regular text-neutral-medium-600 w-full">
          다른 학교의 구성원 정보는 조회할 수 없어요
        </p>
      </div>
    </div>
  )
}
