import { Skeleton } from "@umc-product/react"

import { cn } from "@/shared/lib/cn"
import { DataTableBody, DataTableShell } from "@/shared/ui/data-table-shell"

const SKELETON_ROW_COUNT = 4

const HEADER_COLUMNS = [
  {
    label: "구성원",
    className:
      "w-[240px] min-w-[240px] max-w-[240px] shrink-0 overflow-hidden pl-(--umc-spacing-padding-8) pr-(--umc-spacing-padding-24)",
  },
  {
    label: "학교",
    className:
      "w-[140px] min-w-[140px] max-w-[140px] shrink-0 overflow-hidden px-(--umc-spacing-padding-20)",
  },
  {
    label: "파트",
    className:
      "w-[120px] min-w-[120px] max-w-[120px] shrink-0 overflow-hidden pl-(--umc-spacing-padding-20) pr-(--umc-spacing-padding-16)",
  },
  {
    label: "유형 · 사유",
    className:
      "w-[280px] min-w-[280px] max-w-[280px] shrink-0 overflow-hidden pl-(--umc-spacing-padding-20) pr-(--umc-spacing-padding-24)",
  },
  {
    label: "탈부 현황",
    className:
      "w-[180px] min-w-[180px] max-w-[180px] shrink-0 overflow-hidden pl-(--umc-spacing-padding-20) pr-(--umc-spacing-padding-16)",
  },
  {
    label: "",
    className: "min-w-[140px] flex-1 shrink-0",
  },
] as const

function SkeletonRow({ isLast }: { isLast: boolean }) {
  return (
    <div
      className={cn(
        "flex w-full items-center px-(--umc-spacing-padding-10) py-(--umc-spacing-padding-12)",
        isLast && "rounded-b-(--umc-radius-12)",
      )}
      role="row"
    >
      <div className="flex w-[240px] max-w-[240px] min-w-[240px] shrink-0 items-center gap-(--umc-spacing-gap-10) overflow-hidden pr-8 pl-(--umc-spacing-padding-8)">
        <Skeleton className="h-[25px] w-6 shrink-0 rounded-full" />
        <Skeleton className="h-[23px] min-w-0 flex-1" />
      </div>
      <div className="flex w-[140px] max-w-[140px] min-w-[140px] shrink-0 items-center overflow-hidden px-(--umc-spacing-padding-20)">
        <Skeleton className="h-[23px] min-w-0 flex-1" />
      </div>
      <div className="flex w-[120px] max-w-[120px] min-w-[120px] shrink-0 items-center overflow-hidden pr-(--umc-spacing-padding-16) pl-(--umc-spacing-padding-20)">
        <Skeleton className="h-[22px] w-[60px] shrink-0" />
      </div>
      <div className="flex w-[260px] max-w-[260px] min-w-[260px] shrink-0 items-center overflow-hidden pr-(--umc-spacing-padding-16) pl-(--umc-spacing-padding-20)">
        <Skeleton className="h-[23px] w-[200px] shrink-0" />
      </div>
      <div className="flex w-[140px] max-w-[140px] min-w-[140px] shrink-0 items-center overflow-hidden pr-(--umc-spacing-padding-16) pl-[22px]">
        <Skeleton className="h-6 w-20 shrink-0" />
      </div>
      <div className="flex min-w-[140px] flex-1 shrink-0 flex-col items-end justify-center pr-(--umc-spacing-padding-16) pl-(--umc-spacing-padding-20)">
        <Skeleton className="h-[22px] w-20 shrink-0" />
      </div>
    </div>
  )
}

export function WithdrawalTableSkeleton() {
  return (
    <div className="w-full min-w-0 overflow-x-auto rounded-(--umc-radius-12)">
      <DataTableShell
        aria-busy="true"
        aria-label="탈부 대상 목록 불러오는 중"
        className="min-w-[1158px]"
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
        <DataTableBody>
          {Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => (
            <SkeletonRow
              isLast={index === SKELETON_ROW_COUNT - 1}
              key={index}
            />
          ))}
        </DataTableBody>
      </DataTableShell>
    </div>
  )
}
