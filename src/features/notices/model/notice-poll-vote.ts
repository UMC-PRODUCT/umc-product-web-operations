import type { NoticePollOption } from "./notice-detail.types"

function toVoteCount(value: number | string | undefined): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export function getLeadingOptionIds(options: NoticePollOption[]): Set<string> {
  if (options.length === 0) {
    return new Set()
  }

  const counts = options.map((option) => toVoteCount(option.voteCount))
  const maxVotes = Math.max(...counts)
  return new Set(
    options
      .filter((_, index) => counts[index] === maxVotes)
      .map((option) => option.id),
  )
}

export function getVoteOptionProgressPercent(
  option: NoticePollOption,
  options: NoticePollOption[],
): number {
  const totalVotes = options.reduce(
    (sum, item) => sum + toVoteCount(item.voteCount),
    0,
  )
  if (totalVotes === 0) {
    return 0
  }
  return Math.round((toVoteCount(option.voteCount) / totalVotes) * 100)
}

export function recomputePollPercents(
  options: NoticePollOption[],
): NoticePollOption[] {
  const totalVotes = options.reduce(
    (sum, option) => sum + toVoteCount(option.voteCount),
    0,
  )

  if (totalVotes === 0) {
    return options.map((option) => ({ ...option, progressPercent: 0 }))
  }

  return options.map((option) => ({
    ...option,
    progressPercent: getVoteOptionProgressPercent(option, options),
  }))
}

type ApplyPollVoteInput = {
  isFirstVote: boolean
  newSelection: string[]
  options: NoticePollOption[]
  participantCount: number
  previousSelection: string[]
}

export function applyPollVote({
  isFirstVote,
  newSelection,
  options,
  participantCount,
  previousSelection,
}: ApplyPollVoteInput) {
  const nextOptions = options.map((option) => ({
    ...option,
    isSelected: false,
    voteCount: toVoteCount(option.voteCount),
  }))

  if (!isFirstVote) {
    for (const optionId of previousSelection) {
      const option = nextOptions.find((item) => item.id === optionId)
      if (option) {
        option.voteCount = Math.max(0, option.voteCount - 1)
      }
    }
  }

  for (const optionId of newSelection) {
    const option = nextOptions.find((item) => item.id === optionId)
    if (option) {
      option.voteCount += 1
      option.isSelected = true
    }
  }

  const baseParticipants = toVoteCount(participantCount)
  const nextParticipantCount = isFirstVote
    ? baseParticipants + 1
    : baseParticipants

  return {
    options: recomputePollPercents(nextOptions),
    participantCount: nextParticipantCount,
    viewerSelection: newSelection,
  }
}

export function getInitialViewerSelection(
  options: NoticePollOption[],
): string[] {
  return options
    .filter((option) => option.isSelected)
    .map((option) => option.id)
}

export function applyPollVoteCancel(input: {
  options: NoticePollOption[]
  participantCount: number
  previousSelection: string[]
}) {
  const adjusted = applyPollVote({
    isFirstVote: false,
    newSelection: [],
    options: input.options,
    participantCount: input.participantCount,
    previousSelection: input.previousSelection,
  })

  return {
    ...adjusted,
    participantCount: Math.max(0, input.participantCount - 1),
    viewerSelection: [] as string[],
  }
}

/** 다시 투표하기 중 전부 해제한 뒤 페이지를 떠날 때 서버에 취소 요청 */
export function shouldCancelNoticeVoteOnLeave(input: {
  draftSelection: string[]
  hasEverVoted: boolean
  isRevoting: boolean
  viewerSelection: string[]
}): boolean {
  return (
    input.isRevoting &&
    input.hasEverVoted &&
    input.viewerSelection.length > 0 &&
    input.draftSelection.length === 0
  )
}
