import { describe, expect, it } from "vitest"

import { resolveAdminAccess } from "./admin-access"

describe("운영진 가드", () => {
  it("allows a super admin", () => {
    expect(
      resolveAdminAccess({
        forbidden: false,
        session: { isAdmin: false, isSuperAdmin: true },
      }),
    ).toBe("ready")
  })

  it("allows a gisu admin", () => {
    expect(
      resolveAdminAccess({
        forbidden: false,
        session: { isAdmin: true, isSuperAdmin: false },
      }),
    ).toBe("ready")
  })

  it("blocks a member who is neither", () => {
    expect(
      resolveAdminAccess({
        forbidden: false,
        session: { isAdmin: false, isSuperAdmin: false },
      }),
    ).toBe("operator")
  })

  it("shows the common forbidden state for a 403", () => {
    expect(
      resolveAdminAccess({
        forbidden: true,
        session: { isAdmin: true, isSuperAdmin: true },
      }),
    ).toBe("forbidden")
  })
})
