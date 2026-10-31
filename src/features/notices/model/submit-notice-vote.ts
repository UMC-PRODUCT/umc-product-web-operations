import { getServerErrorCode } from "@/shared/api/server-error"

import {
  submitNoticeVoteResponse,
  updateNoticeVoteResponse,
} from "../api/notices-vote.api"

export async function saveNoticeVoteResponse(input: {
  noticeId: number
  optionIds: number[]
  hasExistingResponse: boolean
}): Promise<void> {
  const body = { optionIds: input.optionIds }

  if (input.hasExistingResponse) {
    await updateNoticeVoteResponse(input.noticeId, body)
    return
  }

  if (input.optionIds.length === 0) {
    return
  }

  try {
    await submitNoticeVoteResponse(input.noticeId, body)
  } catch (error) {
    if (getServerErrorCode(error) === "FORM_RESPONSE_ALREADY_EXISTS") {
      await updateNoticeVoteResponse(input.noticeId, body)
      return
    }
    throw error
  }
}

/** NOTICE-VOTE PUT — 빈 optionIds로 응답 취소 */
export async function cancelNoticeVoteResponse(
  noticeId: number,
): Promise<void> {
  await updateNoticeVoteResponse(noticeId, { optionIds: [] })
}
