import { describe, expect, it } from "vitest"

import {
  applyCentralChallengerDisabledTargetReset,
  applyCentralStaffDisabledTargetReset,
  centralCreateTargetBaselineChallengerOnly,
  centralCreateTargetBaselineStaffOnly,
} from "./notice-central-create-access"
import { INITIAL_NOTICE_CREATE_FORM } from "./notice-create-form"

describe("central create target baselines on uncheck", () => {
  it("challenger off with staff off restores default target", () => {
    expect(
      applyCentralChallengerDisabledTargetReset({
        ...INITIAL_NOTICE_CREATE_FORM,
        challengerEnabled: true,
        gisuMode: "specific",
        orgMode: "school",
        schoolId: 1,
        parts: ["PLAN"],
      }),
    ).toMatchObject({
      challengerEnabled: false,
      staffEnabled: false,
      gisuMode: "all",
      orgMode: "umc",
      parts: [],
    })
  })

  it("challenger off with staff on restores staff-only baseline", () => {
    expect(
      applyCentralChallengerDisabledTargetReset({
        ...INITIAL_NOTICE_CREATE_FORM,
        challengerEnabled: true,
        staffEnabled: true,
        gisuMode: "all",
        orgMode: "chapter",
        chapterId: 3,
      }),
    ).toEqual(
      expect.objectContaining(
        centralCreateTargetBaselineStaffOnly("CENTRAL_MEMBER"),
      ),
    )
  })

  it("staff off with challenger on restores challenger-only baseline", () => {
    expect(
      applyCentralStaffDisabledTargetReset({
        ...INITIAL_NOTICE_CREATE_FORM,
        challengerEnabled: true,
        staffEnabled: true,
        gisuMode: "specific",
        orgMode: "school",
        schoolId: 2,
      }),
    ).toEqual(
      expect.objectContaining(centralCreateTargetBaselineChallengerOnly()),
    )
  })
})
