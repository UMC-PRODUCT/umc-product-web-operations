import {
  type NoticeListFilterSearchParams,
  parseNoticeListAudienceOptional,
  parseNoticeListFiltersFromSearch,
} from "./notice-list-route-search"

import type { NoticeAudience, NoticeListFilters } from "./types"

/** 공지 목록·상세·수정 history state — URL search에 두지 않음 */
export type NoticeLocationState = {
  listAudience?: NoticeAudience
  listPage?: number
  listFilters?: NoticeListFilterSearchParams
}

declare module "@tanstack/react-router" {
  interface HistoryState {
    listAudience?: NoticeAudience
    listPage?: number
    listFilters?: NoticeListFilterSearchParams
  }
}

/** 브레드크럼·사이드 진입처럼 state 없는 이동에서도 같은 탭 세션 동안 복원 */
let noticeListViewSnapshot: NoticeLocationState = {}

export function rememberNoticeListView(state: NoticeLocationState) {
  // merge 하면 listFilters를 비운 뒤에도 이전 필터가 남는다 (전체 선택 복원 버그)
  noticeListViewSnapshot = { ...state }
}

export function recallNoticeListView(): NoticeLocationState {
  return noticeListViewSnapshot
}

function parseListPage(value: unknown): number | undefined {
  const parsed = typeof value === "number" ? value : Number(value)
  if (!Number.isFinite(parsed) || parsed < 1) {
    return undefined
  }

  return Math.floor(parsed)
}

function parseListFilters(
  value: unknown,
  audience: NoticeAudience,
): NoticeListFilterSearchParams | undefined {
  if (value == null || typeof value !== "object") {
    return undefined
  }

  const parsed = parseNoticeListFiltersFromSearch(
    value as Record<string, unknown>,
    { audience },
  )
  const search: NoticeListFilterSearchParams = {}
  const query = parsed.filters.query.trim()
  if (query) {
    search.q = query
  }
  if (audience === "challenger") {
    if (parsed.filters.chapterScope) {
      search.chapterScope = parsed.filters.chapterScope
    }
    if (parsed.filters.schoolScope) {
      search.schoolScope = parsed.filters.schoolScope
    }
    if (parsed.filters.part) {
      search.part = parsed.filters.part
    }
  } else {
    if (parsed.filters.scopeStage) {
      search.scopeStage = parsed.filters.scopeStage
    }
    if (parsed.filters.scope) {
      search.scope = parsed.filters.scope
    }
    if (parsed.filters.part) {
      search.part = parsed.filters.part
    }
    if (parsed.filters.staffRecipient) {
      search.staffRecipient = parsed.filters.staffRecipient
    }
  }

  return Object.keys(search).length > 0 ? search : undefined
}

export function parseNoticeLocationState(state: unknown): NoticeLocationState {
  if (state == null || typeof state !== "object") {
    return {}
  }

  const record = state as {
    listAudience?: unknown
    listPage?: unknown
    listFilters?: unknown
  }
  const listAudience = parseNoticeListAudienceOptional(record.listAudience)
  const audience = listAudience ?? "challenger"
  const listPage = parseListPage(record.listPage)
  const listFilters = parseListFilters(record.listFilters, audience)

  return {
    ...(listAudience == null ? {} : { listAudience }),
    ...(listPage == null ? {} : { listPage }),
    ...(listFilters == null ? {} : { listFilters }),
  }
}

/** location.state 우선, 빈 필드는 스냅샷으로 보완 (브레드크럼 복원) */
export function resolveNoticeListViewState(
  locationState: unknown,
): NoticeLocationState {
  const parsed = parseNoticeLocationState(locationState)
  const recalled = recallNoticeListView()
  const locationSpecifiedFilters =
    locationState != null &&
    typeof locationState === "object" &&
    "listFilters" in locationState

  return {
    ...(recalled.listAudience == null && parsed.listAudience == null
      ? {}
      : {
          listAudience: parsed.listAudience ?? recalled.listAudience,
        }),
    ...(recalled.listPage == null && parsed.listPage == null
      ? {}
      : { listPage: parsed.listPage ?? recalled.listPage }),
    ...(locationSpecifiedFilters
      ? parsed.listFilters == null
        ? {}
        : { listFilters: parsed.listFilters }
      : recalled.listFilters == null && parsed.listFilters == null
        ? {}
        : {
            listFilters: parsed.listFilters ?? recalled.listFilters,
          }),
  }
}

export function buildNoticeLocationState(input: {
  listAudience?: NoticeAudience | null
  listPage?: number | null
  listFilters?: NoticeListFilterSearchParams | null
}): NoticeLocationState {
  const next: NoticeLocationState = {}

  if (input.listAudience != null) {
    next.listAudience = input.listAudience
  }

  const listPage = parseListPage(input.listPage)
  if (listPage != null) {
    next.listPage = listPage
  }

  // null → 생략. 객체(빈 객체 포함) → state에 키를 남겨 "전체" 클리어를 구분한다.
  if (input.listFilters != null) {
    next.listFilters = input.listFilters
  }

  return next
}

export function noticeFiltersFromLocationState(
  state: NoticeLocationState,
  audience: NoticeAudience,
): Omit<NoticeListFilters, "audience"> {
  return parseNoticeListFiltersFromSearch(state.listFilters ?? {}, {
    audience,
  }).filters
}

/** @deprecated 목록 탭은 history state로 복원. 하위 호환용으로 유지 */
export function buildNoticeListReturnSearch(input: {
  audience?: NoticeAudience | null
}): { audience?: NoticeAudience } {
  if (input.audience == null) {
    return {}
  }

  return { audience: input.audience }
}
