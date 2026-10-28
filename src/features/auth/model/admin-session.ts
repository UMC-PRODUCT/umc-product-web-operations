export const ROLE_TYPES = [
  "CENTRAL_PRESIDENT",
  "CENTRAL_VICE_PRESIDENT",
  "CENTRAL_OPERATING_TEAM_MEMBER",
  "CENTRAL_EDUCATION_TEAM_MEMBER",
  "CHAPTER_PRESIDENT",
  "SCHOOL_PRESIDENT",
  "SCHOOL_VICE_PRESIDENT",
  "SCHOOL_PART_LEADER",
  "SCHOOL_ETC_ADMIN",
] as const

export type RoleType = (typeof ROLE_TYPES)[number]

export type AdminScope =
  "SUPER_ADMIN" | "CENTRAL" | "CHAPTER" | "SCHOOL" | "SCHOOL_PART"

export type CurrentGisuMemberInfo = {
  gisuId: number
  generation: number
  isAdmin: boolean
  roleTypes: string[]
}

export type MemberSummaryResponse = {
  id: number
  name?: string | null
  isSuperAdmin?: boolean
  schoolId?: number | null
  schoolName?: string | null
  profileImageUrl?: string | null
  currentGisuMemberInfo?: CurrentGisuMemberInfo | null
}

export type AdminSession = {
  id: number
  name: string
  isSuperAdmin: boolean
  isAdmin: boolean
  roleTypes: RoleType[]
  gisuId: number | null
  generation: number | null
  schoolId: number | null
  schoolName: string | null
  profileImageUrl: string | null
  scope: AdminScope | null
}

const CENTRAL_ROLES = new Set<RoleType>([
  "CENTRAL_PRESIDENT",
  "CENTRAL_VICE_PRESIDENT",
  "CENTRAL_OPERATING_TEAM_MEMBER",
  "CENTRAL_EDUCATION_TEAM_MEMBER",
])

const SCHOOL_ROLES = new Set<RoleType>([
  "SCHOOL_PRESIDENT",
  "SCHOOL_VICE_PRESIDENT",
  "SCHOOL_ETC_ADMIN",
])

export function isRoleType(value: string): value is RoleType {
  return (ROLE_TYPES as readonly string[]).includes(value)
}

export function widestScope(input: {
  isSuperAdmin: boolean
  roleTypes: readonly RoleType[]
}): AdminScope | null {
  if (input.isSuperAdmin) {
    return "SUPER_ADMIN"
  }
  if (input.roleTypes.some((role) => CENTRAL_ROLES.has(role))) {
    return "CENTRAL"
  }
  if (input.roleTypes.includes("CHAPTER_PRESIDENT")) {
    return "CHAPTER"
  }
  if (input.roleTypes.some((role) => SCHOOL_ROLES.has(role))) {
    return "SCHOOL"
  }
  if (input.roleTypes.includes("SCHOOL_PART_LEADER")) {
    return "SCHOOL_PART"
  }
  return null
}

export function isOperator(
  session: Pick<AdminSession, "isAdmin" | "isSuperAdmin">,
) {
  return session.isSuperAdmin || session.isAdmin
}

const SCHOOL_EXECUTIVE_ROLES = new Set<RoleType>([
  "SCHOOL_PRESIDENT",
  "SCHOOL_VICE_PRESIDENT",
])

export type SchoolExecutiveLock = {
  schoolId: string
  schoolName: string
}

/** 학교 회장단만 해당하고 학교 id가 있을 때 지부·학교 필터를 고정한다. */
export function schoolExecutiveLock(
  session: Pick<
    AdminSession,
    "scope" | "roleTypes" | "schoolId" | "schoolName"
  >,
): SchoolExecutiveLock | null {
  if (session.scope !== "SCHOOL" || session.schoolId == null) {
    return null
  }
  if (!session.roleTypes.some((role) => SCHOOL_EXECUTIVE_ROLES.has(role))) {
    return null
  }
  return {
    schoolId: String(session.schoolId),
    schoolName: session.schoolName ?? "",
  }
}

export function toAdminSession(member: MemberSummaryResponse): AdminSession {
  const info = member.currentGisuMemberInfo ?? null
  const roleTypes = (info?.roleTypes ?? []).filter(isRoleType)
  const isSuperAdmin = member.isSuperAdmin ?? false
  const isAdmin = info?.isAdmin ?? false

  const profileImageUrl = member.profileImageUrl?.trim() || null

  return {
    id: member.id,
    name: member.name ?? "",
    isSuperAdmin,
    isAdmin,
    roleTypes,
    gisuId: info?.gisuId ?? null,
    generation: info?.generation ?? null,
    schoolId: member.schoolId ?? null,
    schoolName: member.schoolName ?? null,
    profileImageUrl,
    scope: widestScope({ isSuperAdmin, roleTypes }),
  }
}
