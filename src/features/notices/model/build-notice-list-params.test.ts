import { describe, expect, it } from "vitest"

import { buildNoticeListRequest } from "./build-notice-list-params"
import { encodeChapterScope, encodeSchoolScope } from "./notice-scope-filter"

describe("buildNoticeListRequest", () => {
  const session = {
    gisuId: 9,
    id: 1,
    isAdmin: true,
    isSuperAdmin: false,
    roleTypes: ["SCHOOL_PRESIDENT"],
    schoolId: 5,
  }

  it("builds challenger list params", () => {
    const request = buildNoticeListRequest({
      audience: "challenger",
      filters: { query: "", scopeStage: null, scope: null, part: null },
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

  it("builds search params with chapter scope stage only", () => {
    const request = buildNoticeListRequest({
      audience: "challenger",
      filters: {
        query: "erica",
        scopeStage: "chapter",
        scope: encodeChapterScope(3),
        part: null,
      },
      session,
    })

    expect(request).toEqual({
      kind: "search",
      params: expect.objectContaining({
        keyword: "erica",
        noticeTab: "CHALLENGER",
        chapterId: 3,
      }),
    })
    expect(
      request && request.kind === "search" ? request.params.part : undefined,
    ).toBeUndefined()
  })

  it("maps school scope to schoolId", () => {
    const request = buildNoticeListRequest({
      audience: "challenger",
      filters: {
        query: "",
        scopeStage: "school",
        scope: encodeSchoolScope(12),
        part: null,
      },
      session,
    })

    expect(
      request && request.kind === "list" ? request.params.schoolId : null,
    ).toBe(12)
  })

  it("builds staff notice tab from role", () => {
    const request = buildNoticeListRequest({
      audience: "staff",
      filters: {
        query: "",
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
})
