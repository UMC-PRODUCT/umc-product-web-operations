import { formatNoticeVotePeriod } from "./format-notice-date"
import { getComparableVoteDateTime } from "./notice-create-vote-validation"

import type { NoticeCreateVoteDraft } from "./notice-create-vote-draft"
import type { NoticePoll } from "./notice-detail.types"

const NOTICE_CREATE_VOTE_PREVIEW_POLL_ID = "notice-create-vote-preview"

export function formatNoticeCreateVotePeriodLabel(
  draft: Pick<
    NoticeCreateVoteDraft,
    "endDate" | "endTime" | "startDate" | "startTime"
  >,
): string {
  const start = getComparableVoteDateTime(draft.startDate, draft.startTime)
  const end = getComparableVoteDateTime(draft.endDate, draft.endTime)
  if (start != null && end != null) {
    return formatNoticeVotePeriod(start.toISOString(), end.toISOString())
  }
  return "기한 미설정"
}

export function mapNoticeCreateVoteDraftToPoll(
  draft: NoticeCreateVoteDraft,
): NoticePoll {
  const settings: string[] = [
    draft.allowMultiple ? "복수선택" : "단일선택",
    draft.isAnonymous ? "익명투표" : "기명투표",
  ]

  return {
    id: NOTICE_CREATE_VOTE_PREVIEW_POLL_ID,
    options: draft.options.map((label, index) => ({
      id: String(index + 1),
      label: label.trim(),
      progressPercent: 0,
      voteCount: 0,
    })),
    participantCount: 0,
    periodLabel: formatNoticeCreateVotePeriodLabel(draft),
    settingsLabel: settings.join(" · "),
    status: "in_progress",
    title: draft.title.trim(),
  }
}
