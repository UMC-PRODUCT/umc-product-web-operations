import type { AdminSession } from "@/features/auth"
import type { NoticeOperatorSession } from "@/features/notices/model/notice-session"

export function toNoticeOperatorSession(
  session: AdminSession,
  options?: { gisuId?: number | null },
): NoticeOperatorSession {
  const gisuId = options?.gisuId ?? session.gisuId

  return {
    id: session.id,
    gisuId,
    isAdmin: session.isAdmin,
    isSuperAdmin: session.isSuperAdmin,
    roleTypes: [...session.roleTypes],
    schoolId: session.schoolId,
  }
}
