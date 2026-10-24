import { describe, expect, it } from "vitest"

import { hasResourcePermission } from "./resource-permission"

import type { ResourcePermission } from "./resource-permission"

const permission: ResourcePermission = {
  resourceType: "CHALLENGER_POINT",
  permissions: [
    { permissionType: "DELETE", hasPermission: true },
    { permissionType: "READ", hasPermission: false },
  ],
}

describe("hasResourcePermission", () => {
  it("returns true only when that permission is granted", () => {
    expect(hasResourcePermission(permission, "DELETE")).toBe(true)
    expect(hasResourcePermission(permission, "READ")).toBe(false)
    expect(hasResourcePermission(permission, "WRITE")).toBe(false)
  })
})
