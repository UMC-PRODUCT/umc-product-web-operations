import {
  fetchOrganizationLists,
  gisuOrganizationListsQueryOptions,
  gisuOrganizationQueryKey,
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

export function noticeListOrganizationQueryOptions(gisuId: number | null) {
  return gisuOrganizationListsQueryOptions(gisuId)
}
