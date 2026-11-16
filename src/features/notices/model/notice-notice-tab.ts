import type { NoticeTab } from "../api/notice-api.types"
import type { NoticeOperatorSession } from "./notice-session"
import type { NoticeAudience } from "./types"

const CENTRAL_ROLES = new Set<string>([
  "CENTRAL_PRESIDENT",
  "CENTRAL_VICE_PRESIDENT",
  "CENTRAL_OPERATING_TEAM_MEMBER",
  "CENTRAL_EDUCATION_TEAM_MEMBER",
])

const SCHOOL_CORE_ROLES = new Set<string>([
  "SCHOOL_PRESIDENT",
  "SCHOOL_VICE_PRESIDENT",
  "SCHOOL_ETC_ADMIN",
])

/** 운영진 공지 목록을 요청할 수 있는 역할인지 (지부장 단독은 명세상 열람 불가) */
export function canAccessStaffNoticeTab(
  session: Pick<NoticeOperatorSession, "isSuperAdmin" | "roleTypes">,
): boolean {
  if (session.isSuperAdmin) {
    return true
  }

  const roles = session.roleTypes
  if (roles.some((role) => CENTRAL_ROLES.has(role))) {
    return true
  }
  if (roles.includes("SCHOOL_PART_LEADER")) {
    return true
  }
  if (roles.some((role) => SCHOOL_CORE_ROLES.has(role))) {
    return true
  }

  return false
}

export function resolveNoticeTab(
  audience: NoticeAudience,
  session: Pick<NoticeOperatorSession, "isSuperAdmin" | "roleTypes">,
): NoticeTab {
  if (audience === "challenger") {
    return "CHALLENGER"
  }

  if (session.isSuperAdmin) {
    return "CENTRAL_MEMBER"
  }

  const roles = session.roleTypes
  if (roles.some((role) => CENTRAL_ROLES.has(role))) {
    return "CENTRAL_MEMBER"
  }
  if (roles.includes("SCHOOL_PART_LEADER")) {
    return "SCHOOL_PART_LEADER"
  }
  if (roles.some((role) => SCHOOL_CORE_ROLES.has(role))) {
    return "SCHOOL_CORE"
  }

  // 지부장 등 운영진 탭 열람 권한이 없으면 호출하지 않아야 한다.
  // 방어적으로 CHALLENGER를 돌려 잘못된 CENTRAL_MEMBER 요청을 막는다.
  return "CHALLENGER"
}
