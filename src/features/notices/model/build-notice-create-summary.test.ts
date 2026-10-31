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
    expect(summary.targetLine).toBe("전체 기수")
  })

  it("joins gisu, organization, and parts", () => {
    const summary = buildNoticeCreateSummary(
      {
        ...INITIAL_NOTICE_CREATE_FORM,
        challengerEnabled: true,
        gisuMode: "specific",
        orgMode: "school",
        parts: ["WEB_PRODUCT_ENGINEER"],
      },
      {
        chapterName: null,
        gisuLabel: "9기",
        schoolName: "연세대학교",
      },
    )

    expect(summary.targetLine).toBe("9기 · 연세대학교 · Web PE")
  })
})
