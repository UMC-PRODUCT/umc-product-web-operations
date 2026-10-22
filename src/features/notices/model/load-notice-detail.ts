import { getNoticeDetail } from "./get-notice-detail"

import type { NoticeDetail } from "./notice-detail.types"

/** QA: Figma NT-D01 권한 없음 — `/notices/403` */
export const NOTICE_DETAIL_FORBIDDEN_MOCK_ID = "403"

export type NoticeDetailLoaderData =
  | { kind: "success"; notice: NoticeDetail }
  | { kind: "forbidden" }
  | { kind: "deleted" }

export function loadNoticeDetail(noticeId: string): NoticeDetailLoaderData {
  if (noticeId === NOTICE_DETAIL_FORBIDDEN_MOCK_ID) {
    return { kind: "forbidden" }
  }

  const notice = getNoticeDetail(noticeId)
  if (!notice) {
    return { kind: "deleted" }
  }

  return { kind: "success", notice }
}

export function shouldHideNoticeDetailPageHeader(noticeId: string): boolean {
  return loadNoticeDetail(noticeId).kind !== "success"
}
