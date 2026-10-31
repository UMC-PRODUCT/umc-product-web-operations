import { describe, expect, it } from "vitest"

import { encodeChapterScope, encodeSchoolScope } from "./notice-scope-filter"
import {
  isNoticeListClientFilterForbidden,
  resolveNoticeListTableEmptyState,
} from "./resolve-notice-list-ui-state"

const emptyFilters = {
  query: "",
  chapterScope: null,
  schoolScope: null,
  part: null,
  scopeStage: null,
  scope: null,
  staffRecipient: null,
}

describe("resolveNoticeListTableEmptyState", () => {
  it("shows registered empty when there are no notices at all", () => {
    expect(
      resolveNoticeListTableEmptyState({
        audience: "challenger",
        filters: emptyFilters,
        hasLoadedList: true,
        noticeCount: 0,
        registeredTotal: 0,
      }),
    ).toEqual({ variant: "registered" })
  })

  it("shows no-match empty when part filter matches nothing", () => {
    expect(
      resolveNoticeListTableEmptyState({
        audience: "challenger",
        filters: {
          ...emptyFilters,
          part: "WEB",
        },
        hasLoadedList: true,
        noticeCount: 0,
        registeredTotal: 3,
      }),
    ).toEqual({ variant: "noMatch" })
  })

  it("treats staff recipient-only filter as applied for empty state", () => {
    expect(
      resolveNoticeListTableEmptyState({
        audience: "staff",
        filters: {
          ...emptyFilters,
          staffRecipient: "CENTRAL_MEMBER",
        },
        hasLoadedList: true,
        noticeCount: 0,
        registeredTotal: 5,
      }),
    ).toEqual({ variant: "noMatch" })
  })

  it("shows registered empty when only staff scope stage is selected", () => {
    expect(
      resolveNoticeListTableEmptyState({
        audience: "staff",
        filters: {
          ...emptyFilters,
          scopeStage: "chapter",
        },
        hasLoadedList: true,
        noticeCount: 0,
        registeredTotal: 0,
      }),
    ).toEqual({ variant: "registered" })
  })

  it("shows no-match empty when filter applied but scope has no notices", () => {
    expect(
      resolveNoticeListTableEmptyState({
        audience: "challenger",
        filters: {
          ...emptyFilters,
          schoolScope: encodeSchoolScope(1),
        },
        hasLoadedList: true,
        noticeCount: 0,
        registeredTotal: 0,
      }),
    ).toEqual({ variant: "noMatch" })
  })

  it("shows search empty when keyword is present, even with other filters", () => {
    expect(
      resolveNoticeListTableEmptyState({
        audience: "challenger",
        filters: {
          ...emptyFilters,
          query: "dd",
          schoolScope: encodeSchoolScope(1),
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
        audience: "challenger",
        filters: {
          ...emptyFilters,
          query: "없는제목",
        },
        hasLoadedList: true,
        noticeCount: 0,
        registeredTotal: 3,
      }),
    ).toEqual({ variant: "search", query: "없는제목" })
  })
})

describe("isNoticeListClientFilterForbidden", () => {
  it("forbids challenger-only filters on staff notices", () => {
    expect(
      isNoticeListClientFilterForbidden({
        audience: "staff",
        filters: {
          chapterScope: encodeChapterScope(1),
          schoolScope: null,
          scopeStage: null,
        },
      }),
    ).toBe(true)
  })

  it("allows staff school scope filter without challenger schoolScope", () => {
    expect(
      isNoticeListClientFilterForbidden({
        audience: "staff",
        filters: {
          chapterScope: null,
          schoolScope: null,
          scopeStage: "school",
        },
      }),
    ).toBe(false)
  })

  it("does not treat legacy chapter scopeStage on staff as forbidden", () => {
    expect(
      isNoticeListClientFilterForbidden({
        audience: "staff",
        filters: {
          chapterScope: null,
          schoolScope: null,
          scopeStage: "chapter",
        },
      }),
    ).toBe(false)
  })

  it("forbids staff scope stage on challenger notices", () => {
    expect(
      isNoticeListClientFilterForbidden({
        audience: "challenger",
        filters: {
          chapterScope: null,
          schoolScope: null,
          scopeStage: "school",
        },
      }),
    ).toBe(true)
  })
})
