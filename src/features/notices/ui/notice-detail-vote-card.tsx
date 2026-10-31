import {
  Button,
  Checkbox,
  Dialog,
  ProgressBar,
  Tag,
  useToast,
} from "@umc-product/react"
import { useEffect, useMemo, useRef, useState } from "react"

import { getServerErrorMessage } from "@/shared/api/server-error"

import {
  applyPollVote,
  getInitialViewerSelection,
  getLeadingOptionIds,
  getVoteOptionProgressPercent,
  shouldCancelNoticeVoteOnLeave,
} from "../model/notice-poll-vote"
import {
  cancelNoticeVoteResponse,
  saveNoticeVoteResponse,
} from "../model/submit-notice-vote"
import { NoticeDialogDimmed } from "./notice-dialog-dimmed"
import {
  captureNoticeDialogFocus,
  restoreNoticeDialogFocus,
} from "./notice-dialog-focus"
import { showNoticeErrorToast } from "./show-notice-error-toast"

import type { NoticePoll, NoticePollOption } from "../model/notice-detail.types"

type NoticeDetailVoteCardProps = {
  canManagePoll?: boolean
  /** 작성 화면 미리보기 — API 호출 없이 카드 UI만 동작 */
  interaction?: "default" | "preview"
  /** Figma 1221:13714 — 폼에 첨부된 투표 카드(결과만, 액션 숨김) */
  layout?: "default" | "attached"
  noticeId: string
  poll: NoticePoll
}

function formatVoteCount(count: number) {
  return `${Number(count)}명`
}

function isMultipleChoicePoll(poll: NoticePoll) {
  return poll.settingsLabel.includes("복수선택")
}

type VoteOptionInputRowProps = {
  checked: boolean
  label: string
  onCheckedChange: (checked: boolean) => void
}

function VoteOptionInputRow({
  checked,
  label,
  onCheckedChange,
}: VoteOptionInputRowProps) {
  return (
    <Checkbox
      checked={checked}
      color={checked ? "brand" : "neutral"}
      labelPlacement="end"
      onCheckedChange={onCheckedChange}
      size="md"
    >
      <span className="text-label-4-medium text-neutral-default-900">
        {label}
      </span>
    </Checkbox>
  )
}

type VoteOptionResultRowProps = {
  anyViewerChoiceIsNonLeading: boolean
  isLeading: boolean
  isViewerChoice: boolean
  option: NoticePollOption
  progressPercent: number
}

function getResultCheckboxState(
  isLeading: boolean,
  isViewerChoice: boolean,
  anyViewerChoiceIsNonLeading: boolean,
): { color: "brand" | "neutral"; show: boolean } | null {
  if (isViewerChoice) {
    return { color: isLeading ? "brand" : "neutral", show: true }
  }

  if (isLeading && anyViewerChoiceIsNonLeading) {
    return { color: "brand", show: true }
  }

  return null
}

/**
 * Figma: 1위 아닌 내 선택 = DS `neutral` + `disabled` + checked
 * 1위(brand) = Figma에 disabled+brand 없음 → `brand` + checked, readOnly만
 */
function VoteResultCheckbox({ color }: { color: "brand" | "neutral" }) {
  const className = "pointer-events-none shrink-0"

  if (color === "neutral") {
    return (
      <Checkbox
        aria-hidden
        checked
        className={className}
        color="neutral"
        disabled
        size="md"
      />
    )
  }

  return (
    <Checkbox
      aria-hidden
      checked
      className={className}
      color="brand"
      readOnly
      size="md"
    />
  )
}

function VoteOptionResultRow({
  anyViewerChoiceIsNonLeading,
  isLeading,
  isViewerChoice,
  option,
  progressPercent,
}: VoteOptionResultRowProps) {
  const resultCheckbox = getResultCheckboxState(
    isLeading,
    isViewerChoice,
    anyViewerChoiceIsNonLeading,
  )

  return (
    <li className="flex w-full flex-col gap-(--umc-spacing-gap-6)">
      <div className="flex w-full items-center justify-between gap-(--umc-spacing-gap-8)">
        <div className="flex min-h-6 min-w-0 items-center gap-(--umc-spacing-gap-4)">
          {resultCheckbox ? (
            <VoteResultCheckbox color={resultCheckbox.color} />
          ) : null}
          <span className="text-label-4-medium text-neutral-default-900">
            {option.label}
          </span>
        </div>
        <span className="text-caption-1-regular text-placeholder shrink-0">
          {formatVoteCount(option.voteCount)}
        </span>
      </div>
      <ProgressBar
        aria-label={`${option.label} ${progressPercent}%`}
        color={isLeading ? "brand" : "neutral"}
        max={100}
        size="lg"
        value={progressPercent}
      />
    </li>
  )
}

