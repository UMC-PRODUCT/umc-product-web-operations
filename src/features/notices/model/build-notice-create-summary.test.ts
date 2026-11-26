import { describe, expect, it } from "vitest"

import { buildNoticeCreateSummary } from "./build-notice-create-summary"
import { INITIAL_NOTICE_CREATE_FORM } from "./notice-create-form"

describe("buildNoticeCreateSummary", () => {
  it("includes default target line for whole-generation challenger notice", () => {
    const summary = buildNoticeCreateSummary(
      {
        ...INITIAL_NOTICE_CREATE_FORM,
        challengerEnabled: true,
        gisuMode: "all",
        orgMode: "umc",
        parts: [],
      },
      { chapterName: null, gisuLabel: null, schoolName: null },
    )

    expect(summary.audienceTags).toEqual(["챌린저"])
    expect(summary.targetLine).toBe("전체 기수 · UMC 전체")
  })

  it("joins gisu and parts for active-gisu challenger notice", () => {
    const summary = buildNoticeCreateSummary(
      {
        ...INITIAL_NOTICE_CREATE_FORM,
        challengerEnabled: true,
        gisuMode: "specific",
        orgMode: "umc",
        targetGisuId: 9,
        parts: ["WEB_PRODUCT_ENGINEER"],
      },
      {
        chapterName: null,
        gisuLabel: "9기",
        schoolName: null,
        sessionGisuId: 9,
      },
    )

    expect(summary.targetLine).toBe("9기 · UMC 전체 · Web PE")
    expect(summary.recipientLine).toBe("9기 · UMC 전체 · Web PE")
  })

  it("keeps target filters and swaps staff chip label for detailed recipients", () => {
    const summary = buildNoticeCreateSummary(
      {
        ...INITIAL_NOTICE_CREATE_FORM,
        staffEnabled: true,
        staffScope: "ALL_STAFF",
        gisuMode: "specific",
        orgMode: "umc",
      },
      { chapterName: null, gisuLabel: "9기", schoolName: null },
    )

    expect(summary.recipientLine).toBe(
      "9기 · 중앙 운영진 + 모든 지부장 + 모든 학교 운영진",
    )
    expect(summary.targetLine).toBe("9기")
  })

  it("appends school and parts after staff recipient detail", () => {
    const summary = buildNoticeCreateSummary(
      {
        ...INITIAL_NOTICE_CREATE_FORM,
        staffEnabled: true,
        staffScope: "SCHOOL_PART_LEADER",
        gisuMode: "specific",
        orgMode: "school",
        schoolId: 1,
        parts: ["WEB_PRODUCT_ENGINEER"],
      },
      { chapterName: null, gisuLabel: "9기", schoolName: "연세대학교" },
    )

    expect(summary.recipientLine).toBe(
      "9기 · 중앙 운영진 + 연세대학교 회장, 부회장, 파트장, 기타 운영진 · Web PE",
    )
  })
})
