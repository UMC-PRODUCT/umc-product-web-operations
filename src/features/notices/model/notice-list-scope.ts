import type {
  NoticeListFilters,
  NoticeRangeFilter,
  NoticeTargetFilter,
} from "./types"

/** TODO: API 연동 시 세션·역할 기반 조회 가능 범위로 교체 */
export type NoticeViewerScope = {
  allowedRanges: NoticeRangeFilter[]
  allowedTargets: NoticeTargetFilter[]
}

export const MOCK_NOTICE_VIEWER_SCOPE: NoticeViewerScope = {
  allowedRanges: ["all", "branch"],
  allowedTargets: ["all", "web"],
}

export function isNoticeListFilterForbidden(
  filters: Pick<NoticeListFilters, "range" | "target">,
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
