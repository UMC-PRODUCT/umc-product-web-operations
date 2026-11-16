import type { NoticeOperatorSession } from "./notice-session"

export function parseNoticeMemberId(value: unknown): number | undefined {
  if (value == null) {
    return undefined
  }

  const parsed = typeof value === "number" ? value : Number(value)
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return undefined
  }

  return parsed
}

export function isNoticeAuthor(
  notice: {
    authorMemberId?: number
  },
  session: Pick<NoticeOperatorSession, "id"> | null,
): boolean {
  const authorMemberId = parseNoticeMemberId(notice.authorMemberId)
  const sessionMemberId = session ? parseNoticeMemberId(session.id) : undefined

  if (authorMemberId == null || sessionMemberId == null) {
    return false
  }

  return authorMemberId === sessionMemberId
}

/** 상세 수정·삭제·투표 종료 — 작성자 또는 SUPER_ADMIN */
export function canManageNoticeDetail(
  notice: {
    authorMemberId?: number
  },
  session: Pick<NoticeOperatorSession, "id" | "isSuperAdmin"> | null,
): boolean {
  if (session?.isSuperAdmin) {
    return true
  }

  return isNoticeAuthor(notice, session)
}
