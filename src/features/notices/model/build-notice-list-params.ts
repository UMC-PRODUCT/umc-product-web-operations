import { resolveNoticeTab } from "./notice-notice-tab"
import { parseNoticeScopeFilter } from "./notice-scope-filter"

import type {
  ListNoticesParams,
  SearchNoticesParams,
} from "../api/notice-api.types"
import type { NoticeOperatorSession } from "./notice-session"
import type { NoticeAudience, NoticeListFilters } from "./types"

export const NOTICE_LIST_PAGE_SIZE = 10

/** 두 번째 드롭다운(대상)까지 선택됐을 때만 API·캐시 키에 반영 */
export function normalizeNoticeListFiltersForApi(input: {
  audience: NoticeAudience
  filters: Pick<NoticeListFilters, "query" | "scope" | "part" | "scopeStage">
}): Pick<NoticeListFilters, "query" | "scope" | "part" | "scopeStage"> {
  const query = input.filters.query.trim()
  if (input.audience !== "challenger") {
    return { query, scopeStage: null, scope: null, part: null }
  }

  switch (input.filters.scopeStage) {
    case "chapter": {
      const { chapterId } = parseNoticeScopeFilter(input.filters.scope)
      if (chapterId == null) {
        return { query, scopeStage: null, scope: null, part: null }
      }
      return {
        query,
        scopeStage: "chapter",
        scope: input.filters.scope,
        part: null,
      }
    }
    case "school": {
      const { schoolId } = parseNoticeScopeFilter(input.filters.scope)
      if (schoolId == null) {
        return { query, scopeStage: null, scope: null, part: null }
      }
      return {
        query,
        scopeStage: "school",
        scope: input.filters.scope,
        part: null,
      }
    }
    case "part":
      if (input.filters.part == null) {
        return { query, scopeStage: null, scope: null, part: null }
      }
      return {
        query,
        scopeStage: "part",
        scope: null,
        part: input.filters.part,
      }
    default:
      return { query, scopeStage: null, scope: null, part: null }
  }
}

export type NoticeListRequest =
  | { kind: "list"; params: ListNoticesParams }
  | { kind: "search"; params: SearchNoticesParams }

export function buildNoticeListRequest(input: {
  audience: NoticeAudience
  filters: Pick<NoticeListFilters, "query" | "scope" | "part" | "scopeStage">
  page?: number
  session: NoticeOperatorSession
}): NoticeListRequest | null {
  if (input.session.gisuId == null) {
    return null
  }

  const noticeTab = resolveNoticeTab(input.audience, input.session)
  const { chapterId, schoolId } = parseNoticeScopeFilter(input.filters.scope)

  const base: ListNoticesParams = {
    gisuId: input.session.gisuId,
    noticeTab,
    page: input.page ?? 0,
    size: NOTICE_LIST_PAGE_SIZE,
    sort: ["createdAt,DESC"],
  }

  if (input.audience === "challenger") {
    switch (input.filters.scopeStage) {
      case "chapter":
        if (chapterId != null) {
          base.chapterId = chapterId
        }
        break
      case "school":
        if (schoolId != null) {
          base.schoolId = schoolId
        }
        break
      case "part":
        if (input.filters.part != null) {
          base.part = input.filters.part
        }
        break
      default:
        break
    }
  }

  const keyword = input.filters.query.trim()
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
