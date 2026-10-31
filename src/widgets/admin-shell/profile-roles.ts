import type { RoleTagColor } from "@umc-product/react"

import type { AdminScope, AdminSession, RoleType } from "@/features/auth"

/**
 * 겸임 시 프로필 역할 표시 우선순위 (큰 값일수록 먼저).
 *
 * SUPER ADMIN >
 * HQ_LEAD(총괄/부총괄) >
 * HQ_ADMIN(운영국/교육국) >
 * CHAPTER_ADMIN(지부장) >
 * SCHOOL_ADMIN(회장/부회장) >
 * SCHOOL_STAFF(기타 운영진)
 */
const ROLE_DISPLAY_PRIORITY: Record<RoleType, number> = {
  CENTRAL_PRESIDENT: 520,
  CENTRAL_VICE_PRESIDENT: 510,
  CENTRAL_OPERATING_TEAM_MEMBER: 420,
  CENTRAL_EDUCATION_TEAM_MEMBER: 410,
  CHAPTER_PRESIDENT: 300,
  SCHOOL_PRESIDENT: 220,
  SCHOOL_VICE_PRESIDENT: 210,
  SCHOOL_PART_LEADER: 120,
  SCHOOL_ETC_ADMIN: 110,
}

const ROLE_TAG_LABELS: Record<RoleType, string> = {
  CENTRAL_PRESIDENT: "중앙 운영진",
  CENTRAL_VICE_PRESIDENT: "중앙 운영진",
  CENTRAL_OPERATING_TEAM_MEMBER: "중앙 운영진",
  CENTRAL_EDUCATION_TEAM_MEMBER: "중앙 운영진",
  CHAPTER_PRESIDENT: "지부 회장",
  SCHOOL_PRESIDENT: "교내 회장",
  SCHOOL_VICE_PRESIDENT: "교내 부회장",
  SCHOOL_PART_LEADER: "교내 운영진",
  SCHOOL_ETC_ADMIN: "교내 운영진",
}

export type ProfileRoleTag = {
  label: string
  color: RoleTagColor
}

function colorForRole(role: RoleType): RoleTagColor {
  switch (role) {
    case "CENTRAL_PRESIDENT":
    case "CENTRAL_VICE_PRESIDENT":
    case "CENTRAL_OPERATING_TEAM_MEMBER":
    case "CENTRAL_EDUCATION_TEAM_MEMBER":
      return "central"
    case "CHAPTER_PRESIDENT":
      return "chapter"
    case "SCHOOL_PRESIDENT":
    case "SCHOOL_VICE_PRESIDENT":
    case "SCHOOL_PART_LEADER":
    case "SCHOOL_ETC_ADMIN":
      return "campus"
  }
}

function colorForScope(scope: AdminScope | null): RoleTagColor {
  switch (scope) {
    case "SUPER_ADMIN":
      return "challenger-super-admin"
    case "CENTRAL":
      return "central"
    case "CHAPTER":
      return "chapter"
    case "SCHOOL":
    case "SCHOOL_PART":
      return "campus"
    default:
      return "challenger-super-admin"
  }
}

function labelForScope(scope: AdminScope | null): string {
  switch (scope) {
    case "SUPER_ADMIN":
      return "슈퍼 어드민"
    case "CENTRAL":
      return "중앙 운영진"
    case "CHAPTER":
      return "지부 회장"
    case "SCHOOL":
    case "SCHOOL_PART":
      return "교내 운영진"
    default:
      return "챌린저"
  }
}

export function sortRoleTypesByDisplayPriority(
  roleTypes: readonly RoleType[],
): RoleType[] {
  return [...roleTypes].sort(
    (left, right) => ROLE_DISPLAY_PRIORITY[right] - ROLE_DISPLAY_PRIORITY[left],
  )
}

/** 겸임 시 우선순위 순 RoleTag 목록. 동일 라벨은 한 번만. */
export function resolveProfileRoles(
  session: Pick<AdminSession, "isSuperAdmin" | "roleTypes" | "scope">,
): ProfileRoleTag[] {
  const roles: ProfileRoleTag[] = []
  const seenLabels = new Set<string>()

  const push = (label: string, color: RoleTagColor) => {
    if (seenLabels.has(label)) {
      return
    }
    seenLabels.add(label)
    roles.push({ label, color })
  }

  if (session.isSuperAdmin) {
    push("슈퍼 어드민", "challenger-super-admin")
  }

  for (const role of sortRoleTypesByDisplayPriority(session.roleTypes)) {
    push(ROLE_TAG_LABELS[role], colorForRole(role))
  }

  if (roles.length === 0) {
    push(labelForScope(session.scope), colorForScope(session.scope))
  }

  return roles
}
