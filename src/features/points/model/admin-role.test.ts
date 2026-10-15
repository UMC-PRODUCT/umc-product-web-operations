import { describe, expect, it } from "vitest"

import { canDeletePointHistory } from "./admin-role"

describe("canDeletePointHistory", () => {
  it("allows SUPER_ADMIN and HQ_LEAD", () => {
    expect(canDeletePointHistory("SUPER_ADMIN")).toBe(true)
    expect(canDeletePointHistory("HQ_LEAD")).toBe(true)
  })

  it("denies HQ_ADMIN and SCHOOL_ADMIN", () => {
    expect(canDeletePointHistory("HQ_ADMIN")).toBe(false)
    expect(canDeletePointHistory("SCHOOL_ADMIN")).toBe(false)
  })
})
