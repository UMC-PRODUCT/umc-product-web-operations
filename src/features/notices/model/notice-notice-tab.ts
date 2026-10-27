import type { NoticeTab } from "../api/notice-api.types"
import type { NoticeOperatorSession } from "./notice-session"
import type { NoticeAudience } from "./types"

const CENTRAL_ROLES = new Set<string>([
  "CENTRAL_PRESIDENT",
  "CENTRAL_VICE_PRESIDENT",
  "CENTRAL_OPERATING_TEAM_MEMBER",
  "CENTRAL_EDUCATION_TEAM_MEMBER",
  "CHAPTER_PRESIDENT",
])

const SCHOOL_CORE_ROLES = new Set<string>([
  "SCHOOL_PRESIDENT",
  "SCHOOL_VICE_PRESIDENT",
  "SCHOOL_ETC_ADMIN",
])

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

  return "CENTRAL_MEMBER"
}
