import { queryOptions } from "@tanstack/react-query"

import { getNoticeDetail } from "../api/notices-query.api"
import { noticeKeys } from "./notice-keys"

import type { GetNoticeDetailResponse } from "../api/notice-api.types"

export function noticeDetailQueryKey(noticeId: number) {
  return noticeKeys.detail(noticeId)
}

export function noticeDetailQueryOptions(noticeId: number) {
  return queryOptions({
    queryKey: noticeDetailQueryKey(noticeId),
    queryFn: (): Promise<GetNoticeDetailResponse> => getNoticeDetail(noticeId),
  })
}
