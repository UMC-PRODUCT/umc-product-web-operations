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
    })

    expect(built).toEqual({
      part: "WEB",
      q: "투표",
      schoolScope: encodeSchoolScope(2),
    })

    const parsed = parseNoticeListFiltersFromSearch(built, {
      audience: "challenger",
    })
    expect(parsed.filters).toEqual(filters)
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
    })

    expect(built).toEqual({
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
    })
    const right = {}

    expect(areNoticeListFilterSearchParamsEqual(left, right)).toBe(true)
  })
})
