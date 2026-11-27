import type { NoticeTab } from "../api/notice-api.types"
import type { NoticeOperatorSession } from "./notice-session"
import type { NoticeAudience } from "./types"

/** NOTICE-001 운영진 목록 noticeTab=CENTRAL_MEMBER (중앙 운영진 조회) */
const CENTRAL_MEMBER_LIST_ROLES = new Set<string>([
  "CENTRAL_PRESIDENT",
  "CENTRAL_VICE_PRESIDENT",
  "CENTRAL_OPERATING_TEAM_MEMBER",
  "CENTRAL_EDUCATION_TEAM_MEMBER",
])

const CHAPTER_PRESIDENT_ROLE = "CHAPTER_PRESIDENT"

/** NOTICE-001 운영진 탭 — noticeTab=SCHOOL_CORE (회장단) */
const SCHOOL_EXECUTIVE_ROLES = new Set<string>([
  "SCHOOL_PRESIDENT",
  "SCHOOL_VICE_PRESIDENT",
])

/** NOTICE-001 — noticeTab=SCHOOL_PART_LEADER (파트장·교내 기타 운영진) */
const SCHOOL_STAFF_LIST_ROLES = new Set<string>([
  "SCHOOL_PART_LEADER",
  "SCHOOL_ETC_ADMIN",
])

/** 운영진 공지 목록을 요청할 수 있는 역할인지 */
export function canAccessStaffNoticeTab(
  session: Pick<NoticeOperatorSession, "isSuperAdmin" | "roleTypes">,
): boolean {
  if (session.isSuperAdmin) {
    return true
  }

  const roles = session.roleTypes
  if (roles.some((role) => CENTRAL_MEMBER_LIST_ROLES.has(role))) {
    return true
  }
  if (roles.includes(CHAPTER_PRESIDENT_ROLE)) {
    return true
  }
  if (roles.some((role) => SCHOOL_STAFF_LIST_ROLES.has(role))) {
    return true
  }
  if (roles.some((role) => SCHOOL_EXECUTIVE_ROLES.has(role))) {
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
  if (roles.some((role) => CENTRAL_MEMBER_LIST_ROLES.has(role))) {
    return "CENTRAL_MEMBER"
  }
  // NOTICE-001 — 지부장은 SCHOOL_CORE·SCHOOL_PART_LEADER 대상만, CENTRAL_MEMBER 탭 요청 시 403
  if (roles.includes(CHAPTER_PRESIDENT_ROLE)) {
    return "SCHOOL_CORE"
  }
  if (roles.some((role) => SCHOOL_EXECUTIVE_ROLES.has(role))) {
    return "SCHOOL_CORE"
  }
  if (roles.some((role) => SCHOOL_STAFF_LIST_ROLES.has(role))) {
    return "SCHOOL_PART_LEADER"
  }

  return "CENTRAL_MEMBER"
}
