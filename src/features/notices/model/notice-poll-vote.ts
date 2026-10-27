import type { NoticePollOption } from "./notice-detail.types"

export function getLeadingOptionIds(options: NoticePollOption[]): Set<string> {
  if (options.length === 0) {
    return new Set()
  }

  const maxVotes = Math.max(...options.map((option) => option.voteCount))
  return new Set(
    options
      .filter((option) => option.voteCount === maxVotes)
      .map((option) => option.id),
  )
}

export function recomputePollPercents(
  options: NoticePollOption[],
): NoticePollOption[] {
  const totalVotes = options.reduce((sum, option) => sum + option.voteCount, 0)

  if (totalVotes === 0) {
    return options.map((option) => ({ ...option, progressPercent: 0 }))
  }

  return options.map((option) => ({
    ...option,
    progressPercent: Math.round((option.voteCount / totalVotes) * 100),
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

  const nextParticipantCount = isFirstVote
    ? participantCount + 1
    : participantCount

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
