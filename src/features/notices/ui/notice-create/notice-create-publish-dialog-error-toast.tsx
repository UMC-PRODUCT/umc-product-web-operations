import { InlineAlert } from "@/shared/ui/inline-alert"

type NoticeCreatePublishDialogErrorToastProps = {
  message: string
}

/** Figma 888:30671 — Web/Dialog slot 내 error Toast Bottom */
export function NoticeCreatePublishDialogErrorToast({
  message,
}: NoticeCreatePublishDialogErrorToastProps) {
  return (
    <InlineAlert className="max-w-full min-w-[400px]" shake tone="error">
      {message}
    </InlineAlert>
  )
}
