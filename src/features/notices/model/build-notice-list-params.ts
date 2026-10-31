import { resolveNoticeTab } from "./notice-notice-tab"
import { parseNoticeScopeFilter } from "./notice-scope-filter"

import type {
  GetNoticeSummaryResponse,
  ListNoticesParams,
  NoticeTab,
  SearchNoticesParams,
} from "../api/notice-api.types"
import type { NoticeCreateStaffScope } from "./notice-create-form"
import type { NoticeOperatorSession } from "./notice-session"
import type { NoticeAudience, NoticeListQueryFilterFields } from "./types"

export const NOTICE_LIST_PAGE_SIZE = 10

/** NOTICE-001/002 — 목록·검색 noticeTab (세션 READ 권한). 받는 사람은 API가 아닌 클라이언트 필터 */
export function resolveNoticeListNoticeTab(
  audience: NoticeAudience,
  session: Pick<NoticeOperatorSession, "isSuperAdmin" | "roleTypes">,
): NoticeTab {
  return resolveNoticeTab(audience, session)
}

export function filterStaffNoticeSummariesByRecipient(
  content: GetNoticeSummaryResponse[],
  staffRecipient: NoticeCreateStaffScope,
): GetNoticeSummaryResponse[] {
  return content.filter(
    (summary) => summary.targetInfo?.targetNoticeTab === staffRecipient,
  )
}

function staffSummaryMatchesSchoolFilter(
  summary: GetNoticeSummaryResponse,
  schoolId: number,
): boolean {
  const targetSchoolId = summary.targetInfo?.targetSchoolId
  if (targetSchoolId == null) {
    return false
  }

  return Number(targetSchoolId) === schoolId
}

function staffSummaryMatchesPartFilter(
  summary: GetNoticeSummaryResponse,
  part: NonNullable<NoticeListQueryFilterFields["part"]>,
): boolean {
  const targetParts = summary.targetInfo?.targetParts
  if (targetParts == null || targetParts.length === 0) {
    return true
  }

  return targetParts.includes(part)
}

/** 운영진 목록: 범위·대상·받는 사람은 targetInfo 기준 클라이언트 필터 (NOTICE-001/002) */
export function applyStaffNoticeListClientFilters(
  content: GetNoticeSummaryResponse[],
  apiFilters: NoticeListQueryFilterFields,
): GetNoticeSummaryResponse[] {
  let result = content

  if (apiFilters.staffRecipient != null) {
    result = filterStaffNoticeSummariesByRecipient(
      result,
      apiFilters.staffRecipient,
    )
  }

  if (apiFilters.scopeStage === "school") {
    const { schoolId } = parseNoticeScopeFilter(apiFilters.scope)
    if (schoolId != null) {
      result = result.filter((summary) =>
        staffSummaryMatchesSchoolFilter(summary, schoolId),
      )
    }
  }

  if (apiFilters.scopeStage === "part" && apiFilters.part != null) {
    result = result.filter((summary) =>
      staffSummaryMatchesPartFilter(summary, apiFilters.part!),
    )
  }

  return result
}

function challengerSummaryMatchesChapterFilter(
  summary: GetNoticeSummaryResponse,
  chapterId: number,
): boolean {
  const targetChapterId = summary.targetInfo?.targetChapterId
  if (targetChapterId == null) {
    return false
  }

  return Number(targetChapterId) === chapterId
}

function challengerSummaryMatchesSchoolFilter(
  summary: GetNoticeSummaryResponse,
  schoolId: number,
): boolean {
  const targetSchoolId = summary.targetInfo?.targetSchoolId
  if (targetSchoolId == null) {
    return false
  }

  return Number(targetSchoolId) === schoolId
}

function challengerSummaryMatchesPartFilter(
  summary: GetNoticeSummaryResponse,
  part: NonNullable<NoticeListQueryFilterFields["part"]>,
): boolean {
  const targetParts = summary.targetInfo?.targetParts
  if (targetParts == null || targetParts.length === 0) {
    return true
  }

  return targetParts.includes(part)
}

