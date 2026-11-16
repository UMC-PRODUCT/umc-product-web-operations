import { queryOptions } from "@tanstack/react-query"

import {
  buildGisuGenerationLookup,
  gisuListQueryOptions,
} from "@/entities/gisu"
import {
  gisuOrganizationQueryOptions,
  toOrganizationLists,
} from "@/entities/organization"

import { listNotices, searchNotices } from "../api/notices-query.api"
import {
  buildNoticeListRequest,
  filterStaffNoticeSummariesByRecipient,
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
import { noticeKeys } from "./notice-keys"
import { canAccessStaffNoticeTab } from "./notice-notice-tab"

import type { QueryClient } from "@tanstack/react-query"

import type { GisuListItem } from "@/entities/gisu"

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

async function fetchNoticeListSummariesPage(
  request: NoticeListRequest,
  page: number,
) {
  if (request.kind === "search") {
    return searchNotices({ ...request.params, page })
  }

  return listNotices({ ...request.params, page })
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

  return noticeKeys.list([
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
  ])
}

export async function fetchNoticeListPage(input: {
  audience: NoticeAudience
  filters: NoticeListQueryFilterFields
  page: number
  queryClient: QueryClient
  session: NoticeOperatorSession
}): Promise<NoticeListQueryResult> {
  if (input.audience === "staff" && !canAccessStaffNoticeTab(input.session)) {
    return { kind: "forbidden" }
  }

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
  const listFiltersActive =
    request.params.chapterId != null ||
    request.params.schoolId != null ||
    request.params.part != null ||
    apiFilters.staffRecipient != null

  try {
    const sessionGisuId = input.session.gisuId
    if (sessionGisuId == null) {
      return { kind: "missing_gisu" }
    }

    const [page, gisuList, organizationGisu] = await Promise.all([
      fetchNoticeListSummariesPage(request, input.page),
      input.queryClient
        .ensureQueryData(gisuListQueryOptions())
        .catch((): GisuListItem[] => []),
      input.queryClient
        .ensureQueryData(gisuOrganizationQueryOptions(sessionGisuId))
        .catch(() => null),
    ])
    const organization = toOrganizationLists(organizationGisu)
    const gisuGenerationById = buildGisuGenerationLookup(gisuList)
    const { chapterNameById, schoolNameById } =
      buildNoticeOrganizationNameLookup(organization)
    const targetDisplayContext = {
      chapterNameById,
      gisuGenerationById,
      schoolNameById,
    }

    // chapter/school/part는 서버 필터. 받는 사람(staffRecipient)만 API 미지원이라 현재 페이지에 클라이언트 필터 적용.
    let content = page.content
    if (input.audience === "staff" && apiFilters.staffRecipient != null) {
      content = filterStaffNoticeSummariesByRecipient(
        content,
        apiFilters.staffRecipient,
      )
    }

    const totalElements = Number(page.totalElements) || 0
    const totalPages =
      Number(page.totalPages) ||
      (totalElements > 0 ? Math.ceil(totalElements / NOTICE_LIST_PAGE_SIZE) : 0)

    return {
      kind: "success",
      notices: content.map((summary) =>
        mapNoticeSummaryForListPage(
          summary,
          targetDisplayContext,
          sessionGisuId,
          listFiltersActive,
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
    queryFn: ({ client }) =>
      fetchNoticeListPage({ ...input, queryClient: client }),
  })
}

/** 상세 조회 후 목록 캐시의 조회수를 API 응답과 맞춤 */
export function syncNoticeViewCountInListCaches(
  queryClient: QueryClient,
  noticeId: string,
  views: number,
) {
  queryClient.setQueriesData<NoticeListQueryResult>(
    { queryKey: noticeKeys.lists() },
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

  void queryClient.invalidateQueries({ queryKey: noticeKeys.lists() })
}
