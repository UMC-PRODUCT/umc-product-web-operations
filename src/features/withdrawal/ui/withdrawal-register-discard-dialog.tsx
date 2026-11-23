import { Dialog } from "@umc-product/react"

type WithdrawalRegisterDiscardDialogProps = {
  onConfirm: () => void
  onDismiss: () => void
  open: boolean
}

/**
 * 공지 작성 이탈 Dialog(`notice-create-page`)와 동일 DS `Dialog`.
 * 작성 중 이탈 확인.
 */
export function WithdrawalRegisterDiscardDialog({
  onConfirm,
  onDismiss,
  open,
}: WithdrawalRegisterDiscardDialogProps) {
  return (
    <Dialog
      cancelLabel="계속 작성"
      color="brand"
      confirmLabel="나가기"
      description="지금 나가면 입력한 탈부 정보가 저장되지 않아요"
      onCancel={onDismiss}
      onConfirm={onConfirm}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onDismiss()
        }
      }}
      open={open}
      title="작성 중인 내용이 있어요"
    />
  )
}
