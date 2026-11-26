import { describe, expect, it } from "vitest"

import { isNoticeSuperAdminContext } from "./notice-admin-access-context"

describe("isNoticeSuperAdminContext", () => {
  it("is true when isSuperAdmin flag is set", () => {
    expect(
      isNoticeSuperAdminContext({
        isSuperAdmin: true,
        scope: "CENTRAL",
      }),
    ).toBe(true)
  })

  it("is true when scope is SUPER_ADMIN", () => {
    expect(
      isNoticeSuperAdminContext({
        isSuperAdmin: false,
        scope: "SUPER_ADMIN",
      }),
    ).toBe(true)
  })
})
