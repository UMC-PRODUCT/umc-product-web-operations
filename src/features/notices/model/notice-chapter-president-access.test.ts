import { describe, expect, it } from "vitest"

import {
  applyNoticeChapterPresidentCreateFormLock,
  filterChallengerNoticeSummariesForChapterPresident,
  filterStaffNoticeSummariesForChapterPresident,
  filterStaffNoticeSummariesForChapterPresidentRecipient,
  isNoticeChapterPresidentChallengerContext,
  noticeSummaryVisibleToChapterPresidentChallengerList,
  noticeSummaryVisibleToChapterPresidentStaffList,
  resolveNoticeChapterPresidentChallengerLock,
} from "./notice-chapter-president-access"
import { INITIAL_NOTICE_CREATE_FORM } from "./notice-create-form"

const multiChapterOrganization = {
  chapters: [
    { id: 1, name: "수달" },
    { id: 2, name: "수도권" },
  ],
  schools: [
    { schoolId: 10, schoolName: "A대" },
    { schoolId: 11, schoolName: "B대" },
  ],
  schoolsByChapterId: new Map([
    [
      2,
      [
        { schoolId: 10, schoolName: "A대" },
        { schoolId: 11, schoolName: "B대" },
      ],
    ],
  ]),
}

const singleChapterOrganization = {
  chapters: [{ id: 2, name: "수도권" }],
  schools: [
    { schoolId: 10, schoolName: "A대" },
    { schoolId: 11, schoolName: "B대" },
  ],
  schoolsByChapterId: new Map([
    [
      2,
      [
        { schoolId: 10, schoolName: "A대" },
        { schoolId: 11, schoolName: "B대" },
      ],
    ],
  ]),
}

describe("isNoticeChapterPresidentChallengerContext", () => {
  it("is true for CHAPTER scope with CHAPTER_PRESIDENT role", () => {
    expect(
      isNoticeChapterPresidentChallengerContext({
        isSuperAdmin: false,
        scope: "CHAPTER",
        roleTypes: ["CHAPTER_PRESIDENT", "SCHOOL_PRESIDENT"],
      }),
    ).toBe(true)
  })

  it("is false for super admin and non-chapter scope", () => {
    expect(
      isNoticeChapterPresidentChallengerContext({
        isSuperAdmin: true,
        scope: "CHAPTER",
        roleTypes: ["CHAPTER_PRESIDENT"],
      }),
    ).toBe(false)
    expect(
      isNoticeChapterPresidentChallengerContext({
        isSuperAdmin: false,
        scope: "SCHOOL",
        roleTypes: ["SCHOOL_PRESIDENT"],
      }),
    ).toBe(false)
  })
})

describe("resolveNoticeChapterPresidentChallengerLock", () => {
  it("returns locked chapter scope and chapter schools", () => {
    expect(
      resolveNoticeChapterPresidentChallengerLock(
        {
          isSuperAdmin: false,
          scope: "CHAPTER",
          roleTypes: ["CHAPTER_PRESIDENT"],
          schoolId: 10,
        },
        singleChapterOrganization,
      ),
    ).toEqual({
      status: "locked",
      lock: {
        chapterId: 2,
        chapterName: "수도권",
        chapterScope: "chapter:2",
        schoolOptions: singleChapterOrganization.schoolsByChapterId.get(2),
      },
    })
  })

  it("returns not-applicable for non chapter presidents", () => {
    expect(
      resolveNoticeChapterPresidentChallengerLock(
        {
          isSuperAdmin: false,
          scope: "SCHOOL",
          roleTypes: ["SCHOOL_PRESIDENT"],
          schoolId: 10,
        },
        multiChapterOrganization,
      ),
    ).toEqual({ status: "not-applicable" })
  })

  it("returns unresolved when schoolId is missing among multiple chapters", () => {
    expect(
      resolveNoticeChapterPresidentChallengerLock(
        {
          isSuperAdmin: false,
          scope: "CHAPTER",
          roleTypes: ["CHAPTER_PRESIDENT"],
          schoolId: null,
        },
        multiChapterOrganization,
      ),
    ).toEqual({ status: "unresolved" })
  })

  it("returns unresolved when schoolId is not in organization", () => {
    expect(
      resolveNoticeChapterPresidentChallengerLock(
        {
          isSuperAdmin: false,
          scope: "CHAPTER",
          roleTypes: ["CHAPTER_PRESIDENT"],
          schoolId: 999,
        },
        multiChapterOrganization,
      ),
    ).toEqual({ status: "unresolved" })
  })

  it("returns unresolved when organization is unavailable", () => {
    expect(
      resolveNoticeChapterPresidentChallengerLock(
        {
          isSuperAdmin: false,
          scope: "CHAPTER",
          roleTypes: ["CHAPTER_PRESIDENT"],
          schoolId: 10,
        },
        null,
      ),
    ).toEqual({ status: "unresolved" })
  })
})

