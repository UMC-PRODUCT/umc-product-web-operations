import { sortRoleTypesByDisplayPriority } from "./profile-roles"

import type { AdminSession, RoleType } from "@/features/auth"

/** roleTypes → 사이드 상단 View 스위처 라벨 */
export const ROLE_VIEW_LABELS: Record<RoleType, string> = {
  CENTRAL_PRESIDENT: "Central President View",
  CENTRAL_VICE_PRESIDENT: "Central Vice President View",
  CENTRAL_OPERATING_TEAM_MEMBER: "Central Operating Team View",
  CENTRAL_EDUCATION_TEAM_MEMBER: "Central Education Team View",
  CHAPTER_PRESIDENT: "Chapter President View",
  SCHOOL_PRESIDENT: "School President View",
  SCHOOL_VICE_PRESIDENT: "School Vice President View",
  SCHOOL_PART_LEADER: "School Part Leader View",
  SCHOOL_ETC_ADMIN: "School ETC View",
}

export const SUPER_ADMIN_VIEW_VALUE = "SUPER_ADMIN" as const

export type RoleViewOption = {
  value: string
  label: string
}

export function toRoleViewOptions(
  session: Pick<AdminSession, "isSuperAdmin" | "roleTypes">,
): RoleViewOption[] {
  const options: RoleViewOption[] = []
  const seen = new Set<string>()

  const push = (value: string, label: string) => {
    if (seen.has(value)) {
      return
    }
    seen.add(value)
    options.push({ value, label })
  }

  if (session.isSuperAdmin) {
    push(SUPER_ADMIN_VIEW_VALUE, "Super Admin View")
  }

  for (const role of sortRoleTypesByDisplayPriority(session.roleTypes)) {
    push(role, ROLE_VIEW_LABELS[role])
  }

  return options
}

export function resolveDefaultRoleView(
  options: readonly RoleViewOption[],
): string | null {
  return options[0]?.value ?? null
}
