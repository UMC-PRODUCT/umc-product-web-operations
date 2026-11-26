import { describe, expect, it } from "vitest"

import { canAccessWithdrawalManagement } from "./withdrawal-access"

describe("canAccessWithdrawalManagement", () => {
  it("슈퍼·중앙·지부는 접근 가능하다", () => {
    for (const scope of ["SUPER_ADMIN", "CENTRAL", "CHAPTER"] as const) {
      expect(canAccessWithdrawalManagement({ scope, roleTypes: [] })).toBe(true)
    }
  })

  it("학교 회장·부회장은 접근 가능하다", () => {
    expect(
      canAccessWithdrawalManagement({
        scope: "SCHOOL",
        roleTypes: ["SCHOOL_PRESIDENT"],
      }),
    ).toBe(true)
    expect(
      canAccessWithdrawalManagement({
        scope: "SCHOOL",
        roleTypes: ["SCHOOL_VICE_PRESIDENT"],
      }),
    ).toBe(true)
  })

  it("일반 교내 운영진·파트장은 접근 불가하다", () => {
    expect(
      canAccessWithdrawalManagement({
        scope: "SCHOOL",
        roleTypes: ["SCHOOL_ETC_ADMIN"],
      }),
    ).toBe(false)
    expect(
      canAccessWithdrawalManagement({
        scope: "SCHOOL_PART",
        roleTypes: ["SCHOOL_PART_LEADER"],
      }),
    ).toBe(false)
  })
})
