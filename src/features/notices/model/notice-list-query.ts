import { queryOptions } from "@tanstack/react-query"

import { fetchGisuList } from "@/shared/api/gisu-list"

import { listNotices, searchNotices } from "../api/notices-query.api"
import {
  applyChallengerNoticeListClientFilters,
  applyStaffNoticeListClientFilters,
  buildNoticeListRequest,
  normalizeNoticeListFiltersForApi,
  NOTICE_LIST_PAGE_SIZE,
  resolveNoticeListNoticeTab,
} from "./build-notice-list-params"
import { buildNoticeOrganizationNameLookup } from "./map-gisu-organization"
import { mapNoticeSummaryToNotice } from "./map-notice-from-api"
import {
  isNoticeForbiddenError,
  isNoticeNetworkError,
} from "./notice-api-error"
import { buildGisuGenerationLookup } from "./notice-gisu-generation"
import { fetchNoticeListOrganizationOptions } from "./notice-list-organization-query"

import type { QueryClient } from "@tanstack/react-query"

import type { GetNoticeSummaryResponse } from "../api/notice-api.types"
import type { NoticeListRequest } from "./build-notice-list-params"
import type { NoticeTargetDisplayContext } from "./map-notice-from-api"
import type { NoticeOperatorSession } from "./notice-session"
import type { NoticeAudience, NoticeListQueryFilterFields } from "./types"

const noticeListTargetLabelByKey = new Map<string, string>()

function noticeTargetLabelCacheKey(gisuId: number, noticeId: string) {
  return `${gisuId}:${noticeId}`
}

function mapNoticeSummaryForListPage(
  summary: GetNoticeSummaryResponse,
  context: NoticeTargetDisplayContext,
  gisuId: number,
  listFiltersActive: boolean,
) {
  const notice = mapNoticeSummaryToNotice(summary, context)
  const cacheKey = noticeTargetLabelCacheKey(gisuId, notice.id)

  if (!listFiltersActive) {
    noticeListTargetLabelByKey.set(cacheKey, notice.target)
    return notice
  }

  const cachedTarget = noticeListTargetLabelByKey.get(cacheKey)
  if (cachedTarget != null) {
    return { ...notice, target: cachedTarget }
  }

  noticeListTargetLabelByKey.set(cacheKey, notice.target)
  return notice
}

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

function needsNoticeListClientSidePagination(
  audience: NoticeAudience,
  apiFilters: ReturnType<typeof normalizeNoticeListFiltersForApi>,
): boolean {
  if (audience === "challenger") {
    return (
      apiFilters.chapterScope != null ||
      apiFilters.schoolScope != null ||
      apiFilters.part != null
    )
  }

  return apiFilters.staffRecipient != null || apiFilters.scopeStage != null
}

async function fetchNoticeListSummariesPage(
  request: NoticeListRequest,
  page: number,
) {
  if (request.kind === "search") {
    return searchNotices({ ...request.params, page })
  }

  return listNotices({ ...request.params, page })
}

async function fetchAllNoticeListSummaries(
  request: NoticeListRequest,
): Promise<GetNoticeSummaryResponse[]> {
  const firstPage = await fetchNoticeListSummariesPage(request, 0)
  const summaries = [...firstPage.content]
  const totalPages = Number(firstPage.totalPages) || 1

  for (let page = 1; page < totalPages; page++) {
    const nextPage = await fetchNoticeListSummariesPage(request, page)
    summaries.push(...nextPage.content)
  }

  return summaries
}

function paginateNoticeListSummaries(
  content: GetNoticeSummaryResponse[],
  page: number,
): {
  pageContent: GetNoticeSummaryResponse[]
  totalElements: number
  totalPages: number
} {
  const totalElements = content.length
  const totalPages =
    totalElements > 0 ? Math.ceil(totalElements / NOTICE_LIST_PAGE_SIZE) : 0
  const start = page * NOTICE_LIST_PAGE_SIZE

  return {
    pageContent: content.slice(start, start + NOTICE_LIST_PAGE_SIZE),
    totalElements,
    totalPages,
  }
}

export function noticeListQueryKey(input: {
  audience: NoticeAudience
  filters: NoticeListQueryFilterFields
  page: number
  session: Pick<
    NoticeOperatorSession,
    "gisuId" | "id" | "isSuperAdmin" | "roleTypes"
  >
}) {
  const apiFilters = normalizeNoticeListFiltersForApi({
    audience: input.audience,
    filters: input.filters,
  })
  const noticeTab = resolveNoticeListNoticeTab(input.audience, input.session)

  return [
    "notices",
    "list",
    input.session.id,
    input.session.gisuId,
    input.audience,
    input.page,
    noticeTab,
    apiFilters.query,
    apiFilters.chapterScope,
    apiFilters.schoolScope,
    apiFilters.part,
    apiFilters.scopeStage,
    apiFilters.scope,
    apiFilters.staffRecipient,
  ] as const
}

export async function fetchNoticeListPage(input: {
  audience: NoticeAudience
  filters: NoticeListQueryFilterFields
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

  const apiFilters = normalizeNoticeListFiltersForApi({
    audience: input.audience,
    filters: input.filters,
  })
  const useClientSidePagination = needsNoticeListClientSidePagination(
    input.audience,
    apiFilters,
  )

  try {
    const listRequest = useClientSidePagination
      ? buildNoticeListRequest({
          audience: input.audience,
          filters: input.filters,
          page: 0,
          session: input.session,
        })
      : request

    if (!listRequest) {
      return { kind: "missing_gisu" }
    }

    const [page, gisuList, organization] = await Promise.all([
      useClientSidePagination
        ? fetchAllNoticeListSummaries(listRequest).then((summaries) => ({
            content: summaries,
            totalElements: summaries.length,
            totalPages: 1,
          }))
        : fetchNoticeListSummariesPage(listRequest, input.page),
      fetchGisuList().catch(
        () => [] as Awaited<ReturnType<typeof fetchGisuList>>,
      ),
      fetchNoticeListOrganizationOptions(input.session.gisuId).catch(
        () =>
          ({
            chapters: [],
            schools: [],
          }) satisfies Awaited<
            ReturnType<typeof fetchNoticeListOrganizationOptions>
          >,
      ),
    ])
    const gisuGenerationById = buildGisuGenerationLookup(gisuList)
    const { chapterNameById, schoolNameById } =
      buildNoticeOrganizationNameLookup(organization)
    const targetDisplayContext = {
      chapterNameById,
      gisuGenerationById,
      schoolNameById,
    }

    let content = page.content
    if (input.audience === "staff") {
      content = applyStaffNoticeListClientFilters(content, apiFilters)
    } else {
      content = applyChallengerNoticeListClientFilters(content, apiFilters)
    }

    let totalElements = Number(page.totalElements) || 0
    let totalPages =
      Number(page.totalPages) ||
      (totalElements > 0 ? Math.ceil(totalElements / NOTICE_LIST_PAGE_SIZE) : 0)

    if (useClientSidePagination) {
      const paginated = paginateNoticeListSummaries(content, input.page)
      content = paginated.pageContent
      totalElements = paginated.totalElements
      totalPages = paginated.totalPages
    }

    const gisuId = input.session.gisuId!

    return {
      kind: "success",
      notices: content.map((summary) =>
        mapNoticeSummaryForListPage(
          summary,
          targetDisplayContext,
          gisuId,
          useClientSidePagination,
        ),
      ),
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
  filters: NoticeListQueryFilterFields
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
