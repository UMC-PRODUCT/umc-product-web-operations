import { describe, expect, it } from "vitest"

import {
  isNoticeTargetInfoUmcWideAllStaff,
  resolveNoticeStaffRecipientScope,
} from "./notice-staff-recipient-display"

describe("resolveNoticeStaffRecipientScope", () => {
  it("maps UMC-wide SCHOOL_PART_LEADER to ALL_STAFF scope", () => {
    expect(
      resolveNoticeStaffRecipientScope({
        targetNoticeTab: "SCHOOL_PART_LEADER",
        targetGisuId: 9,
        targetSchoolId: null,
        targetParts: [],
      }),
    ).toBe("ALL_STAFF")
  })

  it("maps native ALL_STAFF tab to ALL_STAFF scope", () => {
    expect(
      resolveNoticeStaffRecipientScope({
        targetNoticeTab: "ALL_STAFF",
        targetGisuId: 9,
      }),
    ).toBe("ALL_STAFF")
  })

  it("maps school-scoped SCHOOL_PART_LEADER to school staff scope", () => {
    expect(
      resolveNoticeStaffRecipientScope({
        targetNoticeTab: "SCHOOL_PART_LEADER",
        targetSchoolId: 5,
        targetParts: [],
      }),
    ).toBe("SCHOOL_PART_LEADER")
  })

  it("treats empty school id as UMC-wide all staff", () => {
    expect(
      isNoticeTargetInfoUmcWideAllStaff({
        targetNoticeTab: "SCHOOL_PART_LEADER",
        targetSchoolId: 0,
      }),
    ).toBe(true)
  })
})
