import type { NoticeOperatorSession } from "./notice-session"

/** QA: `?viewerAuthor=` 로 mock 작성자 비교 */
export const MOCK_NOTICE_VIEWER_AUTHOR = "중앙 운영국"

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

function isAuthorNameMatch(
  noticeAuthor: string,
  sessionName: string | null | undefined,
): boolean {
  const author = noticeAuthor.trim()
  const viewer = sessionName?.trim()
  return (
    author.length > 0 &&
    viewer != null &&
    viewer.length > 0 &&
    author === viewer
  )
}

export function isNoticeAuthor(
  notice: {
    author: string
    authorMemberId?: number
  },
  session: Pick<NoticeOperatorSession, "id"> | null,
  viewerAuthor: string = MOCK_NOTICE_VIEWER_AUTHOR,
  sessionName?: string | null,
): boolean {
  const authorMemberId = parseNoticeMemberId(notice.authorMemberId)
  const sessionMemberId = session ? parseNoticeMemberId(session.id) : undefined

  if (authorMemberId != null && sessionMemberId != null) {
    return authorMemberId === sessionMemberId
  }

  if (isAuthorNameMatch(notice.author, sessionName)) {
    return true
  }

  return notice.author === viewerAuthor
}
