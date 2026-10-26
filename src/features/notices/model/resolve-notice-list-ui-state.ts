import { parseNoticeScopeFilter } from "./notice-scope-filter"

import type { NoticeListOrganizationOptions } from "./notice-list-organization-query"
import type { NoticeAudience, NoticeListFilters } from "./types"

export type NoticeListTableEmptyState =
  { variant: "registered" } | { variant: "search"; query: string }

/** 운영진 탭 등에서 챌린저 전용 범위·파트 필터 (NT-L01 403) */
export function isNoticeListClientFilterForbidden(input: {
  audience: NoticeAudience
  filters: Pick<NoticeListFilters, "scopeStage">
}): boolean {
  if (input.audience !== "challenger") {
    return input.filters.scopeStage != null
  }

  return false
}

export function isNoticeListScopeOutOfOrganization(input: {
  filters: Pick<NoticeListFilters, "scope" | "scopeStage">
  organization: Pick<
    NoticeListOrganizationOptions,
    "chapters" | "schools"
  > | null
}): boolean {
  if (
    !input.organization ||
    input.filters.scope == null ||
    (input.filters.scopeStage !== "chapter" &&
      input.filters.scopeStage !== "school")
  ) {
    return false
  }

  const { chapterId, schoolId } = parseNoticeScopeFilter(input.filters.scope)

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

export function resolveNoticeListTableEmptyState(input: {
  filters: Pick<NoticeListFilters, "query" | "scope" | "part" | "scopeStage">
  hasLoadedList: boolean
  noticeCount: number
  registeredTotal: number
}): NoticeListTableEmptyState | null {
  if (!input.hasLoadedList || input.noticeCount > 0) {
    return null
  }

  if (input.registeredTotal === 0) {
    return { variant: "registered" }
  }

  const trimmedQuery = input.filters.query.trim()
  if (trimmedQuery.length > 0) {
    return { variant: "search", query: trimmedQuery }
  }

  return { variant: "registered" }
}
