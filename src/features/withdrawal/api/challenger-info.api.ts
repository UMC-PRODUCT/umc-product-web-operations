import { api } from "@/shared/api/client"
import { unwrapApiResult } from "@/shared/api/unwrap-api-result"

import type { MemberPart } from "@/entities/member"

import type { ChallengerSearchStatus } from "./challenger-search.api"

export type ChallengerInfoForWithdrawal = {
  challengerId: number
  memberId?: number | null
  name?: string | null
  nickname?: string | null
  schoolName?: string | null
  chapterName?: string | null
  /** CHALLENGER-101 — 일부 응답은 `generation` 대신 `gisu`(기수)만 내려준다 */
  generation?: number | string | null
  gisu?: number | string | null
  part?: MemberPart | null
  challengerStatus?: ChallengerSearchStatus | null
}

/** CHALLENGER-101 */
export async function fetchChallengerInfoForWithdrawal(
  challengerId: number,
): Promise<ChallengerInfoForWithdrawal> {
  const { data } = await api.get<unknown>(`/v1/challenger/${challengerId}`)
  const result = unwrapApiResult<ChallengerInfoForWithdrawal>(data)
  if (result.challengerId == null) {
    return { ...result, challengerId }
  }
  return result
}
