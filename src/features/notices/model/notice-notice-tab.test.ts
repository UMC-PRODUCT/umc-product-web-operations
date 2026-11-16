import { describe, expect, it } from "vitest"

import { canAccessStaffNoticeTab, resolveNoticeTab } from "./notice-notice-tab"

describe("canAccessStaffNoticeTab", () => {
  it("denies chapter president alone", () => {
    expect(
      canAccessStaffNoticeTab({
        isSuperAdmin: false,
        roleTypes: ["CHAPTER_PRESIDENT"],
      }),
    ).toBe(false)
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
  it("does not map chapter president staff tab to CENTRAL_MEMBER", () => {
    expect(
      resolveNoticeTab("staff", {
        isSuperAdmin: false,
        roleTypes: ["CHAPTER_PRESIDENT"],
      }),
    ).toBe("CHALLENGER")
  })
})
