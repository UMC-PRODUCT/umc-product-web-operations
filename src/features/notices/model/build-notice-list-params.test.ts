import { describe, expect, it } from "vitest"

import {
  applyChallengerNoticeListClientFilters,
  applyStaffNoticeListClientFilters,
  buildNoticeListRequest,
  filterStaffNoticeSummariesByRecipient,
  normalizeNoticeListFiltersForApi,
} from "./build-notice-list-params"
import { encodeChapterScope, encodeSchoolScope } from "./notice-scope-filter"

import type { NoticePart } from "../api/notice-api.types"

const webPart = "WEB" as NoticePart

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

  it("applyChallengerNoticeListClientFilters matches targetInfo", () => {
    const summaries = [
      {
        createdAt: "2026-01-01T00:00:00Z",
        hasImages: false,
        hasLinks: false,
        hasVote: false,
        id: 1,
        mustRead: false,
        title: "a",
        viewCount: 0,
        targetInfo: {
          targetNoticeTab: "CHALLENGER" as const,
          targetChapterId: 3,
          targetSchoolId: 12,
          targetParts: [],
        },
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
        targetInfo: {
          targetNoticeTab: "CHALLENGER" as const,
          targetChapterId: 3,
          targetSchoolId: 99,
          targetParts: [webPart],
        },
      },
    ]

    expect(
      applyChallengerNoticeListClientFilters(summaries, {
        ...emptyFilters,
        chapterScope: encodeChapterScope(3),
        schoolScope: encodeSchoolScope(12),
      }).map((item) => item.id),
    ).toEqual([1])

    expect(
      applyChallengerNoticeListClientFilters(summaries, {
        ...emptyFilters,
        part: "WEB",
      }).map((item) => item.id),
    ).toEqual([1, 2])
  })

  it("does not send challenger org/part filters to API", () => {
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

    expect(
      request && request.kind === "list" ? request.params.chapterId : null,
    ).toBeUndefined()
    expect(
      request && request.kind === "list" ? request.params.schoolId : null,
    ).toBeUndefined()
    expect(
      request && request.kind === "list" ? request.params.part : null,
    ).toBeUndefined()
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

  it("does not send staff school/part filters to API (client-side targetInfo)", () => {
    const request = buildNoticeListRequest({
      audience: "staff",
      filters: {
        ...emptyFilters,
        scopeStage: "school",
        scope: encodeSchoolScope(4),
        staffRecipient: "SCHOOL_PART_LEADER",
      },
      session,
    })

    expect(
      request && request.kind === "list" ? request.params.schoolId : null,
    ).toBeUndefined()
    expect(
      request && request.kind === "list" ? request.params.noticeTab : null,
    ).toBe("SCHOOL_CORE")

    const partRequest = buildNoticeListRequest({
      audience: "staff",
      filters: {
        ...emptyFilters,
        scopeStage: "part",
        part: "WEB",
      },
      session,
    })

    expect(
      partRequest && partRequest.kind === "list"
        ? partRequest.params.part
        : null,
    ).toBeUndefined()
  })

  it("applyStaffNoticeListClientFilters narrows by school, part, and recipient", () => {
    const summaries = [
      {
        createdAt: "2026-01-01T00:00:00Z",
        hasImages: false,
        hasLinks: false,
        hasVote: false,
        id: 1,
        mustRead: false,
        title: "a",
        viewCount: 0,
        targetInfo: {
          targetNoticeTab: "SCHOOL_PART_LEADER" as const,
          targetSchoolId: 4,
          targetParts: [webPart],
        },
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
        targetInfo: {
          targetNoticeTab: "SCHOOL_CORE" as const,
          targetSchoolId: 4,
          targetParts: [webPart],
        },
      },
      {
        createdAt: "2026-01-01T00:00:00Z",
        hasImages: false,
        hasLinks: false,
        hasVote: false,
        id: 3,
        mustRead: false,
        title: "c",
        viewCount: 0,
        targetInfo: {
          targetNoticeTab: "SCHOOL_PART_LEADER" as const,
          targetSchoolId: 5,
          targetParts: [webPart],
        },
      },
    ]

    expect(
      applyStaffNoticeListClientFilters(summaries, {
        ...emptyFilters,
        scopeStage: "school",
        scope: encodeSchoolScope(4),
        staffRecipient: "SCHOOL_PART_LEADER",
      }).map((item) => item.id),
    ).toEqual([1])
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
