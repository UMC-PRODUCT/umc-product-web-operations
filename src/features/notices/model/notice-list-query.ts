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
  filterStaffNoticeSummariesByAllSchoolsTarget,
  filterStaffNoticeSummariesByRecipient,
  normalizeNoticeListFiltersForApi,
  NOTICE_LIST_PAGE_SIZE,
  paginateNoticeListSummaries,
  resolveNoticeListNoticeTab,
} from "./build-notice-list-params"
import { buildNoticeOrganizationNameLookup } from "./map-gisu-organization"
import { mapNoticeSummaryToNotice } from "./map-notice-from-api"
import {
  isNoticeForbiddenError,
  isNoticeNetworkError,
} from "./notice-api-error"
import {
  type ChallengerListScopeFilters,
  challengerListScopeNeedsClientAndFilter,
  filterChallengerNoticeSummariesByScope,
  prepareNoticeListRequestForChallengerClientFilter,
  shouldStripPartFromChallengerListRequest,
} from "./notice-challenger-list-scope-filter"
import {
  type ChapterPresidentChallengerListScope,
  filterChallengerNoticeSummariesForChapterPresident,
  filterStaffNoticeSummariesForChapterPresident,
  filterStaffNoticeSummariesForChapterPresidentRecipient,
} from "./notice-chapter-president-access"
import { noticeKeys } from "./notice-keys"
import { canAccessStaffNoticeTab } from "./notice-notice-tab"
import { NOTICE_LIST_STAFF_SCOPE_ALL_SCHOOLS } from "./notice-scope-stage"

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

  if (!listFiltersActive) {
    const cacheKey = noticeTargetLabelCacheKey(gisuId, notice.id)
    noticeListTargetLabelByKey.set(cacheKey, notice.target)
  }

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
  chapterPresidentChallengerListScope?: ChapterPresidentChallengerListScope | null
  chapterPresidentStaffListActive?: boolean
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
    input.filters.scopeStage === NOTICE_LIST_STAFF_SCOPE_ALL_SCHOOLS,
    input.chapterPresidentChallengerListScope?.chapterId ?? null,
    input.chapterPresidentStaffListActive === true,
  ])
}