/** 챌린저 목록: 지부·학교·파트는 targetInfo 기준 클라이언트 필터 */
export function applyChallengerNoticeListClientFilters(
  content: GetNoticeSummaryResponse[],
  apiFilters: NoticeListQueryFilterFields,
): GetNoticeSummaryResponse[] {
  let result = content

  const { chapterId } = parseNoticeScopeFilter(apiFilters.chapterScope)
  if (chapterId != null) {
    result = result.filter((summary) =>
      challengerSummaryMatchesChapterFilter(summary, chapterId),
    )
  }

  const { schoolId } = parseNoticeScopeFilter(apiFilters.schoolScope)
  if (schoolId != null) {
    result = result.filter((summary) =>
      challengerSummaryMatchesSchoolFilter(summary, schoolId),
    )
  }

  if (apiFilters.part != null) {
    result = result.filter((summary) =>
      challengerSummaryMatchesPartFilter(summary, apiFilters.part!),
    )
  }

  return result
}

export function normalizeNoticeListFiltersForApi(input: {
  audience: NoticeAudience
  filters: NoticeListQueryFilterFields
}): NoticeListQueryFilterFields {
  const query = input.filters.query.trim()

  if (input.audience === "challenger") {
    const { chapterId } = parseNoticeScopeFilter(input.filters.chapterScope)
    const { schoolId } = parseNoticeScopeFilter(input.filters.schoolScope)

    return {
      query,
      chapterScope: chapterId != null ? input.filters.chapterScope : null,
      schoolScope: schoolId != null ? input.filters.schoolScope : null,
      part: input.filters.part,
      scopeStage: null,
      scope: null,
      staffRecipient: null,
    }
  }

  switch (input.filters.scopeStage) {
    case "chapter":
      return {
        query,
        chapterScope: null,
        schoolScope: null,
        part: null,
        scopeStage: null,
        scope: null,
        staffRecipient: input.filters.staffRecipient,
      }
    case "school": {
      const { schoolId } = parseNoticeScopeFilter(input.filters.scope)
      if (schoolId == null) {
        return {
          query,
          chapterScope: null,
          schoolScope: null,
          part: null,
          scopeStage: null,
          scope: null,
          staffRecipient: input.filters.staffRecipient,
        }
      }
      return {
        query,
        chapterScope: null,
        schoolScope: null,
        part: null,
        scopeStage: "school",
        scope: input.filters.scope,
        staffRecipient: input.filters.staffRecipient,
      }
    }
    case "part":
      if (input.filters.part == null) {
        return {
          query,
          chapterScope: null,
          schoolScope: null,
          part: null,
          scopeStage: null,
          scope: null,
          staffRecipient: input.filters.staffRecipient,
        }
      }
      return {
        query,
        chapterScope: null,
        schoolScope: null,
        part: input.filters.part,
        scopeStage: "part",
        scope: null,
        staffRecipient: input.filters.staffRecipient,
      }
    default:
      return {
        query,
        chapterScope: null,
        schoolScope: null,
        part: null,
        scopeStage: null,
        scope: null,
        staffRecipient: input.filters.staffRecipient,
      }
  }
}

export type NoticeListRequest =
  | { kind: "list"; params: ListNoticesParams }
  | { kind: "search"; params: SearchNoticesParams }

export function buildNoticeListRequest(input: {
  audience: NoticeAudience
  filters: NoticeListQueryFilterFields
  page?: number
  session: NoticeOperatorSession
}): NoticeListRequest | null {
  if (input.session.gisuId == null) {
    return null
  }

  const apiFilters = normalizeNoticeListFiltersForApi({
    audience: input.audience,
    filters: input.filters,
  })

  const noticeTab = resolveNoticeListNoticeTab(input.audience, input.session)

  const base: ListNoticesParams = {
    gisuId: input.session.gisuId,
    noticeTab,
    page: input.page ?? 0,
    size: NOTICE_LIST_PAGE_SIZE,
    sort: ["createdAt,DESC"],
  }

  // 챌린저·운영진: org/part 필터는 API가 아닌 targetInfo 클라이언트 필터

  const keyword = apiFilters.query
  if (keyword.length > 0) {
    return {
      kind: "search",
      params: {
        ...base,
        keyword,
      },
    }
  }

  return { kind: "list", params: base }
}
