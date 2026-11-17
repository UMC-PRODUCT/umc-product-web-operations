import { queryOptions } from "@tanstack/react-query"

import { fetchGisuOrganizationById } from "../api/gisu-organization"
import { toOrganizationLists } from "./organization-lists"

import type { OrganizationLists } from "./organization-lists"

/** notices·points가 공유하는 기수 조직 쿼리 키 */
export function gisuOrganizationQueryKey(gisuId: number | null | undefined) {
  return ["gisu", "organization", gisuId ?? null] as const
}

/** 필요 시 원본 fetch 후 UI용 목록으로 변환한다. 쿼리 select에는 쓰지 않는다. */
export async function fetchOrganizationLists(
  gisuId: number | null,
): Promise<OrganizationLists> {
  if (gisuId == null) {
    return toOrganizationLists(null)
  }

  const gisu = await fetchGisuOrganizationById(gisuId)
  return toOrganizationLists(gisu)
}

/**
 * 기수 조직 API 원본을 캐시한다.
 * UI용 chapters/schools 목록은 소비 측에서 `toOrganizationLists(data)`로 변환한다.
 * (`select`에서 Map을 만들면 렌더마다 참조가 바뀌어 무한 갱신될 수 있다.)
 */
export function gisuOrganizationQueryOptions(gisuId: number | null) {
  return queryOptions({
    queryKey: gisuOrganizationQueryKey(gisuId),
    queryFn: () => fetchGisuOrganizationById(gisuId!),
    enabled: gisuId != null,
    staleTime: 60_000,
  })
}
