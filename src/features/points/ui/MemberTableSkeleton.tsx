import { cn } from "@/shared/lib/cn"

const SKELETON_ROW_COUNT = 4

const HEADER_COLUMNS = [
  {
    label: "구성원",
    className:
      "w-[240px] min-w-[240px] max-w-[240px] shrink-0 overflow-hidden px-(--umc-spacing-padding-24)",
  },
  {
    label: "학교",
    className:
      "w-[160px] min-w-[160px] max-w-[160px] shrink-0 overflow-hidden px-(--umc-spacing-padding-20)",
  },
  {
    label: "파트",
    className:
      "w-[120px] min-w-[120px] max-w-[120px] shrink-0 overflow-hidden pl-(--umc-spacing-padding-20) pr-(--umc-spacing-padding-16)",
  },
  {
    label: "기수",
    className:
      "w-[110px] min-w-[110px] max-w-[110px] shrink-0 overflow-hidden pl-(--umc-spacing-padding-20) pr-(--umc-spacing-padding-16)",
  },
  {
    label: "운영 역할",
    className:
      "w-[220px] min-w-[220px] max-w-[220px] shrink-0 overflow-hidden pl-(--umc-spacing-padding-20) pr-(--umc-spacing-padding-24)",
  },
  {
    label: "상태",
    className:
      "w-[112px] min-w-[112px] max-w-[112px] shrink-0 overflow-hidden pl-(--umc-spacing-padding-20) pr-(--umc-spacing-padding-16)",
  },
  {
    label: "",
    className: "w-[176px] min-w-[176px] max-w-[176px] shrink-0",
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
        "flex w-full items-center px-(--umc-spacing-padding-10) py-(--umc-spacing-padding-12)",
        isLast && "rounded-b-(--umc-radius-12)",
      )}
      role="row"
    >
      <div className="flex w-[240px] max-w-[240px] min-w-[240px] shrink-0 items-center gap-(--umc-spacing-gap-10) overflow-hidden px-(--umc-spacing-padding-20)">
        <Bone className="h-[25px] w-6 shrink-0 rounded-full" />
        <Bone className="h-[23px] min-w-0 flex-1" />
      </div>
      <div className="flex w-[160px] max-w-[160px] min-w-[160px] shrink-0 items-center overflow-hidden px-(--umc-spacing-padding-20)">
        <Bone className="h-[23px] min-w-0 flex-1" />
      </div>
      <div className="flex w-[120px] max-w-[120px] min-w-[120px] shrink-0 items-center overflow-hidden pr-(--umc-spacing-padding-16) pl-(--umc-spacing-padding-20)">
        <Bone className="h-[22px] w-[60px] shrink-0" />
      </div>
      <div className="flex w-[110px] max-w-[110px] min-w-[110px] shrink-0 items-center overflow-hidden pr-(--umc-spacing-padding-16) pl-(--umc-spacing-padding-20)">
        <Bone className="h-[23px] w-[60px] shrink-0" />
      </div>
      <div className="flex w-[220px] max-w-[220px] min-w-[220px] shrink-0 items-center overflow-hidden pr-(--umc-spacing-padding-16) pl-(--umc-spacing-padding-20)">
        <Bone className="h-[22px] w-[67px] shrink-0" />
      </div>
      <div className="flex w-[112px] max-w-[112px] min-w-[112px] shrink-0 items-center overflow-hidden pr-(--umc-spacing-padding-16) pl-[22px]">
        <Bone className="h-[24px] w-[60px] shrink-0" />
      </div>
      <div className="flex w-[176px] max-w-[176px] min-w-[176px] shrink-0 flex-col items-start pr-(--umc-spacing-padding-16) pl-(--umc-spacing-padding-20)">
        <Bone className="h-[22px] w-full shrink-0" />
      </div>
    </div>
  )
}

export function MemberTableSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="구성원 목록 불러오는 중"
      className="w-full overflow-hidden rounded-(--umc-radius-12)"
      role="status"
    >
      <div
        className="bg-fill-primary-medium-100 text-body-3-medium text-brand-strong-800 flex w-full items-center rounded-t-(--umc-radius-12) px-(--umc-spacing-padding-10) py-(--umc-spacing-padding-6)"
        role="row"
      >
        <div className="flex h-7 w-full items-center">
          {HEADER_COLUMNS.map((column, index) => (
            <div
              className={column.className}
              key={column.label || `action-${index}`}
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
          <SkeletonRow isLast={index === SKELETON_ROW_COUNT - 1} key={index} />
        ))}
      </div>
    </div>
  )
}
