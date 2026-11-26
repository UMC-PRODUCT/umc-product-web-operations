import { describe, expect, it } from "vitest"

import {
  buildNoticeListReturnSearch,
  buildNoticeLocationState,
  parseNoticeLocationState,
} from "./notice-location-state"

describe("parseNoticeLocationState", () => {
  it("reads listAudience, listPage, listFilters from history state", () => {
    expect(
      parseNoticeLocationState({
        listAudience: "staff",
        listPage: 3,
        listFilters: { q: "모집", scopeStage: "part", part: "DESIGN" },
      }),
    ).toEqual({
      listAudience: "staff",
      listPage: 3,
      listFilters: { q: "모집", scopeStage: "part", part: "DESIGN" },
    })
  })

  it("ignores invalid or missing values", () => {
    expect(parseNoticeLocationState(undefined)).toEqual({})
    expect(parseNoticeLocationState(null)).toEqual({})
    expect(parseNoticeLocationState({ listAudience: "nope" })).toEqual({})
    expect(parseNoticeLocationState({ listPage: 0 })).toEqual({})
    expect(parseNoticeLocationState({ listPage: "abc" })).toEqual({})
    expect(parseNoticeLocationState("staff")).toEqual({})
  })
})

describe("buildNoticeLocationState", () => {
  it("omits empty fields", () => {
    expect(buildNoticeLocationState({})).toEqual({})
    expect(
      buildNoticeLocationState({ listAudience: null, listPage: null }),
    ).toEqual({})
  })

  it("keeps audience and page", () => {
    expect(
      buildNoticeLocationState({ listAudience: "staff", listPage: 2 }),
    ).toEqual({
      listAudience: "staff",
      listPage: 2,
    })
  })

  it("keeps empty listFilters so 전체 클리어를 state에 남긴다", () => {
    expect(
      buildNoticeLocationState({
        listAudience: "challenger",
        listPage: 1,
        listFilters: {},
      }),
    ).toEqual({
      listAudience: "challenger",
      listPage: 1,
      listFilters: {},
    })
  })
})

describe("buildNoticeListReturnSearch", () => {
  it("maps audience for legacy list URL search", () => {
    expect(buildNoticeListReturnSearch({ audience: "staff" })).toEqual({
      audience: "staff",
    })
    expect(buildNoticeListReturnSearch({})).toEqual({})
  })
})
