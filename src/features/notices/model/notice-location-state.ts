import { parseNoticeListAudienceOptional } from "./notice-list-route-search"

import type { NoticeAudience } from "./types"

/** 공지 목록·상세·수정 history state — 탭·페이지 (URL search에 두지 않음) */
export type NoticeLocationState = {
  listAudience?: NoticeAudience
  listPage?: number
}

declare module "@tanstack/react-router" {
  interface HistoryState {
    listAudience?: NoticeAudience
    listPage?: number
  }
}

function parseListPage(value: unknown): number | undefined {
  const parsed = typeof value === "number" ? value : Number(value)
  if (!Number.isFinite(parsed) || parsed < 1) {
    return undefined
  }

  return Math.floor(parsed)
}

export function parseNoticeLocationState(state: unknown): NoticeLocationState {
  if (state == null || typeof state !== "object") {
    return {}
  }

  const record = state as {
    listAudience?: unknown
    listPage?: unknown
  }
  const listAudience = parseNoticeListAudienceOptional(record.listAudience)
  const listPage = parseListPage(record.listPage)

  return {
    ...(listAudience == null ? {} : { listAudience }),
    ...(listPage == null ? {} : { listPage }),
  }
}

export function buildNoticeLocationState(input: {
  listAudience?: NoticeAudience | null
  listPage?: number | null
}): NoticeLocationState {
  const next: NoticeLocationState = {}

  if (input.listAudience != null) {
    next.listAudience = input.listAudience
  }

  const listPage = parseListPage(input.listPage)
  if (listPage != null) {
    next.listPage = listPage
  }

  return next
}

/** @deprecated 목록 탭은 history state로 복원. 하위 호환용으로 유지 */
export function buildNoticeListReturnSearch(input: {
  audience?: NoticeAudience | null
}): { audience?: NoticeAudience } {
  if (input.audience == null) {
    return {}
  }

  return { audience: input.audience }
}
