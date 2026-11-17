import {
  fetchOrganizationLists,
  gisuOrganizationQueryKey,
  gisuOrganizationQueryOptions,
} from "@/entities/organization"

import type { OrganizationLists } from "@/entities/organization"

/** @deprecated Use OrganizationLists from @/entities/organization */
export type NoticeListOrganizationOptions = OrganizationLists

export function noticeListOrganizationQueryKey(gisuId: number | null) {
  return gisuOrganizationQueryKey(gisuId)
}

export async function fetchNoticeListOrganizationOptions(
  gisuId: number | null,
): Promise<NoticeListOrganizationOptions> {
  return fetchOrganizationLists(gisuId)
}

/** 기수 조직 원본 쿼리. 목록 형태는 `toOrganizationLists`로 변환한다. */
export function noticeListOrganizationQueryOptions(gisuId: number | null) {
  return gisuOrganizationQueryOptions(gisuId)
}
