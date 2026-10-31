import type { NoticeRangeFilter, NoticeTargetFilter } from "./types"

/** @deprecated API 403으로 대체. mock QA용 */
export type NoticeViewerScope = {
  allowedRanges: NoticeRangeFilter[]
  allowedTargets: NoticeTargetFilter[]
}

export const MOCK_NOTICE_VIEWER_SCOPE: NoticeViewerScope = {
  allowedRanges: ["all", "branch"],
  allowedTargets: ["all", "web"],
}

type LegacyMockListFilters = {
  range: NoticeRangeFilter
  target: NoticeTargetFilter
}

/** @deprecated mock NT-L01 403 시뮬레이션 */
export function isNoticeListFilterForbidden(
  filters: LegacyMockListFilters,
  scope: NoticeViewerScope = MOCK_NOTICE_VIEWER_SCOPE,
): boolean {
  if (filters.range !== "all" && !scope.allowedRanges.includes(filters.range)) {
    return true
  }

  if (
    filters.target !== "all" &&
    !scope.allowedTargets.includes(filters.target)
  ) {
    return true
  }

  return false
}
