import type { NoticeOperatorSession } from "./notice-session"

/** QA: `?viewerAuthor=` 로 mock 작성자 비교 */
export const MOCK_NOTICE_VIEWER_AUTHOR = "중앙 운영국"

export function isNoticeAuthor(
  notice: {
    author: string
    authorMemberId?: number
  },
  session: Pick<NoticeOperatorSession, "id"> | null,
  viewerAuthor: string = MOCK_NOTICE_VIEWER_AUTHOR,
): boolean {
  if (notice.authorMemberId != null && session) {
    return notice.authorMemberId === session.id
  }

  return notice.author === viewerAuthor
}
