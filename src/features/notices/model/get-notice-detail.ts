import { MOCK_NOTICE_DETAILS } from "./mock-notice-details"
import { MOCK_NOTICES } from "./mock-notices"

import type { NoticeDetail } from "./notice-detail.types"

export function getNoticeDetail(noticeId: string): NoticeDetail | null {
  const preset = MOCK_NOTICE_DETAILS[noticeId]
  if (preset) {
    return preset
  }

  const summary = MOCK_NOTICES.find((notice) => notice.id === noticeId)
  if (!summary) {
    return null
  }

  return {
    ...summary,
    authorDisplay: summary.author,
    body: "공지 본문이 표시되는 영역입니다.",
    images: [],
    targetDisplay: summary.target,
    updatedAt: summary.createdAt,
  }
}
