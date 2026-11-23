import type { ReactNode } from "react"

export const WITHDRAWAL_REGISTER_SECTION_BODY_WIDTH_PX = 842 - 32 * 2

type WithdrawalRegisterSectionProps = {
  children: ReactNode
  title: string
}

export function WithdrawalRegisterSection({
  children,
  title,
}: WithdrawalRegisterSectionProps) {
  return (
    <section className="border-neutral-disabled flex w-[842px] max-w-full flex-col gap-(--umc-spacing-gap-24) rounded-(--umc-radius-14) border bg-white px-(--umc-spacing-padding-32) py-[34px]">
      <h2 className="text-heading-4-semibold text-neutral-default-900">
        {title}
      </h2>
      {children}
    </section>
  )
}
