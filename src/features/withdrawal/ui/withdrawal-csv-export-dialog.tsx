import { Dialog } from "@umc-product/react"

export type WithdrawalCsvExportMode = "selected" | "all"

type WithdrawalCsvExportDialogProps = {
  open: boolean
  mode: WithdrawalCsvExportMode
  count: number
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

function ExportDescription({
  mode,
  count,
}: {
  mode: WithdrawalCsvExportMode
  count: number
}) {
  if (mode === "selected") {
    return (
      <>
        선택한 구성원 <span className="text-brand-default-600">{count}명</span>
        의 기록을 한 번에 내려받아요
      </>
    )
  }

  return (
    <>
      현재 필터 조건에 맞는 구성원{" "}
      <span className="text-brand-default-600">{count}명</span>의 기록을 한 번에
      내려받아요
    </>
  )
}

export function WithdrawalCsvExportDialog({
  open,
  mode,
  count,
  onOpenChange,
  onConfirm,
}: WithdrawalCsvExportDialogProps) {
  if (!open) {
    return null
  }

  const title =
    mode === "selected"
      ? "선택한 탈부 인원을 CSV로 내보낼까요?"
      : "전체 탈부 인원을 CSV로 내보낼까요?"

  return (
    <Dialog
      cancelLabel="취소"
      color="brand"
      confirmLabel="내보내기"
      description={<ExportDescription count={count} mode={mode} />}
      onCancel={() => onOpenChange(false)}
      onConfirm={onConfirm}
      onOpenChange={onOpenChange}
      open={open}
      title={title}
    />
  )
}
