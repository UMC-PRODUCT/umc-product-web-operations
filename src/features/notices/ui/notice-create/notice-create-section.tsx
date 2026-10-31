import { cn } from "@/shared/lib/cn"

import type { ReactNode } from "react"

type NoticeCreateSectionProps = {
  children: ReactNode
  locked?: boolean
  title: string
}

export function NoticeCreateSection({
  children,
  locked = false,
  title,
}: NoticeCreateSectionProps) {
  return (
    <section
      className={cn(
        "border-neutral-disabled flex w-[842px] max-w-full flex-col gap-(--umc-spacing-gap-24) rounded-(--umc-radius-14) border bg-white px-(--umc-spacing-padding-32) py-[34px]",
        locked && "pointer-events-none opacity-60 select-none",
      )}
    >
      <h2 className="text-heading-4-semibold text-neutral-default-900">
        {title}
      </h2>
      {children}
    </section>
  )
}
