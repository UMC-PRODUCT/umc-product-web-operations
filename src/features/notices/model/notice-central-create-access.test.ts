import { describe, expect, it } from "vitest"

import {
  applyCentralChallengerDisabledTargetReset,
  applyCentralStaffDisabledTargetReset,
  centralCreateTargetBaselineChallengerOnly,
  centralCreateTargetBaselineStaffOnly,
  enableNoticeCreateChallengerAudience,
  enableNoticeCreateStaffAudience,
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

  it("enableNoticeCreateChallengerAudience turns staff off", () => {
    expect(
      enableNoticeCreateChallengerAudience(
        {
          ...INITIAL_NOTICE_CREATE_FORM,
          challengerEnabled: false,
          staffEnabled: true,
        },
        false,
      ),
    ).toEqual({ challengerEnabled: true, staffEnabled: false })
  })

  it("enableNoticeCreateStaffAudience turns challenger off and resets when central", () => {
    expect(
      enableNoticeCreateStaffAudience(
        {
          ...INITIAL_NOTICE_CREATE_FORM,
          challengerEnabled: true,
          staffEnabled: false,
          orgMode: "school",
          schoolId: 2,
        },
        true,
      ),
    ).toEqual(
      expect.objectContaining({
        challengerEnabled: false,
        staffEnabled: true,
        orgMode: "umc",
        schoolId: null,
      }),
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
