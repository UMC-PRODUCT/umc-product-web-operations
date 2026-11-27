import { describe, expect, it } from "vitest"

import {
  applyCentralChallengerDisabledTargetReset,
  applyCentralStaffDisabledTargetReset,
  applyNoticeCentralHqChallengerGisuTarget,
  applyNoticeCentralLeadStaffScopeTarget,
  centralCreateTargetBaselineChallengerOnly,
  centralCreateTargetBaselineStaffOnly,
  enableNoticeCreateChallengerAudience,
  enableNoticeCreateStaffAudience,
  isNoticeCentralAdminStaffChipRestricted,
  isNoticeCentralHqChallengerGisuLocked,
  isNoticeCentralHqStaffGisuLocked,
  isNoticeCentralLeadStaffChipRestricted,
  isNoticeCentralLeadStaffGisuLocked,
  isNoticeCentralLeadStaffOrgRowHidden,
  isNoticeCentralUnrestrictedCreateContext,
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

describe("HQ_LEAD staff scope target rules", () => {
  it("locks gisu for all staff, central, and school core chips", () => {
    const base = { staffEnabled: true as const }
    expect(
      isNoticeCentralLeadStaffGisuLocked(true, {
        ...base,
        staffScope: "ALL_STAFF",
      }),
    ).toBe(true)
    expect(
      isNoticeCentralLeadStaffGisuLocked(true, {
        ...base,
        staffScope: "CENTRAL_MEMBER",
      }),
    ).toBe(true)
    expect(
      isNoticeCentralLeadStaffGisuLocked(true, {
        ...base,
        staffScope: "SCHOOL_CORE",
      }),
    ).toBe(true)
    expect(
      isNoticeCentralLeadStaffGisuLocked(true, {
        ...base,
        staffScope: "SCHOOL_PART_LEADER",
      }),
    ).toBe(false)
  })

  it("hides org row only for central member staff scope", () => {
    expect(
      isNoticeCentralLeadStaffOrgRowHidden(true, {
        challengerEnabled: false,
        staffEnabled: true,
        staffScope: "CENTRAL_MEMBER",
      }),
    ).toBe(true)
    expect(
      isNoticeCentralLeadStaffOrgRowHidden(true, {
        challengerEnabled: false,
        staffEnabled: true,
        staffScope: "ALL_STAFF",
      }),
    ).toBe(false)
  })

  it("fixes active gisu and resets org for central member", () => {
    expect(
      applyNoticeCentralLeadStaffScopeTarget(
        {
          ...INITIAL_NOTICE_CREATE_FORM,
          staffEnabled: true,
          staffScope: "CENTRAL_MEMBER",
          gisuMode: "all",
          orgMode: "school",
          schoolId: 3,
        },
        9,
      ),
    ).toMatchObject({
      gisuMode: "specific",
      targetGisuId: 9,
      orgMode: "umc",
      schoolId: null,
    })
  })

  it("fixes only gisu for all staff", () => {
    expect(
      applyNoticeCentralLeadStaffScopeTarget(
        {
          ...INITIAL_NOTICE_CREATE_FORM,
          staffEnabled: true,
          staffScope: "ALL_STAFF",
          gisuMode: "all",
          orgMode: "umc",
        },
        9,
      ),
    ).toEqual({
      gisuMode: "specific",
      targetGisuId: 9,
    })
  })
})

describe("HQ challenger gisu lock", () => {
  it("locks active gisu for HQ roles on challenger-only notices", () => {
    expect(
      isNoticeCentralHqChallengerGisuLocked(true, false, {
        challengerEnabled: true,
        staffEnabled: false,
      }),
    ).toBe(true)
    expect(
      isNoticeCentralHqChallengerGisuLocked(false, true, {
        challengerEnabled: true,
        staffEnabled: false,
      }),
    ).toBe(true)
    expect(
      isNoticeCentralHqChallengerGisuLocked(true, false, {
        challengerEnabled: false,
        staffEnabled: true,
      }),
    ).toBe(false)
  })

  it("patches all-gisu challenger to active gisu", () => {
    expect(
      applyNoticeCentralHqChallengerGisuTarget(
        {
          ...INITIAL_NOTICE_CREATE_FORM,
          challengerEnabled: true,
          gisuMode: "all",
          staffEnabled: false,
          targetGisuId: null,
        },
        9,
        {
          centralAdminStaffChipRestricted: false,
          centralLeadStaffChipRestricted: true,
        },
      ),
    ).toEqual({
      gisuMode: "specific",
      targetGisuId: 9,
    })
  })
})

describe("HQ_ADMIN staff scope rules", () => {
  it("restricts operating team admin chips", () => {
    expect(
      isNoticeCentralAdminStaffChipRestricted({
        isSuperAdmin: false,
        scope: "CENTRAL",
        roleTypes: ["CENTRAL_OPERATING_TEAM_MEMBER"],
      }),
    ).toBe(true)
  })

  it("locks gisu for all staff and school core only", () => {
    expect(
      isNoticeCentralHqStaffGisuLocked(false, true, {
        staffEnabled: true,
        staffScope: "ALL_STAFF",
      }),
    ).toBe(true)
    expect(
      isNoticeCentralHqStaffGisuLocked(false, true, {
        staffEnabled: true,
        staffScope: "CENTRAL_MEMBER",
      }),
    ).toBe(false)
  })
})

describe("SUPER_ADMIN notice create", () => {
  const superAdminCentralOperating = {
    isSuperAdmin: true,
    scope: "SUPER_ADMIN" as const,
    roleTypes: ["CENTRAL_OPERATING_TEAM_MEMBER"],
  }

  it("does not apply HQ chip or gisu locks", () => {
    expect(
      isNoticeCentralLeadStaffChipRestricted(superAdminCentralOperating),
    ).toBe(false)
    expect(
      isNoticeCentralAdminStaffChipRestricted(superAdminCentralOperating),
    ).toBe(false)
    expect(
      isNoticeCentralUnrestrictedCreateContext(superAdminCentralOperating),
    ).toBe(true)
  })
})

describe("isNoticeCentralLeadStaffChipRestricted", () => {
  it("restricts central president and vice president only", () => {
    expect(
      isNoticeCentralLeadStaffChipRestricted({
        isSuperAdmin: false,
        scope: "CENTRAL",
        roleTypes: ["CENTRAL_PRESIDENT"],
      }),
    ).toBe(true)
    expect(
      isNoticeCentralLeadStaffChipRestricted({
        isSuperAdmin: false,
        scope: "CENTRAL",
        roleTypes: ["CENTRAL_VICE_PRESIDENT"],
      }),
    ).toBe(true)
  })

  it("does not restrict super admin or operating team", () => {
    expect(
      isNoticeCentralLeadStaffChipRestricted({
        isSuperAdmin: true,
        scope: "CENTRAL",
        roleTypes: ["CENTRAL_PRESIDENT"],
      }),
    ).toBe(false)
    expect(
      isNoticeCentralLeadStaffChipRestricted({
        isSuperAdmin: false,
        scope: "CENTRAL",
        roleTypes: ["CENTRAL_OPERATING_TEAM_MEMBER"],
      }),
    ).toBe(false)
  })
})
