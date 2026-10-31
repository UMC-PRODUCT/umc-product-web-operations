import { describe, expect, it } from "vitest"

import {
  resolveProfileRoles,
  sortRoleTypesByDisplayPriority,
} from "./profile-roles"

describe("sortRoleTypesByDisplayPriority", () => {
  it("orders concurrent roles by SUPER > HQ_LEAD > HQ_ADMIN > CHAPTER > SCHOOL_ADMIN > SCHOOL_STAFF", () => {
    expect(
      sortRoleTypesByDisplayPriority([
        "SCHOOL_ETC_ADMIN",
        "CENTRAL_OPERATING_TEAM_MEMBER",
        "SCHOOL_PRESIDENT",
        "CHAPTER_PRESIDENT",
        "CENTRAL_PRESIDENT",
      ]),
    ).toEqual([
      "CENTRAL_PRESIDENT",
      "CENTRAL_OPERATING_TEAM_MEMBER",
      "CHAPTER_PRESIDENT",
      "SCHOOL_PRESIDENT",
      "SCHOOL_ETC_ADMIN",
    ])
  })

  it("keeps HQ_LEAD above HQ_ADMIN and SCHOOL_ADMIN above SCHOOL_STAFF", () => {
    expect(
      sortRoleTypesByDisplayPriority([
        "SCHOOL_PART_LEADER",
        "CENTRAL_EDUCATION_TEAM_MEMBER",
        "SCHOOL_VICE_PRESIDENT",
        "CENTRAL_VICE_PRESIDENT",
      ]),
    ).toEqual([
      "CENTRAL_VICE_PRESIDENT",
      "CENTRAL_EDUCATION_TEAM_MEMBER",
      "SCHOOL_VICE_PRESIDENT",
      "SCHOOL_PART_LEADER",
    ])
  })
})

describe("resolveProfileRoles", () => {
  it("puts super admin first, then lower roles in priority order", () => {
    expect(
      resolveProfileRoles({
        isSuperAdmin: true,
        roleTypes: ["SCHOOL_PRESIDENT", "CHAPTER_PRESIDENT"],
        scope: "SUPER_ADMIN",
      }),
    ).toEqual([
      { label: "슈퍼 어드민", color: "challenger-super-admin" },
      { label: "지부 회장", color: "chapter" },
      { label: "교내 회장", color: "campus" },
    ])
  })

  it("dedupes identical central labels while keeping higher priority color", () => {
    expect(
      resolveProfileRoles({
        isSuperAdmin: false,
        roleTypes: [
          "CENTRAL_OPERATING_TEAM_MEMBER",
          "CENTRAL_PRESIDENT",
          "SCHOOL_ETC_ADMIN",
        ],
        scope: "CENTRAL",
      }),
    ).toEqual([
      { label: "중앙 운영진", color: "central" },
      { label: "교내 운영진", color: "campus" },
    ])
  })

  it("falls back to scope label when there are no role types", () => {
    expect(
      resolveProfileRoles({
        isSuperAdmin: false,
        roleTypes: [],
        scope: "CHAPTER",
      }),
    ).toEqual([{ label: "지부 회장", color: "chapter" }])
  })
})
