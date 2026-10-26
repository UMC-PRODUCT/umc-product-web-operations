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

import { deleteNoticeVoteByNoticeId } from "../model/delete-notice-vote"
import {
  applyPollVote,
  getInitialViewerSelection,
  getLeadingOptionIds,
  shouldCancelNoticeVoteOnLeave,
} from "../model/notice-poll-vote"
import {
  cancelNoticeVoteResponse,
  saveNoticeVoteResponse,
} from "../model/submit-notice-vote"
import { showNoticeErrorToast } from "./show-notice-error-toast"

import type { NoticePoll, NoticePollOption } from "../model/notice-detail.types"

type NoticeDetailVoteCardProps = {
  canManagePoll?: boolean
  noticeId: string
  poll: NoticePoll
}

function formatVoteCount(count: number) {
  return `${count}명`
}

function isMultipleChoicePoll(poll: NoticePoll) {
  return poll.settingsLabel.includes("복수선택")
}

type VoteOptionInputRowProps = {
  checked: boolean
  disabled?: boolean
  label: string
  onCheckedChange: (checked: boolean) => void
}

function VoteOptionInputRow({
  checked,
  disabled = false,
  label,
  onCheckedChange,
}: VoteOptionInputRowProps) {
  return (
    <Checkbox
      checked={checked}
      color={checked ? "brand" : "neutral"}
      disabled={disabled}
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
  isLeading: boolean
  isViewerChoice: boolean
  option: NoticePollOption
}

function VoteOptionResultRow({
  isLeading,
  isViewerChoice,
  option,
}: VoteOptionResultRowProps) {
  return (
    <li className="flex w-full flex-col gap-(--umc-spacing-gap-6)">
      <div className="flex w-full items-center justify-between gap-(--umc-spacing-gap-8)">
        <div className="flex min-h-6 min-w-0 items-center gap-(--umc-spacing-gap-4)">
          {isViewerChoice ? (
            <Checkbox
              aria-hidden
              checked
              className="pointer-events-none shrink-0"
              color={isLeading ? "brand" : "neutral"}
              disabled
              size="md"
              invalid={false}
              defaultChecked
            />
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
        aria-label={`${option.label} ${option.progressPercent}%`}
        color={isLeading ? "brand" : "neutral"}
        max={100}
        size="lg"
        value={option.progressPercent}
      />
    </li>
  )
}

export function NoticeDetailVoteCard({
  canManagePoll = false,
  noticeId,
  poll,
}: NoticeDetailVoteCardProps) {
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
  }, [])

  const isClosed = status === "closed"
  const isInputMode = !isClosed && (!hasEverVoted || isRevoting)
  const showResults = isClosed || (hasEverVoted && !isRevoting)
  const leadingOptionIds = useMemo(
    () => getLeadingOptionIds(options),
    [options],
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
    if (!Number.isFinite(parsedNoticeId)) {
      return
    }

    setIsSubmittingVote(true)
    try {
      await saveNoticeVoteResponse({
        noticeId: parsedNoticeId,
        optionIds: draftSelection.map((optionId) => Number(optionId)),
        hasExistingResponse: hasEverVoted,
      })

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

  const handleEndPoll = async () => {
    if (isEndingPoll) {
      return
    }

    const parsedNoticeId = Number(noticeId)
    if (!Number.isFinite(parsedNoticeId)) {
      return
    }

    setIsEndingPoll(true)
    try {
      await deleteNoticeVoteByNoticeId(parsedNoticeId)
      setStatus("closed")
      setIsRevoting(false)
      setEndDialogOpen(false)
    } catch (error) {
      showNoticeErrorToast(
        toast,
        getServerErrorMessage(error) ??
          "투표를 종료하지 못했어요. 잠시 후 다시 시도해주세요.",
      )
    } finally {
      setIsEndingPoll(false)
    }
  }

  const canSubmitVote = draftSelection.length > 0
  const showVoteButton = isInputMode && canSubmitVote
  const showRevoteButton = !isClosed && hasEverVoted && !isRevoting
  const showEndPollButton = canManagePoll && !isClosed

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
                isLeading={leadingOptionIds.has(option.id)}
                isViewerChoice={viewerSelection.includes(option.id)}
                key={option.id}
                option={option}
              />
            ))}
          </ul>
        ) : null}

        {!isClosed &&
        (showVoteButton || showRevoteButton || showEndPollButton) ? (
          <div className="flex flex-wrap items-start gap-(--umc-spacing-gap-12)">
            {showVoteButton ? (
              <Button
                color="primary"
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
          {participantCount}명 참여
        </p>
      </article>

      <Dialog
        cancelLabel="취소"
        color="brand"
        confirmLabel="종료하기"
        description="지금까지 참여한 결과만 집계되어 종료돼요"
        onConfirm={() => {
          void handleEndPoll()
        }}
        onOpenChange={(open) => {
          if (!isEndingPoll) {
            setEndDialogOpen(open)
          }
        }}
        open={endDialogOpen}
        title="투표를 종료할까요?"
      />
    </>
  )
}
