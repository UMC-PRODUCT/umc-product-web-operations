import { EyeInvisibleIcon } from "@umc-product/icons"

export function NoticeListForbidden() {
  return (
    <div
      className="flex w-full flex-col items-center gap-(--umc-spacing-gap-16) py-[40px] pr-(--umc-spacing-padding-20)"
      role="status"
    >
      <EyeInvisibleIcon aria-hidden className="text-icon-disabled" size={48} />
      <div className="flex w-full flex-col items-center gap-(--umc-spacing-gap-8) text-center">
        <p className="text-title-4-semibold text-neutral-strong-800 w-full">
          볼 수 없는 공지예요
        </p>
        <p className="text-body-3-regular text-neutral-medium-600 w-full">
          다른 범위를 선택하거나 대상 설정을 확인해 보세요
        </p>
      </div>
    </div>
  )
}
