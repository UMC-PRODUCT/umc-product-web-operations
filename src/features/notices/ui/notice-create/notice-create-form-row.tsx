import type { ReactNode } from "react"

type NoticeCreateFormRowProps = {
  children: ReactNode
  label: string
  labelWidth?: string
}

export function NoticeCreateFormRow({
  children,
  label,
  labelWidth = "w-[60px]",
}: NoticeCreateFormRowProps) {
  return (
    <div className="flex w-full items-start gap-(--umc-spacing-gap-8)">
      <p
        className={`text-body-1-regular text-neutral-strong-800 shrink-0 pt-3 ${labelWidth}`}
      >
        {label}
      </p>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}
