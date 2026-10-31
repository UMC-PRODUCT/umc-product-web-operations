import {
  type NoticeListCreatePrefill,
  sanitizeNoticeListCreatePrefill,
} from "./apply-notice-list-prefill-to-create-form"
import {
  parseNoticeListAudienceOptional,
  parseNoticeListFiltersFromSearch,
} from "./notice-list-route-search"

import type { NoticeAudience } from "./types"

export type NoticeCreateRouteSearch = {
  audience?: NoticeAudience
  chapterScope?: string
  part?: NoticeListCreatePrefill["filters"]["part"]
  schoolScope?: string
  scope?: string
  scopeStage?: NoticeListCreatePrefill["filters"]["scopeStage"]
  staffRecipient?: NoticeListCreatePrefill["filters"]["staffRecipient"]
}

export function parseNoticeCreatePrefillFromSearch(
  search: Record<string, unknown>,
): NoticeListCreatePrefill | null {
  const audience = parseNoticeListAudienceOptional(search.audience)
  if (audience == null) {
    return null
  }

  const { filters } = parseNoticeListFiltersFromSearch(search, { audience })

  return {
    audience,
    filters: {
      chapterScope: filters.chapterScope,
      schoolScope: filters.schoolScope,
      part: filters.part,
      scopeStage: filters.scopeStage,
      scope: filters.scope,
      staffRecipient: filters.staffRecipient,
    },
  }
}

export function buildNoticeCreateRouteSearchFromList(input: {
  audience: NoticeAudience
  filters: Omit<NoticeListCreatePrefill["filters"], never> & { query?: string }
}): NoticeCreateRouteSearch {
  const search: NoticeCreateRouteSearch = {
    audience: input.audience,
  }

  if (input.audience === "challenger") {
    if (input.filters.chapterScope) {
      search.chapterScope = input.filters.chapterScope
    }
    if (input.filters.schoolScope) {
      search.schoolScope = input.filters.schoolScope
    }
    if (input.filters.part) {
      search.part = input.filters.part
    }
    return search
  }

  if (input.filters.scopeStage && input.filters.scopeStage !== "chapter") {
    search.scopeStage = input.filters.scopeStage
    if (input.filters.scopeStage === "part" && input.filters.part) {
      search.part = input.filters.part
    }
    if (input.filters.scopeStage === "school" && input.filters.scope) {
      search.scope = input.filters.scope
    }
  }

  if (input.filters.staffRecipient) {
    search.staffRecipient = input.filters.staffRecipient
  }

  return search
}

export function validateNoticeCreateRouteSearch(
  search: Record<string, unknown>,
): NoticeCreateRouteSearch {
  const prefill = parseNoticeCreatePrefillFromSearch(search)
  if (prefill == null) {
    return {}
  }

  const sanitized = sanitizeNoticeListCreatePrefill(prefill)
  return buildNoticeCreateRouteSearchFromList({
    audience: sanitized.audience,
    filters: sanitized.filters,
  })
}