export async function fetchNoticeListPage(input: {
  audience: NoticeAudience
  filters: NoticeListQueryFilterFields
  page: number
  chapterPresidentChallengerListScope?: ChapterPresidentChallengerListScope | null
  chapterPresidentStaffListActive?: boolean
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

    const staffRecipientClientFilter =
      input.audience === "staff" && input.filters.staffRecipient != null
    const allSchoolsTargetClientFilter =
      input.audience === "staff" &&
      input.filters.scopeStage === NOTICE_LIST_STAFF_SCOPE_ALL_SCHOOLS
    const challengerListScope: ChallengerListScopeFilters = {
      chapterId: request.params.chapterId ?? null,
      schoolId: request.params.schoolId ?? null,
      part: request.params.part ?? null,
    }
    const chapterPresidentChallengerViewFilter =
      input.audience === "challenger" &&
      input.chapterPresidentChallengerListScope != null
    const chapterPresidentStaffListActive =
      input.audience === "staff" &&
      input.chapterPresidentStaffListActive === true
    const chapterPresidentStaffViewFilter = chapterPresidentStaffListActive
    const challengerScopeClientFilter =
      input.audience === "challenger" &&
      challengerListScopeNeedsClientAndFilter(challengerListScope) &&
      (!chapterPresidentChallengerViewFilter ||
        shouldStripPartFromChallengerListRequest(challengerListScope))
    const needsFullListClientFilter =
      staffRecipientClientFilter ||
      allSchoolsTargetClientFilter ||
      challengerScopeClientFilter ||
      chapterPresidentChallengerViewFilter ||
      chapterPresidentStaffViewFilter

    const [gisuList, organizationGisu] = await Promise.all([
      input.queryClient
        .ensureQueryData(gisuListQueryOptions())
        .catch((): GisuListItem[] => []),
      input.queryClient
        .ensureQueryData(gisuOrganizationQueryOptions(sessionGisuId))
        .catch(() => null),
    ])

    let content: GetNoticeSummaryResponse[] = []
    let totalElements = 0
    let totalPages = 0

    const challengerScopeForFilter: ChallengerListScopeFilters = {
      ...challengerListScope,
      chapterSchoolIds:
        challengerListScope.chapterId != null && organizationGisu != null
          ? (
              toOrganizationLists(organizationGisu).schoolsByChapterId.get(
                challengerListScope.chapterId,
              ) ?? []
            ).map((school) => school.schoolId)
          : undefined,
    }

    const listRequestForFetch =
      input.audience === "challenger" &&
      needsFullListClientFilter &&
      shouldStripPartFromChallengerListRequest(challengerListScope)
        ? prepareNoticeListRequestForChallengerClientFilter(
            request,
            challengerListScope,
          )
        : request

    if (needsFullListClientFilter) {
      const allSummaries: GetNoticeSummaryResponse[] = []
      let serverPage = 0
      let serverTotalPages = 1

      do {
        const pageResult = await fetchNoticeListSummariesPage(
          listRequestForFetch,
          serverPage,
        )
        allSummaries.push(...pageResult.content)
        serverTotalPages =
          Number(pageResult.totalPages) ||
          (Number(pageResult.totalElements) > 0 ? 1 : 0)
        serverPage += 1
      } while (serverPage < serverTotalPages)

      let filtered = allSummaries
      if (chapterPresidentStaffViewFilter) {
        filtered =
          staffRecipientClientFilter && input.filters.staffRecipient != null
            ? filterStaffNoticeSummariesForChapterPresidentRecipient(
                filtered,
                input.filters.staffRecipient,
              )
            : filterStaffNoticeSummariesForChapterPresident(filtered)
      } else if (
        staffRecipientClientFilter &&
        input.filters.staffRecipient != null
      ) {
        filtered = filterStaffNoticeSummariesByRecipient(
          filtered,
          input.filters.staffRecipient,
        )
      }
      if (allSchoolsTargetClientFilter) {
        filtered = filterStaffNoticeSummariesByAllSchoolsTarget(filtered)
      }
      if (
        chapterPresidentChallengerViewFilter &&
        input.chapterPresidentChallengerListScope != null
      ) {
        filtered = filterChallengerNoticeSummariesForChapterPresident(
          filtered,
          input.chapterPresidentChallengerListScope,
          challengerScopeForFilter,
        )
      } else if (challengerScopeClientFilter) {
        filtered = filterChallengerNoticeSummariesByScope(
          filtered,
          challengerScopeForFilter,
        )
      }
      const paginated = paginateNoticeListSummaries(
        filtered,
        input.page,
        NOTICE_LIST_PAGE_SIZE,
      )
      content = paginated.content
      totalElements = paginated.totalElements
      totalPages = paginated.totalPages
    } else {
      const page = await fetchNoticeListSummariesPage(request, input.page)
      content = page.content
      totalElements = Number(page.totalElements) || 0
      totalPages =
        Number(page.totalPages) ||
        (totalElements > 0
          ? Math.ceil(totalElements / NOTICE_LIST_PAGE_SIZE)
          : 0)
    }

    const organization = toOrganizationLists(organizationGisu)
    const gisuGenerationById = buildGisuGenerationLookup(gisuList)
    const { chapterNameById, schoolNameById } =
      buildNoticeOrganizationNameLookup(organization)
    const targetDisplayContext = {
      chapterNameById,
      gisuGenerationById,
      schoolNameById,
    }

    const notices = content.map((summary) =>
      mapNoticeSummaryForListPage(
        summary,
        targetDisplayContext,
        sessionGisuId,
        listFiltersActive,
      ),
    )

    return {
      kind: "success",
      notices,
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
  chapterPresidentChallengerListScope?: ChapterPresidentChallengerListScope | null
  chapterPresidentStaffListActive?: boolean
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
