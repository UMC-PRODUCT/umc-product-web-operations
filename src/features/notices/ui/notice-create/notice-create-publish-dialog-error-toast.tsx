import { CheckCircleIcon } from "@umc-product/icons"

import { cn } from "@/shared/lib/cn"

type NoticeCreatePublishDialogErrorToastProps = {
  message: string
}

/** Figma 888:30671 — Web/Dialog slot 내 error Toast Bottom */
export function NoticeCreatePublishDialogErrorToast({
  message,
}: NoticeCreatePublishDialogErrorToastProps) {
  return (
    <div
      className={cn("umc-toast w-full max-w-full min-w-[400px]")}
      data-color="error"
      data-icon=""
      role="alert"
    >
      <div className="umc-toast__main">
        <span aria-hidden className="umc-toast__icon">
          <CheckCircleIcon size={24} weight="fill" />
        </span>
        <p className="umc-toast__message">{message}</p>
      </div>
    </div>
  )
}
