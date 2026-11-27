import { describe, expect, it } from "vitest"

import {
  canNoticeCreateShowChallengerChapterOrg,
  canNoticeCreateShowChallengerSchoolOrg,
  canNoticeCreateUseChallengerPartSelection,
  isNoticeCreateChallengerUmcOnlyOrg,
} from "./notice-challenger-target-rules"
import { INITIAL_NOTICE_CREATE_FORM } from "./notice-create-form"

const UMC_ONLY_LOCKS = {
  chapterPresidentChallengerActive: false,
  schoolExecutiveLocked: false,
}

describe("notice challenger target rules", () => {
  it("locks org to UMC for default challenger notices", () => {
    expect(
      isNoticeCreateChallengerUmcOnlyOrg(
        { ...INITIAL_NOTICE_CREATE_FORM, challengerEnabled: true },
        UMC_ONLY_LOCKS,
      ),
    ).toBe(true)
  })

  it("allows chapter/school UI for unrestricted challenger on specific gisu", () => {
    const form = {
      ...INITIAL_NOTICE_CREATE_FORM,
      challengerEnabled: true,
      gisuMode: "specific" as const,
      targetGisuId: 9,
    }

    expect(
      canNoticeCreateShowChallengerChapterOrg(form, UMC_ONLY_LOCKS, {
        unrestrictedChallengerOrg: true,
      }),
    ).toBe(true)
    expect(
      canNoticeCreateShowChallengerSchoolOrg(form, UMC_ONLY_LOCKS, {
        unrestrictedChallengerOrg: true,
      }),
    ).toBe(true)
    expect(
      canNoticeCreateShowChallengerChapterOrg(form, UMC_ONLY_LOCKS, {
        unrestrictedChallengerOrg: false,
      }),
    ).toBe(false)
  })

  it("shows parts only for active gisu", () => {
    expect(
      canNoticeCreateUseChallengerPartSelection(
        {
          ...INITIAL_NOTICE_CREATE_FORM,
          challengerEnabled: true,
          gisuMode: "specific",
          targetGisuId: 9,
        },
        9,
      ),
    ).toBe(true)
    expect(
      canNoticeCreateUseChallengerPartSelection(
        {
          ...INITIAL_NOTICE_CREATE_FORM,
          challengerEnabled: true,
          gisuMode: "specific",
          targetGisuId: 8,
        },
        9,
      ),
    ).toBe(false)
  })
})
