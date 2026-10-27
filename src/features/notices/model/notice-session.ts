/** 공지 API 요청에 필요한 운영진 세션 필드 (라우트에서 주입) */
export type NoticeOperatorSession = {
  id: number
  gisuId: number | null
  isAdmin: boolean
  isSuperAdmin: boolean
  roleTypes: string[]
  schoolId: number | null
}

const NOTICE_CREATE_ROLES = new Set<string>([
  "CENTRAL_PRESIDENT",
  "CENTRAL_VICE_PRESIDENT",
  "CENTRAL_OPERATING_TEAM_MEMBER",
  "CENTRAL_EDUCATION_TEAM_MEMBER",
  "CHAPTER_PRESIDENT",
  "SCHOOL_PRESIDENT",
  "SCHOOL_VICE_PRESIDENT",
  "SCHOOL_ETC_ADMIN",
  "SCHOOL_PART_LEADER",
])

/** 공지 작성(등록) Command 권한 — 운영 역할·SUPER_ADMIN */
export function canCreateNotice(
  session: Pick<
    NoticeOperatorSession,
    "isAdmin" | "isSuperAdmin" | "roleTypes"
  >,
): boolean {
  if (session.isSuperAdmin) {
    return true
  }

  if (!session.isAdmin) {
    return false
  }

  return session.roleTypes.some((role) => NOTICE_CREATE_ROLES.has(role))
}
