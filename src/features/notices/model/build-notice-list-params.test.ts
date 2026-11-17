import { describe, expect, it } from "vitest"

import {
  buildNoticeListRequest,
  filterStaffNoticeSummariesByRecipient,
  normalizeNoticeListFiltersForApi,
} from "./build-notice-list-params"
import { encodeChapterScope, encodeSchoolScope } from "./notice-scope-filter"

const emptyFilters = {
  query: "",
  chapterScope: null,
  schoolScope: null,
  part: null,
  scopeStage: null,
  scope: null,
  staffRecipient: null,
}

describe("buildNoticeListRequest", () => {
  const session = {
    gisuId: 9,
    id: 1,
    isAdmin: true,
    isSuperAdmin: false,
    roleTypes: ["SCHOOL_PRESIDENT"],
    schoolId: 5,
  }

  it("ignores staff scope stage until target is selected", () => {
    expect(
      normalizeNoticeListFiltersForApi({
        audience: "staff",
        filters: {
          ...emptyFilters,
          scopeStage: "school",
          scope: null,
        },
      }),
    ).toEqual({
      ...emptyFilters,
      scopeStage: null,
    })
  })

  it("builds challenger list params", () => {
    const request = buildNoticeListRequest({
      audience: "challenger",
      filters: emptyFilters,
      session,
    })

    expect(request).toEqual({
      kind: "list",
      params: {
        gisuId: 9,
        noticeTab: "CHALLENGER",
        page: 0,
        size: 10,
        sort: ["createdAt,DESC"],
      },
    })
  })

  it("builds search params with independent chapter filter", () => {
    const request = buildNoticeListRequest({
      audience: "challenger",
      filters: {
        ...emptyFilters,
        query: "erica",
        chapterScope: encodeChapterScope(3),
      },
      session,
    })

    expect(request).toEqual({
      kind: "search",
      params: expect.objectContaining({
        keyword: "erica",
        noticeTab: "CHALLENGER",
      }),
    })
    expect(
      request && request.kind === "search" ? request.params.part : undefined,
    ).toBeUndefined()
  })

  it("sends challenger chapter/school/part filters to API", () => {
    const request = buildNoticeListRequest({
      audience: "challenger",
      filters: {
        ...emptyFilters,
        chapterScope: encodeChapterScope(3),
        schoolScope: encodeSchoolScope(12),
        part: "WEB",
      },
      session,
    })

    expect(request).toEqual({
      kind: "list",
      params: expect.objectContaining({
        chapterId: 3,
        schoolId: 12,
        part: "WEB",
      }),
    })
  })

  it("sends challenger filters together with search keyword", () => {
    const request = buildNoticeListRequest({
      audience: "challenger",
      filters: {
        ...emptyFilters,
        query: "erica",
        chapterScope: encodeChapterScope(3),
        part: "WEB",
      },
      session,
    })

    expect(request).toEqual({
      kind: "search",
      params: expect.objectContaining({
        keyword: "erica",
        chapterId: 3,
        part: "WEB",
      }),
    })
  })

  it("omits unset filters from challenger params", () => {
    const request = buildNoticeListRequest({
      audience: "challenger",
      filters: emptyFilters,
      session,
    })

    expect(request?.params.chapterId).toBeUndefined()
    expect(request?.params.schoolId).toBeUndefined()
    expect(request?.params.part).toBeUndefined()
  })

  it("builds staff notice tab from role when recipient is unset", () => {
    const request = buildNoticeListRequest({
      audience: "staff",
      filters: {
        ...emptyFilters,
        scopeStage: "chapter",
        scope: encodeChapterScope(1),
        part: "WEB",
      },
      session,
    })

    expect(request?.kind).toBe("list")
    expect(
      request && request.kind === "list" ? request.params.noticeTab : null,
    ).toBe("SCHOOL_CORE")
    expect(
      request && request.kind === "list" ? request.params.chapterId : null,
    ).toBeUndefined()
  })

  it("sends staff school and part filters to API", () => {
    const schoolRequest = buildNoticeListRequest({
      audience: "staff",
      filters: {
        ...emptyFilters,
        scopeStage: "school",
        scope: encodeSchoolScope(4),
        staffRecipient: "SCHOOL_PART_LEADER",
      },
      session,
    })

    expect(schoolRequest?.params.schoolId).toBe(4)
    expect(schoolRequest?.params.part).toBeUndefined()
    expect(schoolRequest?.params.noticeTab).toBe("SCHOOL_CORE")

    const partRequest = buildNoticeListRequest({
      audience: "staff",
      filters: {
        ...emptyFilters,
        scopeStage: "part",
        part: "WEB",
      },
      session,
    })

    expect(partRequest?.params.part).toBe("WEB")
    expect(partRequest?.params.schoolId).toBeUndefined()
  })

  it("filters staff summaries by targetNoticeTab", () => {
    const filtered = filterStaffNoticeSummariesByRecipient(
      [
        {
          createdAt: "2026-01-01T00:00:00Z",
          hasImages: false,
          hasLinks: false,
          hasVote: false,
          id: 1,
          mustRead: false,
          title: "a",
          viewCount: 0,
          targetInfo: { targetNoticeTab: "SCHOOL_CORE" },
        },
        {
          createdAt: "2026-01-01T00:00:00Z",
          hasImages: false,
          hasLinks: false,
          hasVote: false,
          id: 2,
          mustRead: false,
          title: "b",
          viewCount: 0,
          targetInfo: { targetNoticeTab: "SCHOOL_PART_LEADER" },
        },
      ],
      "SCHOOL_CORE",
    )

    expect(filtered.map((item) => item.id)).toEqual([1])
  })

  it("keeps session noticeTab when staff recipient filter is selected", () => {
    const request = buildNoticeListRequest({
      audience: "staff",
      filters: {
        ...emptyFilters,
        staffRecipient: "CENTRAL_MEMBER",
      },
      session,
    })

    expect(
      request && request.kind === "list" ? request.params.noticeTab : null,
    ).toBe("SCHOOL_CORE")
  })
})
