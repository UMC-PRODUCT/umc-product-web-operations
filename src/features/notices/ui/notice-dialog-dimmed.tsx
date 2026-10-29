import { Dimmed, type DimmedProps } from "@umc-product/react"
import { createPortal } from "react-dom"

type NoticeDialogDimmedProps = Omit<DimmedProps, "aria-hidden" | "role">

/** 시각 딤만 담당(role 없음). 포커스·Esc·aria-modal은 DS Dialog(AlertDialog)가 처리합니다. */
export function NoticeDialogDimmed(props: NoticeDialogDimmedProps) {
  if (typeof document === "undefined") {
    return null
  }
  return createPortal(<Dimmed aria-hidden="true" {...props} />, document.body)
}
