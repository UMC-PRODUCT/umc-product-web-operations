import { queryOptions } from "@tanstack/react-query"

import { listNotices, searchNotices } from "../api/notices-query.api"
import {
  buildNoticeListRequest,
  NOTICE_LIST_PAGE_SIZE,
} from "./build-notice-list-params"
import { mapNoticeSummaryToNotice } from "./map-notice-from-api"
import {
  isNoticeForbiddenError,
  isNoticeNetworkError,
} from "./notice-api-error"

import type { QueryClient } from "@tanstack/react-query"

import type { NoticeOperatorSession } from "./notice-session"
import type { NoticeAudience, NoticeListFilters } from "./types"

export type NoticeListQueryResult =
  | {
      kind: "success"
      notices: ReturnType<typeof mapNoticeSummaryToNotice>[]
      totalElements: number
      totalPages: number
    }
  | { kind: "forbidden" }
  | { kind: "network_error" }
  | { kind: "missing_gisu" }

export function noticeListQueryKey(input: {
  audience: NoticeAudience
  filters: Pick<NoticeListFilters, "query" | "scope" | "part" | "scopeStage">
  page: number
  session: Pick<NoticeOperatorSession, "gisuId" | "id">
}) {
  return [
    "notices",
    "list",
    input.session.id,
    input.session.gisuId,
    input.audience,
    input.page,
    input.filters.query,
    input.filters.scopeStage,
    input.filters.scope,
    input.filters.part,
  ] as const
}

export async function fetchNoticeListPage(input: {
  audience: NoticeAudience
  filters: Pick<NoticeListFilters, "query" | "scope" | "part" | "scopeStage">
  page: number
  session: NoticeOperatorSession
}): Promise<NoticeListQueryResult> {
  const request = buildNoticeListRequest({
    audience: input.audience,
    filters: input.filters,
    page: input.page,
    session: input.session,
  })
  if (!request) {
    return { kind: "missing_gisu" }
  }

  try {
    const page =
      request.kind === "search"
        ? await searchNotices(request.params)
        : await listNotices(request.params)

    const totalElements = Number(page.totalElements) || 0
    const totalPages =
      Number(page.totalPages) ||
      (totalElements > 0 ? Math.ceil(totalElements / NOTICE_LIST_PAGE_SIZE) : 0)

    return {
      kind: "success",
      notices: page.content.map(mapNoticeSummaryToNotice),
      totalElements,
      totalPages,
    }
  } catch (error) {
    if (isNoticeForbiddenError(error)) {
      return { kind: "forbidden" }
    }
    if (isNoticeNetworkError(error)) {
      return { kind: "network_error" }
    }
    throw error
  }
}

export function noticeListQueryOptions(input: {
  audience: NoticeAudience
  filters: Pick<NoticeListFilters, "query" | "scope" | "part" | "scopeStage">
  page: number
  session: NoticeOperatorSession
}) {
  return queryOptions({
    queryKey: noticeListQueryKey(input),
    queryFn: () => fetchNoticeListPage(input),
  })
}

/** 상세 조회 후 목록 캐시의 조회수를 API 응답과 맞춤 */
export function syncNoticeViewCountInListCaches(
  queryClient: QueryClient,
  noticeId: string,
  views: number,
) {
  queryClient.setQueriesData<NoticeListQueryResult>(
    { queryKey: ["notices", "list"] },
    (cached) => {
      if (!cached || cached.kind !== "success") {
        return cached
      }

      let changed = false
      const notices = cached.notices.map((notice) => {
        if (notice.id !== noticeId) {
          return notice
        }

        if (notice.views === views) {
          return notice
        }

        changed = true
        return { ...notice, views }
      })

      if (!changed) {
        return cached
      }

      return { ...cached, notices }
    },
  )

  void queryClient.invalidateQueries({ queryKey: ["notices", "list"] })
}
