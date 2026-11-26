import {
  parsePointsListSearch,
  type PointsListSearch,
} from "./points-list-search"

/** 상벌점 목록·상세 history state — URL search에 두지 않음 */
export type PointsLocationState = {
  pointsListSearch?: PointsListSearch
}

declare module "@tanstack/react-router" {
  interface HistoryState {
    pointsListSearch?: PointsListSearch
  }
}

let pointsListViewSnapshot: PointsListSearch = {}

export function rememberPointsListView(search: PointsListSearch) {
  pointsListViewSnapshot = { ...search }
}

export function recallPointsListView(): PointsListSearch {
  return pointsListViewSnapshot
}

function hasPointsListValues(search: PointsListSearch): boolean {
  return (
    search.chapter != null ||
    search.school != null ||
    search.part != null ||
    search.q != null ||
    search.page != null
  )
}

export function parsePointsLocationState(state: unknown): PointsLocationState {
  if (state == null || typeof state !== "object") {
    return {}
  }

  const record = state as { pointsListSearch?: unknown }
  if (
    record.pointsListSearch == null ||
    typeof record.pointsListSearch !== "object"
  ) {
    return {}
  }

  return {
    pointsListSearch: parsePointsListSearch(
      record.pointsListSearch as Record<string, unknown>,
    ),
  }
}

/** location.state에 목록 search가 있으면 사용, 없으면 스냅샷 */
export function resolvePointsListViewState(
  locationState: unknown,
): PointsListSearch {
  const parsed = parsePointsLocationState(locationState).pointsListSearch
  if (parsed != null && hasPointsListValues(parsed)) {
    return parsed
  }
  // 명시적으로 비운 경우(필터 리셋)도 location에 {}가 올 수 있음 → 키 존재 여부로 구분
  if (
    locationState != null &&
    typeof locationState === "object" &&
    "pointsListSearch" in locationState
  ) {
    return parsed ?? {}
  }
  return recallPointsListView()
}

export function buildPointsLocationState(
  search: PointsListSearch,
): PointsLocationState {
  return { pointsListSearch: search }
}

export function mergePointsListSearch(
  current: PointsListSearch,
  patch: PointsListSearch,
): PointsListSearch {
  return parsePointsListSearch({ ...current, ...patch })
}
