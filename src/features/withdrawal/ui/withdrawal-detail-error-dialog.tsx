import { Dialog } from "@umc-product/react"

type WithdrawalDetailErrorDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onRetry: () => void
}

/**
 * Figma 2591:25719 (+ 딤드 2591:25346) — 탈부 상세 조회 실패 Dialog.
 * DS `Dialog` backdrop이 딤드를 담당한다.
 */
export function WithdrawalDetailErrorDialog({
  open,
  onOpenChange,
  onRetry,
}: WithdrawalDetailErrorDialogProps) {
  if (!open) {
    return null
  }

  return (
    <Dialog
      cancelLabel="닫기"
      color="brand"
      confirmLabel="다시 시도"
      description="잠시 후 다시 시도해 주세요. 계속 안 되면 문의하기로 알려 주세요"
      onCancel={() => {
        onOpenChange(false)
      }}
      onConfirm={onRetry}
      onOpenChange={onOpenChange}
      open={open}
      title="탈부 기록을 불러오지 못했어요"
    />
  )
}