export function NoticeDetailVoteCard({
  canManagePoll = false,
  interaction = "default",
  layout = "default",
  noticeId,
  poll,
}: NoticeDetailVoteCardProps) {
  const isPreview = interaction === "preview"
  const isAttached = layout === "attached"
  const toast = useToast()
  const allowMultiple = isMultipleChoicePoll(poll)
  const initialSelection = useMemo(
    () => getInitialViewerSelection(poll.options),
    [poll.options],
  )

  const [status, setStatus] = useState(poll.status)
  const [options, setOptions] = useState(poll.options)
  const [participantCount, setParticipantCount] = useState(
    poll.participantCount,
  )
  const [viewerSelection, setViewerSelection] =
    useState<string[]>(initialSelection)
  const [hasEverVoted, setHasEverVoted] = useState(initialSelection.length > 0)
  const [isRevoting, setIsRevoting] = useState(false)
  const [draftSelection, setDraftSelection] =
    useState<string[]>(initialSelection)
  const [endDialogOpen, setEndDialogOpen] = useState(false)
  const endDialogFocusStore = useRef<HTMLElement | null>(null)
  const [isEndingPoll, setIsEndingPoll] = useState(false)
  const [isSubmittingVote, setIsSubmittingVote] = useState(false)

  const voteLeaveStateRef = useRef({
    draftSelection,
    hasEverVoted,
    isRevoting,
    noticeId,
    viewerSelection,
  })

  useEffect(() => {
    voteLeaveStateRef.current = {
      draftSelection,
      hasEverVoted,
      isRevoting,
      noticeId,
      viewerSelection,
    }
  })

  useEffect(() => {
    const nextSelection = getInitialViewerSelection(poll.options)
    setStatus(poll.status)
    setOptions(poll.options)
    setParticipantCount(poll.participantCount)
    setViewerSelection(nextSelection)
    setHasEverVoted(nextSelection.length > 0)
    setDraftSelection(nextSelection)
    setIsRevoting(false)
  }, [poll])

  useEffect(() => {
    if (isPreview) {
      return
    }
    return () => {
      const state = voteLeaveStateRef.current
      if (!shouldCancelNoticeVoteOnLeave(state)) {
        return
      }

      const parsedNoticeId = Number(state.noticeId)
      if (!Number.isFinite(parsedNoticeId)) {
        return
      }

      void cancelNoticeVoteResponse(parsedNoticeId)
    }
  }, [isPreview])

  const isClosed = status === "closed"
  const canVote =
    !isPreview && !isAttached && !isClosed && (!hasEverVoted || isRevoting)
  const isInputMode = canVote
  const showResults = isAttached || isClosed || (hasEverVoted && !isRevoting)
  const leadingOptionIds = useMemo(
    () => getLeadingOptionIds(options),
    [options],
  )
  const anyViewerChoiceIsNonLeading = useMemo(
    () => viewerSelection.some((optionId) => !leadingOptionIds.has(optionId)),
    [leadingOptionIds, viewerSelection],
  )

  const toggleDraftOption = (optionId: string, checked: boolean) => {
    setDraftSelection((previous) => {
      if (checked) {
        if (!allowMultiple) {
          return [optionId]
        }
        if (previous.includes(optionId)) {
          return previous
        }
        return [...previous, optionId]
      }
      return previous.filter((id) => id !== optionId)
    })
  }

  const handleSubmitVote = async () => {
    if (draftSelection.length === 0 || isSubmittingVote) {
      return
    }

    const parsedNoticeId = Number(noticeId)
    if (!isPreview && !Number.isFinite(parsedNoticeId)) {
      return
    }

    setIsSubmittingVote(true)
    try {
      if (!isPreview) {
        await saveNoticeVoteResponse({
          noticeId: parsedNoticeId,
          optionIds: draftSelection.map((optionId) => Number(optionId)),
          hasExistingResponse: hasEverVoted,
        })
      }

      const result = applyPollVote({
        isFirstVote: !hasEverVoted,
        newSelection: draftSelection,
        options,
        participantCount,
        previousSelection: viewerSelection,
      })

      setOptions(result.options)
      setParticipantCount(result.participantCount)
      setViewerSelection(result.viewerSelection)
      setHasEverVoted(true)
      setIsRevoting(false)
    } catch (error) {
      showNoticeErrorToast(
        toast,
        getServerErrorMessage(error) ??
          "투표를 저장하지 못했어요. 잠시 후 다시 시도해주세요.",
      )
    } finally {
      setIsSubmittingVote(false)
    }
  }

  const handleStartRevote = () => {
    setDraftSelection(viewerSelection)
    setIsRevoting(true)
  }

  const handleEndPoll = () => {
    if (isEndingPoll) {
      return
    }

    setIsEndingPoll(true)
    try {
      // NOTICE-106은 공지 수정 시 투표 연결 해제용. 상세 「투표 종료」는 집계 결과를
      // 유지한 채 종료 UI만 표시한다(별도 close Command API 연동 전).
      setStatus("closed")
      setIsRevoting(false)
      endDialogFocusStore.current = null
      setEndDialogOpen(false)
    } finally {
      setIsEndingPoll(false)
    }
  }

  const canSubmitVote = draftSelection.length > 0
  const showVoteButton = isInputMode && canSubmitVote
  const showRevoteButton = !isClosed && hasEverVoted && !isRevoting
  const showEndPollButton =
    !isAttached && !isPreview && canManagePoll && !isClosed

  return (
    <>
      <article className="border-neutral-disabled flex w-[440px] max-w-full flex-col gap-(--umc-spacing-gap-20) rounded-(--umc-radius-8) border bg-white p-(--umc-spacing-padding-32)">
        <div className="flex w-full flex-col gap-(--umc-spacing-gap-10)">
          <div className="flex w-full items-center">
            {!isClosed ? (
              <Tag color="success" size="sm" variant="weak">
                진행중
              </Tag>
            ) : (
              <Tag color="neutral" size="sm" variant="weak">
                종료됨
              </Tag>
            )}
          </div>
          <div className="flex flex-col gap-(--umc-spacing-gap-4)">
            <h2 className="text-title-4-semibold text-neutral-default-900">
              {poll.title}
            </h2>
            <div className="flex items-start gap-(--umc-spacing-gap-12)">
              <p className="text-body-3-medium text-placeholder shrink-0">
                기한
              </p>
              <p className="text-body-3-regular text-neutral-default-900">
                {poll.periodLabel}
              </p>
            </div>
            <p className="text-body-3-medium text-placeholder">
              {poll.settingsLabel}
            </p>
          </div>
        </div>

        <hr className="border-neutral-disabled m-0 w-full border-0 border-t" />

        {isInputMode ? (
          <ul className="flex w-full list-none flex-col gap-(--umc-spacing-gap-16) p-0">
            {options.map((option) => (
              <li key={option.id}>
                <VoteOptionInputRow
                  checked={draftSelection.includes(option.id)}
                  label={option.label}
                  onCheckedChange={(checked) => {
                    toggleDraftOption(option.id, checked)
                  }}
                />
              </li>
            ))}
          </ul>
        ) : null}

        {showResults ? (
          <ul className="flex w-full list-none flex-col gap-(--umc-spacing-gap-16) p-0">
            {options.map((option) => (
              <VoteOptionResultRow
                anyViewerChoiceIsNonLeading={anyViewerChoiceIsNonLeading}
                isLeading={leadingOptionIds.has(option.id)}
                isViewerChoice={viewerSelection.includes(option.id)}
                key={option.id}
                option={option}
                progressPercent={getVoteOptionProgressPercent(option, options)}
              />
            ))}
          </ul>
        ) : null}

        {!isAttached &&
        !isClosed &&
        (showVoteButton || showRevoteButton || showEndPollButton) ? (
          <div className="flex flex-wrap items-start gap-(--umc-spacing-gap-12)">
            {showVoteButton ? (
              <Button
                color="brand"
                disabled={isSubmittingVote}
                isLoading={isSubmittingVote}
                onClick={() => {
                  void handleSubmitVote()
                }}
                size="xs"
                type="button"
                variant="weak"
              >
                투표하기
              </Button>
            ) : null}
            {showRevoteButton ? (
              <Button
                color="white"
                onClick={handleStartRevote}
                size="xs"
                type="button"
                variant="fill"
                disabled={false}
                isLoading={false}
              >
                다시 투표하기
              </Button>
            ) : null}
            {showEndPollButton ? (
              <Button
                color="white"
                onClick={() => {
                  captureNoticeDialogFocus(endDialogFocusStore)
                  setEndDialogOpen(true)
                }}
                size="xs"
                type="button"
                variant="fill"
                disabled={false}
                isLoading={false}
              >
                투표 종료
              </Button>
            ) : null}
          </div>
        ) : null}

        <p className="text-caption-1-regular text-placeholder">
          {Number(participantCount)}명 참여
        </p>
      </article>

      {endDialogOpen ? <NoticeDialogDimmed intensity="medium" /> : null}
      <Dialog
        cancelLabel="취소"
        color="brand"
        confirmLabel="종료하기"
        description="지금까지 참여한 결과만 집계되어 종료돼요"
        onConfirm={() => {
          void handleEndPoll()
        }}
        onOpenChange={(open) => {
          if (isEndingPoll) {
            return
          }
          setEndDialogOpen(open)
          if (!open) {
            restoreNoticeDialogFocus(endDialogFocusStore)
          }
        }}
        open={endDialogOpen}
        title="투표를 종료할까요?"
      />
    </>
  )
}
