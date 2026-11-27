import { resolveNoticeTab } from "./notice-notice-tab"
import { parseNoticeScopeFilter } from "./notice-scope-filter"
import { resolveNoticeStaffRecipientScope } from "./notice-staff-recipient-display"

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

/**
 * 운영진 "받는 사람" 필터. API에 대응 파라미터가 없어 현재 페이지 응답에만 클라이언트로 적용한다.
 * API 미지원 시 목록 쿼리가 서버 페이지를 모두 받은 뒤 필터·페이지네이션한다.
 */
/** NOTICE-001 응답 targetNoticeTab ↔ UI 받는 사람(ALL_STAFF는 API enum 없음) */
export function noticeSummaryMatchesStaffRecipient(
  summary: GetNoticeSummaryResponse,
  staffRecipient: NoticeCreateStaffScope,
): boolean {
  const targetInfo = summary.targetInfo
  if (targetInfo?.targetNoticeTab == null) {
    return false
  }

  return resolveNoticeStaffRecipientScope(targetInfo) === staffRecipient
}

export function filterStaffNoticeSummariesByRecipient(
  content: GetNoticeSummaryResponse[],
  staffRecipient: NoticeCreateStaffScope,
): GetNoticeSummaryResponse[] {
  return content.filter((summary) =>
    noticeSummaryMatchesStaffRecipient(summary, staffRecipient),
  )
}

/** 학교를 지정하지 않은 운영진 공지 (Figma — 모든 학교 대상) */
export function filterStaffNoticeSummariesByAllSchoolsTarget(
  content: GetNoticeSummaryResponse[],
): GetNoticeSummaryResponse[] {
  return content.filter((summary) => summary.targetInfo?.targetSchoolId == null)
}

/** 받는 사람 클라이언트 필터 후 목록 페이지네이션 */
export function paginateNoticeListSummaries<T>(
  items: T[],
  page: number,
  pageSize: number = NOTICE_LIST_PAGE_SIZE,
): {
  content: T[]
  totalElements: number
  totalPages: number
} {
  const totalElements = items.length
  const totalPages = totalElements > 0 ? Math.ceil(totalElements / pageSize) : 0
  const start = page * pageSize

  return {
    content: items.slice(start, start + pageSize),
    totalElements,
    totalPages,
  }
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

  const chapterId =
    input.audience === "challenger"
      ? parseNoticeScopeFilter(apiFilters.chapterScope).chapterId
      : null
  let schoolId: number | null = null
  if (input.audience === "challenger") {
    schoolId = parseNoticeScopeFilter(apiFilters.schoolScope).schoolId
  } else if (apiFilters.scopeStage === "school") {
    schoolId = parseNoticeScopeFilter(apiFilters.scope).schoolId
  }
  const part =
    input.audience === "challenger" || apiFilters.scopeStage === "part"
      ? apiFilters.part
      : null

  if (chapterId != null) {
    base.chapterId = chapterId
  }
  if (schoolId != null) {
    base.schoolId = schoolId
  }
  if (part != null) {
    base.part = part
  }

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
