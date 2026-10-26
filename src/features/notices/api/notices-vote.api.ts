import { api } from "@/shared/api/client"
import { unwrapApiResult } from "@/shared/api/unwrap-api-result"

export type SubmitNoticeVoteResponseRequest = {
  optionIds: number[]
}

export async function submitNoticeVoteResponse(
  noticeId: number,
  body: SubmitNoticeVoteResponseRequest,
): Promise<void> {
  const { data } = await api.post<unknown>(
    `/v1/notices/${noticeId}/votes/responses`,
    body,
  )
  if (data !== null && data !== undefined && data !== "") {
    unwrapApiResult<null>(data)
  }
}

/** NOTICE-VOTE: 기존 응답 수정·취소(빈 `optionIds`) */
export async function updateNoticeVoteResponse(
  noticeId: number,
  body: SubmitNoticeVoteResponseRequest,
): Promise<void> {
  const { data } = await api.put<unknown>(
    `/v1/notices/${noticeId}/votes/responses`,
    body,
  )
  if (data !== null && data !== undefined && data !== "") {
    unwrapApiResult<null>(data)
  }
}
