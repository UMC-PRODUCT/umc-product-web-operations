import { Dialog } from "@umc-product/react"
import { useEffect } from "react"

type AwardDiscardDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

/**
 * 이탈 확인: Panel 딤은 끄고(app.css), Dialog backdrop(medium)만 표시한다.
 */
export function AwardDiscardDialog({
  open,
  onOpenChange,
  onConfirm,
}: AwardDiscardDialogProps) {
  useEffect(() => {
    if (!open) {
      return
    }
    document.body.classList.add("award-discard-open")
    return () => {
      document.body.classList.remove("award-discard-open")
    }
  }, [open])

  return (
    <Dialog
      cancelLabel="계속 작성"
      color="brand"
      confirmLabel="나가기"
      description="지금 나가면 입력한 내용이 모두 사라져요"
      onCancel={() => {
        onOpenChange(false)
      }}
      onConfirm={onConfirm}
      onOpenChange={onOpenChange}
      open={open}
      title="작성 중인 내용이 있어요"
    />
  )
}
