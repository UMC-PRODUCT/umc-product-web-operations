import { api } from "@/shared/api/client"
import { unwrapApiResult } from "@/shared/api/unwrap-api-result"

import type { MemberPart } from "@/entities/member"

export type ChallengerSearchStatus =
  "ACTIVE" | "GRADUATED" | "EXPELLED" | "WITHDRAWN"

export type ChallengerSearchItem = {
  memberId?: number | null
  name?: string | null
  nickname?: string | null
  schoolName?: string | null
  challengerId?: number | null
  gisuId?: number | null
  generation?: number | null
  part?: MemberPart | null
  challengerStatus?: ChallengerSearchStatus | null
  isAdminInActiveGisu?: boolean | null
  roleTypes?: string[] | null
}

export type ChallengerSearchPage = {
  content?: ChallengerSearchItem[] | null
  totalPages?: number | null
  hasNext?: boolean | null
}

export type ChallengerSearchResult = {
  totalCount?: number | null
  page?: ChallengerSearchPage | null
}

export type SearchChallengersParams = {
  keyword?: string
  gisuId?: number
  page: number
  size: number
}

export const WITHDRAWAL_REGISTER_SEARCH_PAGE_SIZE = 20

/** GET /v2/challenger/search (CHALLENGER-201) */
export async function searchChallengersForWithdrawal(
  params: SearchChallengersParams,
): Promise<ChallengerSearchResult> {
  const { data } = await api.get<unknown>("/v2/challenger/search", {
    params: {
      page: params.page,
      size: params.size,
      ...(params.keyword ? { keyword: params.keyword } : {}),
      ...(params.gisuId != null ? { gisuId: params.gisuId } : {}),
    },
  })
  return unwrapApiResult<ChallengerSearchResult>(data)
}
