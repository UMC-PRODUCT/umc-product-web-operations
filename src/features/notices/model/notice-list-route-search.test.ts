import { describe, expect, it } from "vitest"

import {
  areNoticeListFilterSearchParamsEqual,
  buildNoticeListFilterSearchParams,
  parseNoticeListFiltersFromSearch,
} from "./notice-list-route-search"
import { encodeSchoolScope } from "./notice-scope-filter"

const emptyFilters = {
  query: "",
  chapterScope: null,
  schoolScope: null,
  part: null,
  scopeStage: null,
  scope: null,
  staffRecipient: null,
}

describe("notice-list-route-search", () => {
  it("round-trips challenger list filters through search params", () => {
    const filters = {
      ...emptyFilters,
      query: "투표",
      schoolScope: encodeSchoolScope(2),
      part: "WEB" as const,
    }

    const built = buildNoticeListFilterSearchParams({
      audience: "challenger",
      filters,
      page: 2,
    })

    expect(built).toEqual({
      audience: "challenger",
      page: 2,
      part: "WEB",
      q: "투표",
      schoolScope: encodeSchoolScope(2),
    })

    const parsed = parseNoticeListFiltersFromSearch(built)
    expect(parsed.filters).toEqual(filters)
    expect(parsed.page).toBe(2)
  })

  it("round-trips staff list filters through search params", () => {
    const filters = {
      ...emptyFilters,
      scopeStage: "part" as const,
      part: "WEB" as const,
      staffRecipient: "SCHOOL_CORE" as const,
    }

    const built = buildNoticeListFilterSearchParams({
      audience: "staff",
      filters,
      page: 1,
    })

    expect(built).toEqual({
      audience: "staff",
      part: "WEB",
      scopeStage: "part",
      staffRecipient: "SCHOOL_CORE",
    })

    const parsed = parseNoticeListFiltersFromSearch(built, {
      audience: "staff",
    })
    expect(parsed.filters).toEqual(filters)
  })

  it("does not mirror staff scope into challenger schoolScope (403 false positive)", () => {
    const scope = encodeSchoolScope(31)
    const parsed = parseNoticeListFiltersFromSearch(
      {
        audience: "staff",
        scopeStage: "school",
        scope,
        staffRecipient: "SCHOOL_PART_LEADER",
      },
      { audience: "staff" },
    )

    expect(parsed.filters.schoolScope).toBeNull()
    expect(parsed.filters.scope).toBe(scope)
    expect(parsed.filters.staffRecipient).toBe("SCHOOL_PART_LEADER")
  })

  it("compares filter search params for URL sync", () => {
    const left = buildNoticeListFilterSearchParams({
      audience: "staff",
      filters: emptyFilters,
      page: 1,
    })
    const right = { audience: "staff" as const }

    expect(areNoticeListFilterSearchParamsEqual(left, right)).toBe(true)
  })
})
