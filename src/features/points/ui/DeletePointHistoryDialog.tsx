import { CheckCircleIcon, WarningIcon } from "@umc-product/icons"
import { Button } from "@umc-product/react"
import { useEffect, useId, useState } from "react"
import { createPortal } from "react-dom"

import { cn } from "@/shared/lib/cn"

import { mockDeletePointHistory } from "../model/mock-delete-point-history"
import { formatPointScore } from "../model/point-history"

import type { DeletePointHistoryOutcome } from "../model/mock-delete-point-history"
import type { PointHistoryItem } from "../model/point-history"
import type { PointsMember } from "../model/types"

type DeleteRequestOutcome = DeletePointHistoryOutcome | "forbidden"

type DeletePointHistoryDialogProps = {
  open: boolean
  member: PointsMember
  item: PointHistoryItem | null
  /** 쿼리로 결과를 흉내 낼 때만 사용한다. 없으면 onConfirm으로 삭제한다. */
  simulateOutcome?: DeletePointHistoryOutcome
  onConfirm?: (historyId: string) => Promise<DeleteRequestOutcome>
  onOpenChange: (open: boolean) => void
  onDeleted: (historyId: string) => void | Promise<void>
  onAlreadyDeleted: (historyId: string) => void
  onForbidden?: () => void
}

type DialogPhase = "idle" | "loading" | "network_error" | "already_deleted"

export function DeletePointHistoryDialog({
  open,
  member,
  item,
  simulateOutcome,
  onConfirm,
  onOpenChange,
  onDeleted,
  onAlreadyDeleted,
  onForbidden,
}: DeletePointHistoryDialogProps) {
  const titleId = useId()
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
    if (isLoading) {
      return
    }
    setPhase("loading")
    const outcome = onConfirm
      ? await onConfirm(item.id)
      : await mockDeletePointHistory(item.id, simulateOutcome ?? "success")
    if (outcome === "success") {
      await onDeleted(item.id)
      onOpenChange(false)
      return
    }
    if (outcome === "already_deleted") {
      onAlreadyDeleted(item.id)
      setPhase("already_deleted")
      return
    }
    if (outcome === "forbidden") {
      onForbidden?.()
      onOpenChange(false)
      return
    }
    setPhase("network_error")
  }

  return createPortal(
    <div className="fixed inset-0 z-[var(--umc-z-dialog,1000)] flex items-center justify-center p-4">
      <button
        aria-label="닫기"
        className="absolute inset-0 border-0 bg-[var(--umc-color-dimmed-medium)]"
        disabled={isLoading}
        onClick={handleClose}
        type="button"
      />
      <div
        aria-labelledby={titleId}
        aria-modal="true"
        className="relative z-10 flex w-full max-w-[440px] flex-col gap-(--umc-spacing-gap-24) rounded-(--umc-radius-24) bg-white p-(--umc-spacing-padding-20) shadow-(--umc-shadow-drop-neutral-2)"
        role="dialog"
      >
        <div className="flex flex-col gap-(--umc-spacing-gap-10) px-1 pt-1">
          <h2
            className="text-title-1-semibold text-neutral-default-900"
            id={titleId}
          >
            이 기록을 삭제할까요?
          </h2>
          <p className="text-body-1-medium text-neutral-medium-600">
            삭제하면 총점에서 빠지고 챌린저 앱에서도 사라져요.
            <br />
            삭제 기록은 감사 로그에 남아있어요
          </p>
        </div>

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

          {phase === "network_error" ? (
            <div
              className="flex min-h-11 w-full items-center gap-(--umc-spacing-gap-8) rounded-(--umc-radius-14) bg-[var(--umc-toast-error-bg,#fed7d7)] py-(--umc-spacing-padding-12) pr-(--umc-spacing-padding-16) pl-[14px] shadow-[0_4px_16px_rgba(64,68,67,0.16)]"
              role="alert"
            >
              <CheckCircleIcon
                aria-hidden
                className="shrink-0 text-[var(--umc-color-icon-error,#dc3d3d)]"
                size={24}
                weight="fill"
              />
              <p className="text-label-3-medium min-w-0 flex-1 text-[var(--umc-color-red-700,#a60303)]">
                삭제하지 못했어요. 다시 시도해 주세요
              </p>
            </div>
          ) : null}

          {phase === "already_deleted" ? (
            <div
              className="flex min-h-11 w-full items-center gap-(--umc-spacing-gap-8) rounded-(--umc-radius-14) bg-[rgba(63,65,65,0.8)] py-(--umc-spacing-padding-12) pr-(--umc-spacing-padding-16) pl-[14px] shadow-[0_4px_16px_rgba(64,68,67,0.16)]"
              role="status"
            >
              <WarningIcon
                aria-hidden
                className="shrink-0 text-[var(--umc-color-icon-warning,#f59e0b)]"
                size={24}
                weight="fill"
              />
              <p className="text-label-3-medium min-w-0 flex-1 text-white">
                이미 삭제된 기록이에요. 이력을 다시 불러올게요
              </p>
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-end gap-(--umc-spacing-gap-12)">
          <Button
            color="neutral"
            disabled={isLoading}
            onClick={handleClose}
            size="xs"
            type="button"
            variant="weak"
          >
            취소
          </Button>
          <Button
            color="primary"
            disabled={isLoading || phase === "already_deleted"}
            onClick={() => {
              void handleDelete()
            }}
            size="xs"
            type="button"
            variant="fill"
          >
            {isLoading ? "삭제 중..." : "삭제하기"}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
