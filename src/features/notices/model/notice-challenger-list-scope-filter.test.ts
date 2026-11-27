import { describe, expect, it } from "vitest"

import {
  filterChallengerNoticeSummariesByScope,
  noticeSummaryMatchesChallengerListScope,
} from "./notice-challenger-list-scope-filter"

const baseSummary = {
  createdAt: "2026-01-01T00:00:00Z",
  hasImages: false,
  hasLinks: false,
  hasVote: false,
  mustRead: false,
  title: "t",
  viewCount: 0,
}

describe("noticeSummaryMatchesChallengerListScope", () => {
  it("requires chapter and part when both filters are set", () => {
    expect(
      noticeSummaryMatchesChallengerListScope(
        {
          ...baseSummary,
          id: 1,
          targetInfo: {
            targetNoticeTab: "CHALLENGER",
            targetChapterId: 3,
            targetParts: ["WEB"],
          },
        },
        { chapterId: 3, schoolId: null, part: "WEB" },
      ),
    ).toBe(true)

    expect(
      noticeSummaryMatchesChallengerListScope(
        {
          ...baseSummary,
          id: 2,
          targetInfo: {
            targetNoticeTab: "CHALLENGER",
            targetChapterId: 5,
            targetParts: ["WEB"],
          },
        },
        { chapterId: 3, schoolId: null, part: "WEB" },
      ),
    ).toBe(false)
  })

  it("requires school and part when both filters are set", () => {
    expect(
      noticeSummaryMatchesChallengerListScope(
        {
          ...baseSummary,
          id: 3,
          targetInfo: {
            targetNoticeTab: "CHALLENGER",
            targetSchoolId: 12,
            targetParts: ["ANDROID"],
          },
        },
        { chapterId: null, schoolId: 12, part: "ANDROID" },
      ),
    ).toBe(true)

    expect(
      noticeSummaryMatchesChallengerListScope(
        {
          ...baseSummary,
          id: 4,
          targetInfo: {
            targetNoticeTab: "CHALLENGER",
            targetSchoolId: 12,
            targetParts: ["IOS"],
          },
        },
        { chapterId: null, schoolId: 12, part: "ANDROID" },
      ),
    ).toBe(false)
  })

  it("matches school-only target when chapter filter and chapterSchoolIds are set", () => {
    expect(
      noticeSummaryMatchesChallengerListScope(
        {
          ...baseSummary,
          id: 5,
          targetInfo: {
            targetNoticeTab: "CHALLENGER",
            targetSchoolId: 10,
            targetParts: ["WEB"],
          },
        },
        {
          chapterId: 2,
          schoolId: null,
          part: "WEB",
          chapterSchoolIds: [10, 11],
        },
      ),
    ).toBe(true)

    expect(
      noticeSummaryMatchesChallengerListScope(
        {
          ...baseSummary,
          id: 6,
          targetInfo: {
            targetNoticeTab: "CHALLENGER",
            targetSchoolId: 99,
            targetParts: ["WEB"],
          },
        },
        {
          chapterId: 2,
          schoolId: null,
          part: "WEB",
          chapterSchoolIds: [10, 11],
        },
      ),
    ).toBe(false)
  })

  it("excludes chapter-only notices when part filter is set (empty targetParts)", () => {
    expect(
      noticeSummaryMatchesChallengerListScope(
        {
          ...baseSummary,
          id: 7,
          targetInfo: {
            targetNoticeTab: "CHALLENGER",
            targetChapterId: 2,
            targetParts: [],
          },
        },
        { chapterId: 2, schoolId: null, part: "WEB" },
      ),
    ).toBe(false)
  })

  it("filters list rows with AND semantics", () => {
    const filtered = filterChallengerNoticeSummariesByScope(
      [
        {
          ...baseSummary,
          id: 1,
          targetInfo: {
            targetNoticeTab: "CHALLENGER",
            targetChapterId: 2,
            targetParts: ["WEB"],
          },
        },
        {
          ...baseSummary,
          id: 2,
          targetInfo: {
            targetNoticeTab: "CHALLENGER",
            targetChapterId: 2,
            targetParts: ["DESIGN"],
          },
        },
      ],
      { chapterId: 2, schoolId: null, part: "WEB" },
    )

    expect(filtered.map((row) => row.id)).toEqual([1])
  })
})
