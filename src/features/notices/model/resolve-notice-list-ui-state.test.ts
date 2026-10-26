import { describe, expect, it } from "vitest"

import { encodeSchoolScope } from "./notice-scope-filter"
import {
  isNoticeListClientFilterForbidden,
  resolveNoticeListTableEmptyState,
} from "./resolve-notice-list-ui-state"

describe("resolveNoticeListTableEmptyState", () => {
  it("shows registered empty when there are no notices at all", () => {
    expect(
      resolveNoticeListTableEmptyState({
        filters: {
          query: "",
          scopeStage: null,
          scope: null,
          part: null,
        },
        hasLoadedList: true,
        noticeCount: 0,
        registeredTotal: 0,
      }),
    ).toEqual({ variant: "registered" })
  })

  it("shows registered empty when part filter matches nothing", () => {
    expect(
      resolveNoticeListTableEmptyState({
        filters: {
          query: "",
          scopeStage: "part",
          scope: null,
          part: "WEB",
        },
        hasLoadedList: true,
        noticeCount: 0,
        registeredTotal: 3,
      }),
    ).toEqual({ variant: "registered" })
  })

  it("shows search empty when keyword is present, even with other filters", () => {
    expect(
      resolveNoticeListTableEmptyState({
        filters: {
          query: "dd",
          scopeStage: "school",
          scope: encodeSchoolScope(1),
          part: null,
        },
        hasLoadedList: true,
        noticeCount: 0,
        registeredTotal: 3,
      }),
    ).toEqual({ variant: "search", query: "dd" })
  })

  it("shows search empty when keyword is present without scope filters", () => {
    expect(
      resolveNoticeListTableEmptyState({
        filters: {
          query: "없는제목",
          scopeStage: null,
          scope: null,
          part: null,
        },
        hasLoadedList: true,
        noticeCount: 0,
        registeredTotal: 3,
      }),
    ).toEqual({ variant: "search", query: "없는제목" })
  })
})

describe("isNoticeListClientFilterForbidden", () => {
  it("forbids scope filters on staff notices", () => {
    expect(
      isNoticeListClientFilterForbidden({
        audience: "staff",
        filters: { scopeStage: "school" },
      }),
    ).toBe(true)
  })
})
