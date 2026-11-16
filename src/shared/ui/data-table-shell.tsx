import { cn } from "@/shared/lib/cn"

import type { ComponentPropsWithRef } from "react"

/** 목록 표 바깥 틀 (둥근 모서리 12 + 넘침 숨김). 헤더 행과 `DataTableBody` 를 자식으로 둔다. */
export function DataTableShell({
  className,
  ...props
}: ComponentPropsWithRef<"div">) {
  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-(--umc-radius-12)",
        className,
      )}
      {...props}
    />
  )
}

/** 표 본문(rowgroup): 헤더 아래 좌·우·하 테두리와 행 구분선. */
export function DataTableBody({
  className,
  ...props
}: ComponentPropsWithRef<"div">) {
  return (
    <div
      className={cn(
        "border-neutral-disabled divide-y divide-(--umc-color-border-neutral-disabled) rounded-b-(--umc-radius-12) border-r border-b border-l",
        className,
      )}
      role="rowgroup"
      {...props}
    />
  )
}
