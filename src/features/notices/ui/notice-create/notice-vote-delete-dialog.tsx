import { Dialog } from "@umc-product/react"

type NoticeVoteDeleteDialogProps = {
  confirmLoading?: boolean
  onConfirm: () => void
  onOpenChange: (open: boolean) => void
  open: boolean
}

/** Figma 1221:15226 — 공지 작성/수정 투표 삭제 확인 */
export function NoticeVoteDeleteDialog({
  confirmLoading = false,
  onConfirm,
  onOpenChange,
  open,
}: NoticeVoteDeleteDialogProps) {
  return (
    <Dialog
      cancelLabel="취소"
      color="brand"
      confirmLabel={confirmLoading ? "삭제 중..." : "삭제하기"}
      description="지금까지 참여한 결과도 함께 사라져요"
      onConfirm={onConfirm}
      onOpenChange={(nextOpen) => {
        if (confirmLoading) {
          return
        }
        onOpenChange(nextOpen)
      }}
      open={open}
      title="투표를 삭제할까요?"
    />
  )
}
