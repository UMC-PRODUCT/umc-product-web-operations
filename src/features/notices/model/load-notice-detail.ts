import { getNoticeDetail } from "../api/notices-query.api"
import { mapNoticeDetailResponse } from "./map-notice-from-api"
import {
  isNoticeForbiddenError,
  isNoticeNotFoundError,
} from "./notice-api-error"

import type { NoticeDetail } from "./notice-detail.types"

/** QA: Figma NT-D01 권한 없음 — `/notices/403` */
export const NOTICE_DETAIL_FORBIDDEN_MOCK_ID = "403"

export type NoticeDetailLoaderData =
  | { kind: "success"; notice: NoticeDetail }
  | { kind: "forbidden" }
  | { kind: "deleted" }

export async function loadNoticeDetail(
  noticeId: string,
): Promise<NoticeDetailLoaderData> {
  if (noticeId === NOTICE_DETAIL_FORBIDDEN_MOCK_ID) {
    return { kind: "forbidden" }
  }

  const parsedId = Number(noticeId)
  if (!Number.isFinite(parsedId)) {
    return { kind: "deleted" }
  }

  try {
    const detail = await getNoticeDetail(parsedId)
    return {
      kind: "success",
      notice: mapNoticeDetailResponse(detail),
    }
  } catch (error) {
    if (isNoticeForbiddenError(error)) {
      return { kind: "forbidden" }
    }
    if (isNoticeNotFoundError(error)) {
      return { kind: "deleted" }
    }
    throw error
  }
}

export function shouldHideNoticeDetailPageHeader(noticeId: string): boolean {
  return noticeId === NOTICE_DETAIL_FORBIDDEN_MOCK_ID
}
