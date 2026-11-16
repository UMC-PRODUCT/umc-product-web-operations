import { queryOptions } from "@tanstack/react-query"

import { fetchGisuOrganizationById } from "../api/gisu-organization"
import { toOrganizationLists } from "./organization-lists"

import type { OrganizationLists } from "./organization-lists"

/** notices·points가 공유하는 기수 조직 쿼리 키 */
export function gisuOrganizationQueryKey(gisuId: number | null | undefined) {
  return ["gisu", "organization", gisuId ?? null] as const
}

export async function fetchOrganizationLists(
  gisuId: number | null,
): Promise<OrganizationLists> {
  if (gisuId == null) {
    return { chapters: [], schools: [], schoolsByChapterId: new Map() }
  }

  const gisu = await fetchGisuOrganizationById(gisuId)
  return toOrganizationLists(gisu)
}

/**
 * 조직 원본을 캐시하고 `select`로 목록 형태로 쓴다.
 * points·notices가 같은 키를 공유한다.
 */
export function gisuOrganizationQueryOptions(gisuId: number | null) {
  return queryOptions({
    queryKey: gisuOrganizationQueryKey(gisuId),
    queryFn: () => fetchGisuOrganizationById(gisuId!),
    enabled: gisuId != null,
    staleTime: 60_000,
  })
}

export function gisuOrganizationListsQueryOptions(gisuId: number | null) {
  return queryOptions({
    ...gisuOrganizationQueryOptions(gisuId),
    select: (gisu) => toOrganizationLists(gisu),
  })
}
