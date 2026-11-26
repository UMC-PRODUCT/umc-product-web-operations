import {
  parseWithdrawalListSearch,
  type WithdrawalListSearch,
} from "./withdrawal-list-search"

/** 탈부 목록·등록 history state — URL search에 두지 않음 */
export type WithdrawalLocationState = {
  registerSuccessToast?: string
  withdrawalListSearch?: WithdrawalListSearch
}

declare module "@tanstack/react-router" {
  interface HistoryState {
    registerSuccessToast?: string
    withdrawalListSearch?: WithdrawalListSearch
  }
}

let withdrawalListViewSnapshot: WithdrawalListSearch = {}

export function rememberWithdrawalListView(search: WithdrawalListSearch) {
  withdrawalListViewSnapshot = { ...search }
}

export function recallWithdrawalListView(): WithdrawalListSearch {
  return withdrawalListViewSnapshot
}

function hasWithdrawalListValues(search: WithdrawalListSearch): boolean {
  return (
    search.chapter != null ||
    search.school != null ||
    search.part != null ||
    search.reason != null ||
    search.status != null ||
    search.q != null ||
    search.page != null
  )
}

export function parseWithdrawalLocationState(
  state: unknown,
): WithdrawalLocationState {
  if (state == null || typeof state !== "object") {
    return {}
  }

  const record = state as {
    registerSuccessToast?: unknown
    withdrawalListSearch?: unknown
    /** @deprecated 등록 왕복 중 쓰이던 키 — 하위 호환 */
    listSearch?: unknown
  }
  const registerSuccessToast =
    typeof record.registerSuccessToast === "string"
      ? record.registerSuccessToast
      : undefined

  const rawList = record.withdrawalListSearch ?? record.listSearch ?? undefined
  const withdrawalListSearch =
    rawList != null && typeof rawList === "object"
      ? parseWithdrawalListSearch(rawList as Record<string, unknown>)
      : undefined

  return {
    ...(registerSuccessToast == null ? {} : { registerSuccessToast }),
    ...(withdrawalListSearch == null ? {} : { withdrawalListSearch }),
  }
}

export function resolveWithdrawalListViewState(
  locationState: unknown,
): WithdrawalListSearch {
  const parsed =
    parseWithdrawalLocationState(locationState).withdrawalListSearch
  if (parsed != null && hasWithdrawalListValues(parsed)) {
    return parsed
  }
  if (
    locationState != null &&
    typeof locationState === "object" &&
    ("withdrawalListSearch" in locationState || "listSearch" in locationState)
  ) {
    return parsed ?? {}
  }
  return recallWithdrawalListView()
}

export function buildWithdrawalLocationState(
  patch: WithdrawalLocationState,
): WithdrawalLocationState {
  return { ...patch }
}

export function mergeWithdrawalListSearch(
  current: WithdrawalListSearch,
  patch: WithdrawalListSearch,
): WithdrawalListSearch {
  return parseWithdrawalListSearch({ ...current, ...patch })
}
