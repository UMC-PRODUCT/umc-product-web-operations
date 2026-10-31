import {
  getComparableVoteDateTime,
  isVoteDraftSubmittable,
  VOTE_DATETIME_REQUIRED_ERROR,
  VOTE_END_AFTER_START_ERROR,
  VOTE_SUBMIT_INVALID_ERROR,
} from "./notice-create-vote-validation"

import type { AddNoticeVoteRequest } from "../api/notice-api.types"
import type { NoticeCreateVoteDraft } from "./notice-create-vote-draft"

export function validateNoticeCreateVoteForSubmit(
  draft: NoticeCreateVoteDraft,
): string | null {
  if (!isVoteDraftSubmittable(draft)) {
    return VOTE_SUBMIT_INVALID_ERROR
  }
  if (draft.startDate == null || draft.endDate == null) {
    return VOTE_DATETIME_REQUIRED_ERROR
  }

  const start = getComparableVoteDateTime(draft.startDate, draft.startTime)
  const end = getComparableVoteDateTime(draft.endDate, draft.endTime)
  if (start == null || end == null) {
    return VOTE_DATETIME_REQUIRED_ERROR
  }
  if (!start.isBefore(end)) {
    return VOTE_END_AFTER_START_ERROR
  }

  return null
}

export function buildAddNoticeVoteRequest(
  draft: NoticeCreateVoteDraft,
): AddNoticeVoteRequest {
  const validationMessage = validateNoticeCreateVoteForSubmit(draft)
  if (validationMessage != null) {
    throw new Error(validationMessage)
  }

  const start = getComparableVoteDateTime(draft.startDate, draft.startTime)!
  const end = getComparableVoteDateTime(draft.endDate, draft.endTime)!

  return {
    allowMultipleChoice: draft.allowMultiple,
    endsAtExclusive: end.toISOString(),
    isAnonymous: draft.isAnonymous,
    options: draft.options.map((option) => option.trim()),
    startsAt: start.toISOString(),
    title: draft.title.trim(),
  }
}
