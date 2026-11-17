import { describe, expect, it } from "vitest"

import {
  applyNoticeChapterPresidentCreateFormLock,
  isNoticeChapterPresidentChallengerContext,
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
