import { describe, expect, it } from "vitest"

import { INITIAL_NOTICE_CREATE_FORM } from "./notice-create-form"
import {
  applyNoticeSchoolExecutiveChallengerCreateLock,
  isNoticeSchoolExecutiveContext,
  NOTICE_SCHOOL_EXECUTIVE_STAFF_LIST_RECIPIENTS,
  resolveNoticeSchoolExecutiveLock,
} from "./notice-school-executive-access"

const organization = {
  chapters: [{ id: 3, name: "수도권" }],
  schools: [{ schoolId: 42, schoolName: "중앙대학교" }],
  schoolsByChapterId: new Map([
    [3, [{ schoolId: 42, schoolName: "중앙대학교" }]],
  ]),
}

describe("isNoticeSchoolExecutiveContext", () => {
  it("is true for SCHOOL scope with school president roles", () => {
    expect(
      isNoticeSchoolExecutiveContext({
        isSuperAdmin: false,
        scope: "SCHOOL",
        roleTypes: ["SCHOOL_VICE_PRESIDENT"],
      }),
    ).toBe(true)
  })

  it("is false for CHAPTER scope", () => {
    expect(
      isNoticeSchoolExecutiveContext({
        isSuperAdmin: false,
        scope: "CHAPTER",
        roleTypes: ["SCHOOL_PRESIDENT"],
      }),
    ).toBe(false)
  })
})

describe("resolveNoticeSchoolExecutiveLock", () => {
  it("returns chapter and school scopes for member school", () => {
    expect(
      resolveNoticeSchoolExecutiveLock(
        {
          isSuperAdmin: false,
          scope: "SCHOOL",
          roleTypes: ["SCHOOL_PRESIDENT"],
          schoolId: 42,
          schoolName: "중앙대학교",
        },
        organization,
      ),
    ).toEqual({
      chapterId: 3,
      chapterScope: "chapter:3",
      schoolId: 42,
      schoolName: "중앙대학교",
      schoolScope: "school:42",
    })
  })
})

describe("applyNoticeSchoolExecutiveChallengerCreateLock", () => {
  it("locks gisu and school org for challenger create", () => {
    expect(
      applyNoticeSchoolExecutiveChallengerCreateLock({
        form: INITIAL_NOTICE_CREATE_FORM,
        schoolId: 42,
        targetGisuId: 9,
      }),
    ).toMatchObject({
      gisuMode: "specific",
      targetGisuId: 9,
      orgMode: "school",
      schoolId: 42,
      chapterId: null,
    })
  })
})

describe("NOTICE_SCHOOL_EXECUTIVE_STAFF_LIST_RECIPIENTS", () => {
  it("includes school core and part leader only", () => {
    expect(NOTICE_SCHOOL_EXECUTIVE_STAFF_LIST_RECIPIENTS).toEqual([
      "SCHOOL_CORE",
      "SCHOOL_PART_LEADER",
    ])
  })
})
