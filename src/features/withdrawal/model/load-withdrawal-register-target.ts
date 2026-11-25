import { fetchChallengerInfoForWithdrawal } from "../api/challenger-info.api"
import {
  searchChallengersForWithdrawal,
  WITHDRAWAL_REGISTER_SEARCH_PAGE_SIZE,
} from "../api/challenger-search.api"
import {
  mapChallengerInfoToRegisterTarget,
  mapChallengerSearchItemToRegisterTarget,
  type WithdrawalRegisterTarget,
} from "./map-challenger-to-register-target"

export async function searchWithdrawalRegisterTargets(input: {
  keyword: string
  gisuId: number | null | undefined
}): Promise<WithdrawalRegisterTarget[]> {
  const trimmed = input.keyword.trim()
  if (!trimmed || input.gisuId == null) {
    return []
  }

  const result = await searchChallengersForWithdrawal({
    keyword: trimmed,
    gisuId: input.gisuId,
    page: 0,
    size: WITHDRAWAL_REGISTER_SEARCH_PAGE_SIZE,
  })

  const content = result.page?.content ?? []
  return content
    .filter((row) => row.challengerStatus === "ACTIVE")
    .map(mapChallengerSearchItemToRegisterTarget)
    .filter((target): target is WithdrawalRegisterTarget => target != null)
}

export async function loadWithdrawalRegisterTargetByRouteId(input: {
  routeMemberId: string
  gisuId: number | null | undefined
}): Promise<WithdrawalRegisterTarget | null> {
  const numericId = Number(input.routeMemberId)
  if (!Number.isInteger(numericId) || numericId <= 0) {
    return null
  }

  if (input.gisuId != null) {
    const match = await findTargetByMemberId(numericId, input.gisuId)
    if (match != null) {
      return match
    }
  }

  try {
    const info = await fetchChallengerInfoForWithdrawal(numericId)
    return mapChallengerInfoToRegisterTarget(info)
  } catch {
    return null
  }
}

async function findTargetByMemberId(
  memberId: number,
  gisuId: number,
): Promise<WithdrawalRegisterTarget | null> {
  const maxPages = 5
  for (let page = 0; page < maxPages; page += 1) {
    const result = await searchChallengersForWithdrawal({
      gisuId,
      page,
      size: WITHDRAWAL_REGISTER_SEARCH_PAGE_SIZE,
    })

    const content = result.page?.content ?? []
    const row = content.find((item) => item.memberId === memberId)
    if (row != null) {
      return mapChallengerSearchItemToRegisterTarget(row)
    }

    const totalPages = result.page?.totalPages ?? 0
    if (page + 1 >= totalPages) {
      break
    }
  }
  return null
}
