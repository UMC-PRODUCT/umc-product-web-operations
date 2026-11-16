import { WarningIcon } from "@umc-product/icons"

import { cn } from "@/shared/lib/cn"

import type { ReactNode } from "react"

type InlineAlertTone = "error" | "warning"

type InlineAlertProps = {
  tone: InlineAlertTone
  children: ReactNode
  /** 오른쪽 텍스트 동작 (예: 「이미지 불러오기」) */
  action?: { label: ReactNode; onClick: () => void }
  /** DS Toast 와 같은 드롭 섀도 (기본 true) */
  elevated?: boolean
  /** error 톤 등장 시 DS Toast 와 같은 흔들림 */
  shake?: boolean
  className?: string
}

/*
 * DS Toast(`color="error" | "warning"`)와 같은 모양의 인라인 알림.
 * DS는 Toast를 overlay(useToast)로만 제공해서, 다이얼로그·폼 안에 놓을 때 쓴다.
 * 배경 색은 DS Toast 컴포넌트 변수 값(`--umc-toast-error-bg`, `--umc-toast-neutral-bg`)과 동일.
 */
const TONE_STYLES: Record<
  InlineAlertTone,
  { root: string; icon: string; action: string; role: "alert" | "status" }
> = {
  error: {
    root: "bg-[#fed7d7] text-(--umc-color-red-700)",
    icon: "text-(--umc-color-icon-error)",
    action: "text-(--umc-color-red-500)",
    role: "alert",
  },
  warning: {
    root: "bg-[rgba(63,65,65,0.8)] text-(--umc-color-text-inverse)",
    icon: "text-(--umc-color-icon-warning)",
    action: "text-(--umc-color-text-inverse)",
    role: "status",
  },
}

export function InlineAlert({
  tone,
  children,
  action,
  elevated = true,
  shake = false,
  className,
}: InlineAlertProps) {
  const styles = TONE_STYLES[tone]

  return (
    <div
      className={cn(
        "text-label-3-medium flex min-h-11 w-full items-center gap-(--umc-spacing-gap-8)",
        "rounded-(--umc-radius-toast) py-(--umc-spacing-padding-12) pr-(--umc-spacing-padding-16) pl-[14px]",
        elevated && "shadow-(--umc-shadow-drop-neutral-1)",
        shake &&
          "animate-[umc-error-shake_400ms_ease-in-out] motion-reduce:animate-none",
        styles.root,
        className,
      )}
      role={styles.role}
    >
      <WarningIcon
        aria-hidden
        className={cn("shrink-0", styles.icon)}
        size={24}
        weight="fill"
      />
      <p className="min-w-0 flex-1">{children}</p>
      {action ? (
        <button
          className={cn(
            "shrink-0 cursor-pointer border-0 bg-transparent p-0 whitespace-nowrap underline",
            "tracking-[-0.02em]",
            styles.action,
          )}
          onClick={action.onClick}
          type="button"
        >
          {action.label}
        </button>
      ) : null}
    </div>
  )
}
