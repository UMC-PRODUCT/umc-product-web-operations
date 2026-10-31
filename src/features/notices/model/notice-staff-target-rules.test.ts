import { describe, expect, it } from "vitest"

import { INITIAL_NOTICE_CREATE_FORM } from "./notice-create-form"
import { validateStaffNoticeCreateForm } from "./notice-staff-target-rules"

describe("validateStaffNoticeCreateForm", () => {
  it("rejects staff-only chapter org mode", () => {
    expect(
      validateStaffNoticeCreateForm({
        ...INITIAL_NOTICE_CREATE_FORM,
        staffEnabled: true,
        orgMode: "chapter",
        chapterId: 1,
      }),
    ).toMatch(/지부/)
  })

  it("rejects school org for central staff scope", () => {
    expect(
      validateStaffNoticeCreateForm({
        ...INITIAL_NOTICE_CREATE_FORM,
        staffEnabled: true,
        gisuMode: "specific",
        targetGisuId: 9,
        staffScope: "SCHOOL_CORE",
        orgMode: "school",
        schoolId: 2,
      }),
    ).toMatch(/학교/)
  })

  it("requires school for campus staff notice", () => {
    expect(
      validateStaffNoticeCreateForm({
        ...INITIAL_NOTICE_CREATE_FORM,
        staffEnabled: true,
        gisuMode: "specific",
        targetGisuId: 9,
        staffScope: "SCHOOL_PART_LEADER",
        orgMode: "school",
        schoolId: null,
      }),
    ).toMatch(/학교/)
  })
})
