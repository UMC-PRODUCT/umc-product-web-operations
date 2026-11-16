import { cn } from "@/shared/lib/cn"

import type { ReactNode } from "react"

type EmptyStateProps = {
  /** 44~48px 아이콘 (보통 `text-icon-disabled`) */
  icon: ReactNode
  title: ReactNode
  description?: ReactNode
  /** 아이콘·문구 아래 동작 (예: 다시 시도 버튼) */
  action?: ReactNode
  /** 제목과 설명 사이 간격(px). Figma 목록 empty 는 6, 오류·권한 안내는 8 */
  textGap?: 6 | 8
  role?: "alert" | "status"
  className?: string
}

const TEXT_GAP_CLASS = {
  6: "gap-(--umc-spacing-gap-6)",
  8: "gap-(--umc-spacing-gap-8)",
} as const

/** 표·목록 영역 안에서 쓰는 빈 상태·오류·권한 안내 (아이콘 + 제목 + 설명 + 선택 동작) */
export function EmptyState({
  icon,
  title,
  description,
  action,
  textGap = 8,
  role = "status",
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex w-full flex-col items-center gap-(--umc-spacing-gap-16) py-[40px] pr-(--umc-spacing-padding-20)",
        className,
      )}
      role={role}
    >
      {icon}
      <div
        className={cn(
          "flex w-full flex-col items-center text-center",
          TEXT_GAP_CLASS[textGap],
        )}
      >
        <p className="text-title-4-semibold text-neutral-strong-800 w-full">
          {title}
        </p>
        {description != null ? (
          <p className="text-body-3-regular text-neutral-medium-600 w-full">
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  )
}
