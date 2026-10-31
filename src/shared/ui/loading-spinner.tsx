type LoadingSpinnerProps = {
  /** 스크린리더용 상태 문구. 화면에 텍스트는 보이지 않는다. */
  label?: string
  className?: string
}

/** DS에 Spinner가 없어 brand(teal/mint) 색으로 만든 대기 표시. */
export function LoadingSpinner({
  label = "로딩 중",
  className,
}: LoadingSpinnerProps) {
  return (
    <div
      aria-live="polite"
      className={["inline-flex items-center justify-center", className]
        .filter(Boolean)
        .join(" ")}
      role="status"
    >
      <span className="sr-only">{label}</span>
      <span
        aria-hidden
        className="size-8 animate-spin rounded-full border-2 border-[var(--umc-color-teal-200,#b3e5e1)] border-t-[var(--umc-color-teal-500,#008a80)]"
      />
    </div>
  )
}

export function AuthBusyScreen({ label = "로딩 중" }: { label?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <LoadingSpinner label={label} />
    </div>
  )
}
