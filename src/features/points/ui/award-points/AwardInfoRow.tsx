import type { ReactNode } from "react"

type AwardInfoRowProps = {
  label: string
  children: ReactNode
}

/** Panel 상단 읽기 전용 정보 행 (대상·점수) */
export function AwardInfoRow({ label, children }: AwardInfoRowProps) {
  return (
    <div className="bg-fill-neutral-disabled flex min-h-12 items-center gap-(--umc-spacing-gap-16) overflow-hidden rounded-(--umc-radius-14) pr-2 pl-(--umc-spacing-padding-16)">
      <span className="text-body-1-medium text-neutral-weak-500 shrink-0">
        {label}
      </span>
      {children}
    </div>
  )
}
