/** 탈부 목록·등록 라우트 history state */
export type WithdrawalLocationState = {
  registerSuccessToast?: string
}

declare module "@tanstack/react-router" {
  interface HistoryState {
    registerSuccessToast?: string
  }
}

export function parseWithdrawalLocationState(
  state: unknown,
): WithdrawalLocationState {
  if (state == null || typeof state !== "object") {
    return {}
  }

  const record = state as { registerSuccessToast?: unknown }
  const registerSuccessToast =
    typeof record.registerSuccessToast === "string"
      ? record.registerSuccessToast
      : undefined

  return registerSuccessToast == null ? {} : { registerSuccessToast }
}

export function buildWithdrawalLocationState(
  patch: WithdrawalLocationState,
): WithdrawalLocationState {
  return { ...patch }
}
