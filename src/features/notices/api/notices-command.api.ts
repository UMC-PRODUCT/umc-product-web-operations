import { api } from "@/shared/api/client"
import { unwrapApiResult } from "@/shared/api/unwrap-api-result"

export async function deleteNotice(noticeId: number): Promise<void> {
  const { data } = await api.delete<unknown>(`/v1/notices/${noticeId}`)
  if (data !== null && data !== undefined && data !== "") {
    unwrapApiResult<null>(data)
  }
}

/** NOTICE-106 — 공지에 연결된 투표 삭제(운영 UI: 투표 종료) */
export async function deleteNoticeVote(noticeId: number): Promise<void> {
  const { data } = await api.delete<unknown>(`/v1/notices/${noticeId}/vote`)
  if (data !== null && data !== undefined && data !== "") {
    unwrapApiResult<null>(data)
  }
}
