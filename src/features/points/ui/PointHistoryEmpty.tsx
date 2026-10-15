import { SearchIcon } from "@umc-product/icons"

export function PointHistoryEmpty() {
  return (
    <div
      className="flex w-full flex-col items-center gap-(--umc-spacing-gap-16) py-[40px] pr-(--umc-spacing-padding-20)"
      role="status"
    >
      <SearchIcon aria-hidden className="text-icon-disabled" size={44} />
      <div className="flex w-full flex-col items-center gap-(--umc-spacing-gap-6) text-center">
        <p className="text-title-4-semibold text-neutral-strong-800 w-full">
          아직 상벌점 이력이 없어요
        </p>
        <p className="text-body-3-regular text-neutral-medium-600 w-full">
          오른쪽 상단 버튼을 눌러 상점이나 벌점을 부여할 수 있어요
        </p>
      </div>
    </div>
  )
}