describe("noticeSummaryVisibleToChapterPresidentChallengerList", () => {
  const scope = { chapterId: 2, schoolIdsInChapter: [10, 11], sessionGisuId: 9 }

  const base = {
    createdAt: "2026-01-01T00:00:00Z",
    hasImages: false,
    hasLinks: false,
    hasVote: false,
    mustRead: false,
    title: "t",
    viewCount: 0,
  }

  it("includes same-gisu all-chapter notices regardless of part filter", () => {
    expect(
      noticeSummaryVisibleToChapterPresidentChallengerList(
        {
          ...base,
          id: 1,
          targetInfo: {
            targetNoticeTab: "CHALLENGER",
            targetGisuId: 9,
            targetParts: ["IOS"],
          },
        },
        scope,
        { chapterId: null, schoolId: null, part: "WEB" },
      ),
    ).toBe(true)
  })

  it("excludes other-chapter and other-school challenger notices", () => {
    expect(
      noticeSummaryVisibleToChapterPresidentChallengerList(
        {
          ...base,
          id: 2,
          targetInfo: {
            targetNoticeTab: "CHALLENGER",
            targetChapterId: 99,
          },
        },
        scope,
      ),
    ).toBe(false)

    expect(
      noticeSummaryVisibleToChapterPresidentChallengerList(
        {
          ...base,
          id: 3,
          targetInfo: {
            targetNoticeTab: "CHALLENGER",
            targetSchoolId: 77,
          },
        },
        scope,
      ),
    ).toBe(false)
  })

  it("narrows to selected chapter on chapter + part filter", () => {
    expect(
      noticeSummaryVisibleToChapterPresidentChallengerList(
        {
          ...base,
          id: 7,
          targetInfo: {
            targetNoticeTab: "CHALLENGER",
            targetGisuId: 9,
            targetParts: ["WEB"],
          },
        },
        scope,
        { chapterId: 2, schoolId: null, part: "WEB" },
      ),
    ).toBe(false)
  })

  it("applies part filter only to school/chapter scoped notices", () => {
    const scoped = noticeSummaryVisibleToChapterPresidentChallengerList(
      {
        ...base,
        id: 4,
        targetInfo: {
          targetNoticeTab: "CHALLENGER",
          targetSchoolId: 10,
          targetParts: ["WEB"],
        },
      },
      scope,
      { chapterId: null, schoolId: null, part: "ANDROID" },
    )
    expect(scoped).toBe(false)

    const filtered = filterChallengerNoticeSummariesForChapterPresident(
      [
        {
          ...base,
          id: 5,
          targetInfo: {
            targetNoticeTab: "CHALLENGER",
            targetGisuId: 9,
            targetParts: ["IOS"],
          },
        },
        {
          ...base,
          id: 6,
          targetInfo: {
            targetNoticeTab: "CHALLENGER",
            targetSchoolId: 10,
            targetParts: ["WEB"],
          },
        },
      ],
      scope,
      { chapterId: null, schoolId: null, part: "WEB" },
    )

    expect(filtered.map((row) => row.id).sort()).toEqual([5, 6])
  })
})

