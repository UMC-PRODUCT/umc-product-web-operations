import { describe, expect, it } from "vitest"

import {
  isNoticeListStaffScopeTargetDisabled,
  isStaffUmcWideRecipientScope,
} from "./notice-create-staff-scope"

describe("isNoticeListStaffScopeTargetDisabled", () => {
  it("받는 사람 전체·모든 운영진·중앙 운영진이면 범위·대상을 막는다", () => {
    expect(isNoticeListStaffScopeTargetDisabled(null)).toBe(true)
    expect(isNoticeListStaffScopeTargetDisabled("ALL_STAFF")).toBe(true)
    expect(isNoticeListStaffScopeTargetDisabled("CENTRAL_MEMBER")).toBe(true)
  })

  it("회장단·학교 운영진이면 범위·대상을 연다", () => {
    expect(isNoticeListStaffScopeTargetDisabled("SCHOOL_CORE")).toBe(false)
    expect(isNoticeListStaffScopeTargetDisabled("SCHOOL_PART_LEADER")).toBe(
      false,
    )
  })
})

describe("isStaffUmcWideRecipientScope", () => {
  it("목록 범위 잠금과 작성 UMC wide 규칙은 다르다 (회장단은 목록에서 범위 가능)", () => {
    expect(isStaffUmcWideRecipientScope("SCHOOL_CORE")).toBe(true)
    expect(isNoticeListStaffScopeTargetDisabled("SCHOOL_CORE")).toBe(false)
  })
})
