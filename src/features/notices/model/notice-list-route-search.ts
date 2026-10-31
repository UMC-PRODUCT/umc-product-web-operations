import type { NoticePart } from "../api/notice-api.types"
import type { NoticeCreateStaffScope } from "./notice-create-form"
import type { NoticeScopeStage } from "./notice-scope-stage"
import type { NoticeAudience, NoticeListFilters } from "./types"

const NOTICE_PART_VALUES = [
  "PLAN",
  "DESIGN",
  "WEB",
  "ANDROID",
  "IOS",
  "NODEJS",
  "SPRINGBOOT",
  "ADMIN",
  "WEB_PRODUCT_ENGINEER",
  "MOBILE_PRODUCT_ENGINEER",
] as const satisfies readonly NoticePart[]

const VALID_NOTICE_PARTS = new Set<string>(NOTICE_PART_VALUES)

const VALID_STAFF_RECIPIENTS = new Set<string>([
  "CENTRAL_MEMBER",
  "SCHOOL_CORE",
  "SCHOOL_PART_LEADER",
])

export function parseNoticeListAudience(value: unknown): NoticeAudience {
  return value === "staff" ? "staff" : "challenger"
}

export function parseNoticeListAudienceOptional(
  value: unknown,
): NoticeAudience | undefined {
  if (value === "staff" || value === "challenger") {
    return value
  }

  return undefined
}

export function parseNoticeListPage(value: unknown): number {
  const parsed = typeof value === "number" ? value : Number(value)
  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1
  }

  return Math.floor(parsed)
}

function parseNoticeListScopeStage(value: unknown): NoticeScopeStage | null {
  if (value === "chapter" || value === "school" || value === "part") {
    return value
  }

  return null
}

function parseEncodedChapterScope(value: unknown): string | null {
  if (typeof value !== "string" || !value.startsWith("chapter:")) {
    return null
  }

  return value
}

function parseEncodedSchoolScope(value: unknown): string | null {
  if (typeof value !== "string" || !value.startsWith("school:")) {
    return null
  }

  return value
}

function parseNoticeListScopeValue(
  value: unknown,
  scopeStage: NoticeScopeStage | null,
): string | null {
  if (typeof value !== "string" || value.length === 0) {
    return null
  }

  if (scopeStage === "chapter" && value.startsWith("chapter:")) {
    return value
  }

  if (scopeStage === "school" && value.startsWith("school:")) {
    return value
  }

  return null
}

function parseNoticeListPartValue(value: unknown): NoticePart | null {
  if (typeof value !== "string" || !VALID_NOTICE_PARTS.has(value)) {
    return null
  }

  return value as NoticePart
}

function parseNoticeListStaffRecipient(
  value: unknown,
): NoticeCreateStaffScope | null {
  if (typeof value !== "string" || !VALID_STAFF_RECIPIENTS.has(value)) {
    return null
  }

  return value as NoticeCreateStaffScope
}

const EMPTY_LIST_FILTERS: Omit<NoticeListFilters, "audience"> = {
  query: "",
  chapterScope: null,
  schoolScope: null,
  part: null,
  scopeStage: null,
  scope: null,
  staffRecipient: null,
}

export function parseNoticeListFiltersFromSearch(
  search: Record<string, unknown>,
  options?: { audience?: NoticeAudience },
): {
  filters: Omit<NoticeListFilters, "audience">
  page: number
} {
  const audience = options?.audience ?? parseNoticeListAudience(search.audience)
  const query = typeof search.q === "string" ? search.q : ""
  const page = parseNoticeListPage(search.page)

  if (audience === "staff") {
    const scopeStage = parseNoticeListScopeStage(search.scopeStage)
    let part: NoticePart | null = null
    if (scopeStage === "part") {
      part = parseNoticeListPartValue(search.part)
    }

    return {
      filters: {
        ...EMPTY_LIST_FILTERS,
        query,
        scopeStage,
        scope: parseNoticeListScopeValue(search.scope, scopeStage),
        part,
        staffRecipient: parseNoticeListStaffRecipient(search.staffRecipient),
      },
      page,
    }
  }

  return {
    filters: {
      ...EMPTY_LIST_FILTERS,
      query,
      chapterScope: parseEncodedChapterScope(search.chapterScope),
      schoolScope: parseEncodedSchoolScope(search.schoolScope),
      part: parseNoticeListPartValue(search.part),
      staffRecipient: null,
    },
    page,
  }
}

export type NoticeListFilterSearchParams = {
  audience: NoticeAudience
  chapterScope?: string
  page?: number
  part?: NoticePart
  q?: string
  schoolScope?: string
  scope?: string
  scopeStage?: NoticeScopeStage
  staffRecipient?: NoticeCreateStaffScope
}

export function buildNoticeListFilterSearchParams(input: {
  audience: NoticeAudience
  filters: Omit<NoticeListFilters, "audience">
  page: number
}): NoticeListFilterSearchParams {
  const search: NoticeListFilterSearchParams = {
    audience: input.audience,
  }

  const query = input.filters.query.trim()
  if (query) {
    search.q = query
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
  } else {
    if (input.filters.scopeStage) {
      search.scopeStage = input.filters.scopeStage

      if (input.filters.scopeStage === "part" && input.filters.part) {
        search.part = input.filters.part
      }

      if (
        (input.filters.scopeStage === "chapter" ||
          input.filters.scopeStage === "school") &&
        input.filters.scope
      ) {
        search.scope = input.filters.scope
      }
    }

    if (input.filters.staffRecipient) {
      search.staffRecipient = input.filters.staffRecipient
    }
  }

  if (input.page > 1) {
    search.page = input.page
  }

  return search
}

export function areNoticeListFilterSearchParamsEqual(
  left: NoticeListFilterSearchParams,
  right: NoticeListFilterSearchParams,
): boolean {
  return (
    left.audience === right.audience &&
    (left.q ?? "") === (right.q ?? "") &&
    (left.chapterScope ?? null) === (right.chapterScope ?? null) &&
    (left.schoolScope ?? null) === (right.schoolScope ?? null) &&
    (left.scopeStage ?? null) === (right.scopeStage ?? null) &&
    (left.scope ?? null) === (right.scope ?? null) &&
    (left.part ?? null) === (right.part ?? null) &&
    (left.staffRecipient ?? null) === (right.staffRecipient ?? null) &&
    (left.page ?? 1) === (right.page ?? 1)
  )
}
