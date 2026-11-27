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
  it("maps chapter president staff tab to SCHOOL_CORE (NOTICE-001)", () => {
    expect(
      resolveNoticeTab("staff", {
        isSuperAdmin: false,
        roleTypes: ["CHAPTER_PRESIDENT"],
      }),
    ).toBe("SCHOOL_CORE")
  })

  it("prefers CENTRAL_MEMBER when central and chapter roles coexist", () => {
    expect(
      resolveNoticeTab("staff", {
        isSuperAdmin: false,
        roleTypes: ["CHAPTER_PRESIDENT", "CENTRAL_OPERATING_TEAM_MEMBER"],
      }),
    ).toBe("CENTRAL_MEMBER")
  })

  it("uses SCHOOL_CORE for chapter president when school roles coexist", () => {
    expect(
      resolveNoticeTab("staff", {
        isSuperAdmin: false,
        roleTypes: ["CHAPTER_PRESIDENT", "SCHOOL_PRESIDENT"],
      }),
    ).toBe("SCHOOL_CORE")
  })

  it("maps school executive to SCHOOL_CORE", () => {
    expect(
      resolveNoticeTab("staff", {
        isSuperAdmin: false,
        roleTypes: ["SCHOOL_PRESIDENT"],
      }),
    ).toBe("SCHOOL_CORE")
  })

  it("maps school etc admin to SCHOOL_PART_LEADER (NOTICE-001 조회 직책)", () => {
    expect(
      resolveNoticeTab("staff", {
        isSuperAdmin: false,
        roleTypes: ["SCHOOL_ETC_ADMIN"],
      }),
    ).toBe("SCHOOL_PART_LEADER")
  })

  it("prefers SCHOOL_CORE over SCHOOL_ETC when executive and etc admin coexist", () => {
    expect(
      resolveNoticeTab("staff", {
        isSuperAdmin: false,
        roleTypes: ["SCHOOL_VICE_PRESIDENT", "SCHOOL_ETC_ADMIN"],
      }),
    ).toBe("SCHOOL_CORE")
  })
})
