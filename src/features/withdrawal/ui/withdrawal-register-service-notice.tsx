import { UnderConstructionPictogram } from "@umc-product/icons"

import type { ReactNode } from "react"

type WithdrawalRegisterServiceNoticeProps = {
  message: ReactNode
  color?: "brand" | "neutral"
}

const SERVICE_NOTICE_PICTOGRAM_MODE = {
  brand: "light",
  neutral: "dark",
} as const

export function WithdrawalRegisterServiceNotice({
  message,
  color = "neutral",
}: WithdrawalRegisterServiceNoticeProps) {
  const pictogram = (
    <span aria-hidden className="umc-toast__pictogram">
      <UnderConstructionPictogram
        mode={SERVICE_NOTICE_PICTOGRAM_MODE[color]}
        size={24}
      />
    </span>
  )

  return (
    <div
      className="umc-toast w-full max-w-[842px]"
      data-color={color}
      data-kind="service-notice"
      data-placement="bottom"
      role="status"
    >
      {pictogram}
      <p className="umc-toast__message">{message}</p>
      {pictogram}
    </div>
  )
}
