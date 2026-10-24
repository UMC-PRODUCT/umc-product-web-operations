import { describe, expect, it } from "vitest"

import { isOperator, toAdminSession, widestScope } from "./admin-session"

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
    expect(isOperator(session)).toBe(true)
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
