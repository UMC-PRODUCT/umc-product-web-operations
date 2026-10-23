/** TODO: API 연동 시 로그인 운영자 프로필로 대체 */
export const MOCK_NOTICE_VIEWER_AUTHOR = "중앙 운영국"

export function isNoticeAuthor(
  noticeAuthor: string,
  viewerAuthor: string = MOCK_NOTICE_VIEWER_AUTHOR,
): boolean {
  return noticeAuthor === viewerAuthor
}
