import { describe, expect, it } from "vitest"

import { canAccessStaffNoticeTab, resolveNoticeTab } from "./notice-notice-tab"

describe("canAccessStaffNoticeTab", () => {
  it("allows chapter president (maps to central staff tab)", () => {
    expect(
      canAccessStaffNoticeTab({
        isSuperAdmin: false,
        roleTypes: ["CHAPTER_PRESIDENT"],
      }),
    ).toBe(true)
  })

  it("allows central and school staff roles", () => {
    expect(
      canAccessStaffNoticeTab({
        isSuperAdmin: false,
        roleTypes: ["CENTRAL_OPERATING_TEAM_MEMBER"],
      }),
    ).toBe(true)
    expect(
      canAccessStaffNoticeTab({
        isSuperAdmin: false,
        roleTypes: ["SCHOOL_PRESIDENT"],
      }),
    ).toBe(true)
  })
})

describe("resolveNoticeTab", () => {
  it("maps chapter president staff tab to CENTRAL_MEMBER", () => {
    expect(
      resolveNoticeTab("staff", {
        isSuperAdmin: false,
        roleTypes: ["CHAPTER_PRESIDENT"],
      }),
    ).toBe("CENTRAL_MEMBER")
  })

  it("prefers CENTRAL_MEMBER over SCHOOL_CORE when chapter and school roles coexist", () => {
    expect(
      resolveNoticeTab("staff", {
        isSuperAdmin: false,
        roleTypes: ["CHAPTER_PRESIDENT", "SCHOOL_PRESIDENT"],
      }),
    ).toBe("CENTRAL_MEMBER")
  })
})
