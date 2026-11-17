import { Dialog } from "@umc-product/react"
import { useEffect, useState } from "react"

import { cn } from "@/shared/lib/cn"
import { InlineAlert } from "@/shared/ui/inline-alert"

import { formatPointScore } from "../model/point-history"

import type { DeletePointHistoryOutcome } from "../model/mock-delete-point-history"
import type { PointHistoryItem } from "../model/point-history"
import type { PointsMember } from "../model/types"

type DeleteRequestOutcome = DeletePointHistoryOutcome | "forbidden"

type DeletePointHistoryDialogProps = {
  open: boolean
  member: PointsMember
  item: PointHistoryItem | null
  onConfirm: (historyId: string) => Promise<DeleteRequestOutcome>
  onOpenChange: (open: boolean) => void
  onDeleted: (historyId: string) => void | Promise<void>
  onAlreadyDeleted: (historyId: string) => void
}

type DialogPhase =
  "idle" | "loading" | "network_error" | "server_error" | "already_deleted"

export function DeletePointHistoryDialog({
  open,
  member,
  item,
  onConfirm,
  onOpenChange,
  onDeleted,
  onAlreadyDeleted,
}: DeletePointHistoryDialogProps) {
  const [phase, setPhase] = useState<DialogPhase>("idle")

  useEffect(() => {
    if (!open) {
      setPhase("idle")
    }
  }, [open])

  if (!open || !item) {
    return null
  }

  const isLoading = phase === "loading"
  const summary = [
    `${member.name} / ${member.nickname}`,
    item.typeLabel,
    formatPointScore(item.score),
  ]

  const handleClose = () => {
    if (isLoading) {
      return
    }
    onOpenChange(false)
  }

  const handleDelete = async () => {
    // DS Dialog 버튼은 disabled 를 받지 않아 핸들러에서 막는다.
    if (isLoading || phase === "already_deleted") {
      return
    }
    setPhase("loading")
    try {
      const outcome = await onConfirm(item.id)
      if (outcome === "success") {
        try {
          await onDeleted(item.id)
          onOpenChange(false)
        } catch {
          // 삭제 API는 성공했는데 후속 재조회가 실패해도 로딩에 멈추지 않는다.
          onOpenChange(false)
        }
        return
      }
      if (outcome === "already_deleted") {
        onAlreadyDeleted(item.id)
        setPhase("already_deleted")
        return
      }
      if (outcome === "server_error") {
        setPhase("server_error")
        return
      }
      // 403·네트워크 실패 모두 Figma PT-M03 V2 — 모달 내 InlineAlert 유지
      setPhase("network_error")
    } catch {
      setPhase("network_error")
    }
  }

  /**
   * DS Dialog의 확인·취소 버튼은 항상 Close 로 동작해 `onOpenChange(false)`(reason `close-press`)를 부른다.
   * 삭제는 비동기 + 모달 안 오류 표시라 버튼 닫힘은 무시하고, Esc 등 그 외 닫힘만 따른다.
   */
  const handleOpenChange = (next: boolean, details?: { reason?: string }) => {
    if (next || details?.reason === "close-press") {
      return
    }
    handleClose()
  }

  return (
    <Dialog
      cancelLabel="취소"
      color="brand"
      confirmLabel={isLoading ? "삭제 중..." : "삭제하기"}
      description={
        <>
          삭제하면 총점에서 빠지고 챌린저 앱에서도 사라져요.
          <br />
          삭제 기록은 감사 로그에 남아있어요
        </>
      }
      onCancel={handleClose}
      onConfirm={() => {
        void handleDelete()
      }}
      onOpenChange={handleOpenChange}
      open
      title="이 기록을 삭제할까요?"
    >
      <div className="flex flex-col gap-5">
        <div className="bg-fill-neutral-disabled flex min-h-12 items-center overflow-hidden rounded-(--umc-radius-14) px-(--umc-spacing-padding-16)">
          <p className="text-body-1-medium flex min-w-0 flex-wrap items-center gap-(--umc-spacing-gap-12)">
            {summary.map((part, index) => (
              <span
                className="flex items-center gap-(--umc-spacing-gap-12)"
                key={`${part}-${index}`}
              >
                {index > 0 ? (
                  <span
                    aria-hidden
                    className="text-body-3-regular text-teal-grey-400"
                  >
                    |
                  </span>
                ) : null}
                <span
                  className={cn(
                    index === summary.length - 1
                      ? item.score < 0
                        ? "text-error"
                        : "text-brand-default-600"
                      : "text-neutral-strong-800",
                  )}
                >
                  {part}
                </span>
              </span>
            ))}
          </p>
        </div>

        {phase === "network_error" || phase === "server_error" ? (
          <InlineAlert tone="error">
            {phase === "server_error"
              ? "서버에서 삭제를 처리하지 못했어요. 잠시 후 다시 시도해 주세요"
              : "삭제하지 못했어요. 다시 시도해 주세요"}
          </InlineAlert>
        ) : null}

        {phase === "already_deleted" ? (
          <InlineAlert tone="warning">
            이미 삭제된 기록이에요. 이력을 다시 불러올게요
          </InlineAlert>
        ) : null}
      </div>
    </Dialog>
  )
}