describe("noticeSummaryVisibleToChapterPresidentStaffList", () => {
  const base = {
    createdAt: "2026-01-01T00:00:00Z",
    hasImages: false,
    hasLinks: false,
    hasVote: false,
    mustRead: false,
    title: "t",
    viewCount: 0,
  }

  it("allows school-core and maps umc-wide school-part-leader to 모든 운영진", () => {
    expect(
      noticeSummaryVisibleToChapterPresidentStaffList({
        ...base,
        id: 1,
        targetInfo: {
          targetNoticeTab: "SCHOOL_CORE",
          targetSchoolId: null,
        },
      }),
    ).toBe(true)

    expect(
      noticeSummaryVisibleToChapterPresidentStaffList({
        ...base,
        id: 2,
        targetInfo: {
          targetNoticeTab: "SCHOOL_PART_LEADER",
          targetSchoolId: null,
          targetParts: [],
        },
      }),
    ).toBe(true)
  })

  it("matches chapter president staff recipient filters", () => {
    const umcAllStaff = {
      ...base,
      id: 7,
      targetInfo: {
        targetNoticeTab: "SCHOOL_PART_LEADER" as const,
        targetSchoolId: null,
        targetParts: [],
      },
    }

    expect(
      filterStaffNoticeSummariesForChapterPresidentRecipient(
        [umcAllStaff],
        "ALL_STAFF",
      ).map((row) => row.id),
    ).toEqual([7])

    expect(
      filterStaffNoticeSummariesForChapterPresidentRecipient(
        [umcAllStaff],
        "SCHOOL_CORE",
      ),
    ).toHaveLength(0)
  })

  it("rejects school-bound and 학교 운영진 tab notices", () => {
    expect(
      noticeSummaryVisibleToChapterPresidentStaffList({
        ...base,
        id: 8,
        targetInfo: {
          targetNoticeTab: "SCHOOL_PART_LEADER",
          targetSchoolId: 10,
          targetParts: [],
        },
      }),
    ).toBe(false)

    expect(
      noticeSummaryVisibleToChapterPresidentStaffList({
        ...base,
        id: 9,
        targetInfo: {
          targetNoticeTab: "SCHOOL_PART_LEADER",
          targetSchoolId: null,
          targetParts: ["WEB"],
        },
      }),
    ).toBe(false)
  })

  it("rejects central member and school-specified staff notices", () => {
    expect(
      noticeSummaryVisibleToChapterPresidentStaffList({
        ...base,
        id: 3,
        targetInfo: { targetNoticeTab: "CENTRAL_MEMBER" },
      }),
    ).toBe(false)

    expect(
      noticeSummaryVisibleToChapterPresidentStaffList({
        ...base,
        id: 4,
        targetInfo: {
          targetNoticeTab: "SCHOOL_CORE",
          targetSchoolId: 10,
        },
      }),
    ).toBe(false)

    const filtered = filterStaffNoticeSummariesForChapterPresident([
      {
        ...base,
        id: 5,
        targetInfo: { targetNoticeTab: "SCHOOL_CORE" },
      },
      {
        ...base,
        id: 6,
        targetInfo: {
          targetNoticeTab: "CENTRAL_MEMBER",
        },
      },
    ])

    expect(filtered.map((row) => row.id)).toEqual([5])
  })
})

describe("applyNoticeChapterPresidentCreateFormLock", () => {
  it("locks create form to challenger + specific gisu + chapter org", () => {
    expect(
      applyNoticeChapterPresidentCreateFormLock({
        form: INITIAL_NOTICE_CREATE_FORM,
        chapterId: 2,
        targetGisuId: 9,
      }),
    ).toMatchObject({
      gisuMode: "specific",
      targetGisuId: 9,
      orgMode: "chapter",
      chapterId: 2,
      schoolId: null,
    })
  })
})
