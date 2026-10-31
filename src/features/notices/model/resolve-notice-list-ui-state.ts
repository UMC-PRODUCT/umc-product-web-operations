import { normalizeNoticeListFiltersForApi } from "./build-notice-list-params"
import { parseNoticeScopeFilter } from "./notice-scope-filter"

import type { NoticeListOrganizationOptions } from "./notice-list-organization-query"
import type {
  NoticeAudience,
  NoticeListFilters,
  NoticeListQueryFilterFields,
} from "./types"

export type NoticeListTableEmptyState =
  | { variant: "registered" }
  | { variant: "search"; query: string }
  | { variant: "noMatch" }

export function hasAppliedNoticeListApiFilters(input: {
  audience: NoticeAudience
  filters: NoticeListQueryFilterFields
}): boolean {
  const apiFilters = normalizeNoticeListFiltersForApi(input)

  if (apiFilters.query.length > 0) {
    return true
  }

  if (input.audience === "challenger") {
    return (
      apiFilters.chapterScope != null ||
      apiFilters.schoolScope != null ||
      apiFilters.part != null
    )
  }

  if (input.filters.staffRecipient != null) {
    return true
  }

  return apiFilters.scopeStage != null
}

/** 운영진 탭에서 챌린저 전용 필터 (NT-L01 403) */
export function isNoticeListClientFilterForbidden(input: {
  audience: NoticeAudience
  filters: Pick<
    NoticeListFilters,
    "chapterScope" | "schoolScope" | "scopeStage"
  >
}): boolean {
  if (input.audience === "challenger") {
    return input.filters.scopeStage != null
  }

  if (input.filters.chapterScope != null || input.filters.schoolScope != null) {
    return true
  }

  // 운영진 UI에는 지부 범위가 없음 — chapter는 URL 잔여값일 뿐 403 대상 아님
  if (input.filters.scopeStage === "chapter") {
    return false
  }

  return false
}

export function isNoticeListScopeOutOfOrganization(input: {
  audience: NoticeAudience
  filters: Pick<
    NoticeListFilters,
    "chapterScope" | "schoolScope" | "scope" | "scopeStage"
  >
  organization: Pick<
    NoticeListOrganizationOptions,
    "chapters" | "schools"
  > | null
}): boolean {
  if (!input.organization) {
    return false
  }

  if (input.audience === "challenger") {
    const { chapterId } = parseNoticeScopeFilter(input.filters.chapterScope)
    const { schoolId } = parseNoticeScopeFilter(input.filters.schoolScope)

    if (
      chapterId != null &&
      !input.organization.chapters.some((chapter) => chapter.id === chapterId)
    ) {
      return true
    }

    if (
      schoolId != null &&
      !input.organization.schools.some((school) => school.schoolId === schoolId)
    ) {
      return true
    }

    return false
  }

  if (input.filters.scopeStage !== "school" || input.filters.scope == null) {
    return false
  }

  const { schoolId } = parseNoticeScopeFilter(input.filters.scope)

  if (
    schoolId != null &&
    !input.organization.schools.some((school) => school.schoolId === schoolId)
  ) {
    return true
  }

  return false
}

export function resolveNoticeListTableEmptyState(input: {
  audience: NoticeAudience
  filters: NoticeListQueryFilterFields
  hasLoadedList: boolean
  noticeCount: number
  registeredTotal: number
}): NoticeListTableEmptyState | null {
  if (!input.hasLoadedList || input.noticeCount > 0) {
    return null
  }

  if (
    !hasAppliedNoticeListApiFilters({
      audience: input.audience,
      filters: input.filters,
    }) &&
    input.registeredTotal === 0
  ) {
    return { variant: "registered" }
  }

  const trimmedQuery = normalizeNoticeListFiltersForApi({
    audience: input.audience,
    filters: input.filters,
  }).query
  if (trimmedQuery.length > 0) {
    return { variant: "search", query: trimmedQuery }
  }

  return { variant: "noMatch" }
}
