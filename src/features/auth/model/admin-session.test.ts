import { describe, expect, it } from "vitest"

import {
  isOperator,
  schoolExecutiveLock,
  toAdminSession,
  toParticipatedGisus,
  widestScope,
} from "./admin-session"

import type { RoleType } from "./admin-session"

function scope(isSuperAdmin: boolean, roleTypes: RoleType[]) {
  return widestScope({ isSuperAdmin, roleTypes })
}

describe("widestScope", () => {
  it("picks the widest role", () => {
    expect(scope(true, ["SCHOOL_PRESIDENT"])).toBe("SUPER_ADMIN")
    expect(
      scope(false, ["CHAPTER_PRESIDENT", "CENTRAL_OPERATING_TEAM_MEMBER"]),
    ).toBe("CENTRAL")
    expect(scope(false, ["CHAPTER_PRESIDENT", "SCHOOL_PRESIDENT"])).toBe(
      "CHAPTER",
    )
    expect(scope(false, ["SCHOOL_PART_LEADER", "SCHOOL_VICE_PRESIDENT"])).toBe(
      "SCHOOL",
    )
    expect(scope(false, ["SCHOOL_PART_LEADER"])).toBe("SCHOOL_PART")
    expect(scope(false, [])).toBeNull()
  })
})

describe("toAdminSession", () => {
  it("keeps an active admin session", () => {
    const session = toAdminSession({
      id: 3,
      name: "하늘",
      isSuperAdmin: false,
      schoolId: 9,
      schoolName: "중앙대학교",
      currentGisuMemberInfo: {
        gisuId: 11,
        generation: 8,
        isAdmin: true,
        roleTypes: ["SCHOOL_PRESIDENT", "UNKNOWN"],
      },
    })

    expect(session.roleTypes).toEqual(["SCHOOL_PRESIDENT"])
    expect(session.scope).toBe("SCHOOL")
    expect(session.gisuId).toBe(11)
    expect(session.profileImageUrl).toBeNull()
    expect(session.participatedGisus).toEqual([{ gisuId: 11, generation: 8 }])
    expect(isOperator(session)).toBe(true)
  })

  it("maps challengerHistory into participated gisus (unique, history first)", () => {
    const session = toAdminSession({
      id: 3,
      name: "하늘",
      isSuperAdmin: false,
      challengerHistory: [
        { gisuId: 12, generation: 9 },
        { gisuId: 11, generation: 8 },
        { gisuId: 12, generation: 9 },
      ],
      currentGisuMemberInfo: {
        gisuId: 10,
        generation: 7,
        isAdmin: true,
        roleTypes: ["SCHOOL_PRESIDENT"],
      },
    })

    expect(session.participatedGisus).toEqual([
      { gisuId: 12, generation: 9 },
      { gisuId: 11, generation: 8 },
      { gisuId: 10, generation: 7 },
    ])
  })

  it("builds participated gisus from history alone", () => {
    expect(
      toParticipatedGisus({
        challengerHistory: [
          { gisuId: 5, generation: 11 },
          { gisuId: null, generation: 10 },
        ],
      }),
    ).toEqual([{ gisuId: 5, generation: 11 }])
  })

  it("coerces string ids from MEMBER-201 into participated gisus", () => {
    const session = toAdminSession({
      id: "33",
      name: "QA32",
      isSuperAdmin: false,
      schoolId: "29",
      schoolName: "중앙대학교",
      currentGisuMemberInfo: {
        gisuId: "6",
        generation: "11",
        isAdmin: true,
        roleTypes: ["SCHOOL_ETC_ADMIN"],
      },
      challengerHistory: [
        {
          challengerId: "32",
          gisuId: "6",
          generation: "11",
        },
        {
          challengerId: "31",
          gisuId: "5",
          generation: "10",
        },
      ],
    })

    expect(session.gisuId).toBe(6)
    expect(session.generation).toBe(11)
    expect(session.participatedGisus).toEqual([
      { gisuId: 6, generation: 11 },
      { gisuId: 5, generation: 10 },
    ])
  })

  it("keeps a trimmed profile image url", () => {
    const session = toAdminSession({
      id: 3,
      name: "하늘",
      profileImageUrl: " https://cdn.example/avatar.png ",
      currentGisuMemberInfo: {
        gisuId: 11,
        generation: 8,
        isAdmin: true,
        roleTypes: ["SCHOOL_PRESIDENT"],
      },
    })

    expect(session.profileImageUrl).toBe("https://cdn.example/avatar.png")
  })

  it("allows only a super admin when the active gisu is missing", () => {
    const session = toAdminSession({
      id: 1,
      name: "관리자",
      isSuperAdmin: true,
      currentGisuMemberInfo: null,
    })

    expect(session.isAdmin).toBe(false)
    expect(session.scope).toBe("SUPER_ADMIN")
    expect(isOperator(session)).toBe(true)
  })

  it("rejects a member without an admin role", () => {
    const session = toAdminSession({
      id: 2,
      name: "챌린저",
      isSuperAdmin: false,
      currentGisuMemberInfo: {
        gisuId: 11,
        generation: 8,
        isAdmin: false,
        roleTypes: [],
      },
    })

    expect(isOperator(session)).toBe(false)
    expect(session.scope).toBeNull()
  })
})

describe("schoolExecutiveLock", () => {
  it("locks a school president to their school", () => {
    const session = toAdminSession({
      id: 3,
      name: "하늘",
      isSuperAdmin: false,
      schoolId: 9,
      schoolName: "중앙대학교",
      currentGisuMemberInfo: {
        gisuId: 11,
        generation: 8,
        isAdmin: true,
        roleTypes: ["SCHOOL_PRESIDENT"],
      },
    })

    expect(schoolExecutiveLock(session)).toEqual({
      schoolId: "9",
      schoolName: "중앙대학교",
    })
  })

  it("does not lock a wider role or a campus admin", () => {
    const president = toAdminSession({
      id: 4,
      name: "지부",
      schoolId: 9,
      schoolName: "중앙대학교",
      currentGisuMemberInfo: {
        gisuId: 11,
        generation: 8,
        isAdmin: true,
        roleTypes: ["CHAPTER_PRESIDENT", "SCHOOL_PRESIDENT"],
      },
    })
    const campus = toAdminSession({
      id: 5,
      name: "파트장",
      schoolId: 9,
      schoolName: "중앙대학교",
      currentGisuMemberInfo: {
        gisuId: 11,
        generation: 8,
        isAdmin: true,
        roleTypes: ["SCHOOL_ETC_ADMIN"],
      },
    })

    expect(schoolExecutiveLock(president)).toBeNull()
    expect(schoolExecutiveLock(campus)).toBeNull()
  })
})
