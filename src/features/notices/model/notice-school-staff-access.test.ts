import { describe, expect, it } from "vitest"

import { INITIAL_NOTICE_CREATE_FORM } from "./notice-create-form"
import {
  isNoticeSchoolStaffContext,
  NOTICE_SCHOOL_STAFF_STAFF_LIST_RECIPIENTS,
  resolveNoticeSchoolStaffLock,
  validateNoticeSchoolStaffCreateParts,
} from "./notice-school-staff-access"

const organization = {
  chapters: [{ id: 3, name: "수도권" }],
  schools: [{ schoolId: 42, schoolName: "중앙대학교" }],
  schoolsByChapterId: new Map([
    [3, [{ schoolId: 42, schoolName: "중앙대학교" }]],
  ]),
}

describe("isNoticeSchoolStaffContext", () => {
  it("is true for SCHOOL_PART scope with part leader", () => {
    expect(
      isNoticeSchoolStaffContext({
        isSuperAdmin: false,
        scope: "SCHOOL_PART",
        roleTypes: ["SCHOOL_PART_LEADER"],
      }),
    ).toBe(true)
  })

  it("is true for SCHOOL scope with etc admin", () => {
    expect(
      isNoticeSchoolStaffContext({
        isSuperAdmin: false,
        scope: "SCHOOL",
        roleTypes: ["SCHOOL_ETC_ADMIN"],
      }),
    ).toBe(true)
  })

  it("is false when school executive roles are present", () => {
    expect(
      isNoticeSchoolStaffContext({
        isSuperAdmin: false,
        scope: "SCHOOL",
        roleTypes: ["SCHOOL_PRESIDENT", "SCHOOL_PART_LEADER"],
      }),
    ).toBe(false)
  })
})

describe("resolveNoticeSchoolStaffLock", () => {
  it("returns scopes for part leader school", () => {
    expect(
      resolveNoticeSchoolStaffLock(
        {
          isSuperAdmin: false,
          scope: "SCHOOL_PART",
          roleTypes: ["SCHOOL_PART_LEADER"],
          schoolId: 42,
          schoolName: "중앙대학교",
        },
        organization,
      ),
    ).toMatchObject({
      chapterScope: "chapter:3",
      schoolScope: "school:42",
    })
  })
})

describe("validateNoticeSchoolStaffCreateParts", () => {
  it("requires at least one part when audience is selected", () => {
    expect(
      validateNoticeSchoolStaffCreateParts({
        ...INITIAL_NOTICE_CREATE_FORM,
        challengerEnabled: true,
        parts: [],
      }),
    ).toBe("파트를 하나 이상 선택해 주세요")
  })
})

describe("NOTICE_SCHOOL_STAFF_STAFF_LIST_RECIPIENTS", () => {
  it("is school part leader only", () => {
    expect(NOTICE_SCHOOL_STAFF_STAFF_LIST_RECIPIENTS).toEqual([
      "SCHOOL_PART_LEADER",
    ])
  })
})
