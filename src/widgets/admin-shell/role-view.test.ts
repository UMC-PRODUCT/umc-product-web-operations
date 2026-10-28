import { describe, expect, it } from "vitest"

import {
  resolveDefaultRoleView,
  ROLE_VIEW_LABELS,
  SUPER_ADMIN_VIEW_VALUE,
  toRoleViewOptions,
} from "./role-view"

import type { RoleType } from "@/features/auth"

describe("toRoleViewOptions", () => {
  it("maps every roleType to a view label", () => {
    const roleTypes = Object.keys(ROLE_VIEW_LABELS) as RoleType[]
    const options = toRoleViewOptions({
      isSuperAdmin: false,
      roleTypes,
    })

    expect(options).toEqual(
      roleTypes.map((role) => ({
        value: role,
        label: ROLE_VIEW_LABELS[role],
      })),
    )
    expect(ROLE_VIEW_LABELS.SCHOOL_ETC_ADMIN).toBe("School ETC View")
  })

  it("prepends Super Admin View when isSuperAdmin", () => {
    const options = toRoleViewOptions({
      isSuperAdmin: true,
      roleTypes: ["SCHOOL_ETC_ADMIN"],
    })

    expect(options[0]).toEqual({
      value: SUPER_ADMIN_VIEW_VALUE,
      label: "Super Admin View",
    })
    expect(options[1]).toEqual({
      value: "SCHOOL_ETC_ADMIN",
      label: "School ETC View",
    })
  })

  it("defaults to the first option", () => {
    expect(
      resolveDefaultRoleView([
        { value: "SCHOOL_ETC_ADMIN", label: "School ETC View" },
      ]),
    ).toBe("SCHOOL_ETC_ADMIN")
    expect(resolveDefaultRoleView([])).toBeNull()
  })
})
