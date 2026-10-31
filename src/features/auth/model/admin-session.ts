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

type ApiInt = number | string

export type CurrentGisuMemberInfo = {
  gisuId?: ApiInt | null
  generation?: ApiInt | null
  isAdmin: boolean
  roleTypes: string[]
}

export type ChallengerHistoryItem = {
  challengerId?: ApiInt | null
  gisuId?: ApiInt | null
  generation?: ApiInt | null
}

export type ParticipatedGisu = {
  gisuId: number
  generation: number
}

export type MemberSummaryResponse = {
  id: ApiInt
  name?: string | null
  isSuperAdmin?: boolean
  schoolId?: ApiInt | null
  schoolName?: string | null
  profileImageUrl?: string | null
  profileImageLink?: string | null
  currentGisuMemberInfo?: CurrentGisuMemberInfo | null
  challengerHistory?: ChallengerHistoryItem[] | null
}

function toPositiveInt(value: ApiInt | null | undefined): number | null {
  const parsed = typeof value === "number" ? value : Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null
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
  /** 참여한 기수 (최신 기수 우선). 프로필 기수 목록 필터에 사용 */
  participatedGisus: ParticipatedGisu[]
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

export function toParticipatedGisus(input: {
  challengerHistory?: ChallengerHistoryItem[] | null
  currentGisuMemberInfo?: CurrentGisuMemberInfo | null
}): ParticipatedGisu[] {
  const seen = new Set<number>()
  const items: ParticipatedGisu[] = []

  const push = (
    rawGisuId: ApiInt | null | undefined,
    rawGeneration: ApiInt | null | undefined,
  ) => {
    const gisuId = toPositiveInt(rawGisuId)
    const generation = toPositiveInt(rawGeneration)
    if (gisuId == null || generation == null || seen.has(gisuId)) {
      return
    }
    seen.add(gisuId)
    items.push({ gisuId, generation })
  }

  for (const entry of input.challengerHistory ?? []) {
    push(entry.gisuId, entry.generation)
  }

  const current = input.currentGisuMemberInfo
  if (current != null) {
    push(current.gisuId, current.generation)
  }

  return items
}

export function toAdminSession(member: MemberSummaryResponse): AdminSession {
  const info = member.currentGisuMemberInfo ?? null
  const roleTypes = (info?.roleTypes ?? []).filter(isRoleType)
  const isSuperAdmin = member.isSuperAdmin ?? false
  const isAdmin = info?.isAdmin ?? false

  const profileImageUrl =
    member.profileImageUrl?.trim() || member.profileImageLink?.trim() || null

  return {
    id: toPositiveInt(member.id) ?? 0,
    name: member.name ?? "",
    isSuperAdmin,
    isAdmin,
    roleTypes,
    gisuId: toPositiveInt(info?.gisuId),
    generation: toPositiveInt(info?.generation),
    schoolId: toPositiveInt(member.schoolId),
    schoolName: member.schoolName ?? null,
    profileImageUrl,
    participatedGisus: toParticipatedGisus({
      challengerHistory: member.challengerHistory,
      currentGisuMemberInfo: info,
    }),
    scope: widestScope({ isSuperAdmin, roleTypes }),
  }
}
