import { cn } from "@/shared/lib/cn"

const SKELETON_ROW_COUNT = 4

const HEADER_COLUMNS = [
  {
    label: "구성원",
    className: "w-[240px] shrink-0 px-(--umc-spacing-padding-24)",
  },
  {
    label: "학교",
    className: "w-[160px] shrink-0 px-(--umc-spacing-padding-20)",
  },
  {
    label: "파트",
    className:
      "w-[140px] shrink-0 pl-(--umc-spacing-padding-20) pr-(--umc-spacing-padding-16)",
  },
  {
    label: "기수",
    className:
      "w-[120px] shrink-0 pl-(--umc-spacing-padding-20) pr-(--umc-spacing-padding-16)",
  },
  {
    label: "운영 역할",
    className:
      "w-[150px] shrink-0 pl-(--umc-spacing-padding-20) pr-(--umc-spacing-padding-24)",
  },
  {
    label: "상태",
    className:
      "w-[140px] shrink-0 pl-(--umc-spacing-padding-20) pr-(--umc-spacing-padding-16)",
  },
] as const

function Bone({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "bg-fill-neutral-disabled rounded-(--umc-radius-6)",
        className,
      )}
    />
  )
}

function SkeletonRow({ isLast }: { isLast: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center px-(--umc-spacing-padding-10) py-(--umc-spacing-padding-16)",
        isLast && "rounded-b-(--umc-radius-12)",
      )}
      role="row"
    >
      <div className="flex w-[240px] shrink-0 items-center gap-(--umc-spacing-gap-10) px-(--umc-spacing-padding-20)">
        <Bone className="h-[25px] w-6 shrink-0 rounded-full" />
        <Bone className="h-[23px] min-w-0 flex-1" />
      </div>
      <div className="flex w-[160px] shrink-0 items-center px-(--umc-spacing-padding-20)">
        <Bone className="h-[23px] min-w-0 flex-1" />
      </div>
      <div className="flex w-[140px] shrink-0 items-center pr-(--umc-spacing-padding-16) pl-(--umc-spacing-padding-20)">
        <Bone className="h-[22px] w-[60px] shrink-0" />
      </div>
      <div className="flex w-[120px] shrink-0 items-center pr-(--umc-spacing-padding-16) pl-(--umc-spacing-padding-20)">
        <Bone className="h-[23px] w-[60px] shrink-0" />
      </div>
      <div className="flex w-[150px] shrink-0 items-center pr-(--umc-spacing-padding-16) pl-(--umc-spacing-padding-20)">
        <Bone className="h-[22px] w-[67px] shrink-0" />
      </div>
      <div className="flex w-[140px] shrink-0 items-center pr-(--umc-spacing-padding-16) pl-[22px]">
        <Bone className="h-[24px] w-[60px] shrink-0" />
      </div>
      <div className="flex shrink-0 flex-col items-start pr-(--umc-spacing-padding-16) pl-(--umc-spacing-padding-20)">
        <Bone className="h-[22px] w-[120px] shrink-0" />
      </div>
    </div>
  )
}

export function MemberTableSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="구성원 목록 불러오는 중"
      className="w-full [scrollbar-width:none] overflow-x-auto rounded-(--umc-radius-12) [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      role="status"
    >
      <div className="min-w-[1158px]">
        <div
          className="bg-fill-primary-medium-100 text-body-3-medium text-neutral-default-900 flex items-center rounded-t-(--umc-radius-12) px-(--umc-spacing-padding-10) py-(--umc-spacing-padding-6)"
          role="row"
        >
          <div className="flex h-7 items-center">
            {HEADER_COLUMNS.map((column) => (
              <div
                className={column.className}
                key={column.label}
                role="columnheader"
              >
                {column.label}
              </div>
            ))}
          </div>
        </div>
        <div
          className="border-neutral-disabled divide-y divide-(--umc-color-border-neutral-disabled) rounded-b-(--umc-radius-12) border-r border-b border-l"
          role="rowgroup"
        >
          {Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => (
            <SkeletonRow
              isLast={index === SKELETON_ROW_COUNT - 1}
              key={index}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
