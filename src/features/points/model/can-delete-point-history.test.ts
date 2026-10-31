import { describe, expect, it } from "vitest"

import { canDeletePointHistory } from "./can-delete-point-history"

describe("canDeletePointHistory", () => {
  it("allows super admin and central presidents", () => {
    expect(canDeletePointHistory({ isSuperAdmin: true, roleTypes: [] })).toBe(
      true,
    )
    expect(
      canDeletePointHistory({
        isSuperAdmin: false,
        roleTypes: ["CENTRAL_PRESIDENT"],
      }),
    ).toBe(true)
    expect(
      canDeletePointHistory({
        isSuperAdmin: false,
        roleTypes: ["CENTRAL_VICE_PRESIDENT"],
      }),
    ).toBe(true)
  })

  it("denies central staff and school roles", () => {
    expect(
      canDeletePointHistory({
        isSuperAdmin: false,
        roleTypes: ["CENTRAL_OPERATING_TEAM_MEMBER"],
      }),
    ).toBe(false)
    expect(
      canDeletePointHistory({
        isSuperAdmin: false,
        roleTypes: ["CHAPTER_PRESIDENT", "SCHOOL_PRESIDENT"],
      }),
    ).toBe(false)
  })
})
