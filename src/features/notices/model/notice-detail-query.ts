import { queryOptions } from "@tanstack/react-query"

import { getNoticeDetail } from "../api/notices-query.api"

import type { GetNoticeDetailResponse } from "../api/notice-api.types"

export function noticeDetailQueryKey(noticeId: number) {
  return ["notices", "detail", noticeId] as const
}

export function noticeDetailQueryOptions(noticeId: number) {
  return queryOptions({
    queryKey: noticeDetailQueryKey(noticeId),
    queryFn: (): Promise<GetNoticeDetailResponse> => getNoticeDetail(noticeId),
  })
}
