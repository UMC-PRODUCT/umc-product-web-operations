import { isOperator } from "./admin-session"

import type { AdminSession } from "./admin-session"

export type AdminAccess = "forbidden" | "operator" | "ready" | "signing-in"

export class AdminGateError extends Error {
  readonly gate: "forbidden" | "signing-in"

  constructor(gate: "forbidden" | "signing-in") {
    super(gate)
    this.name = "AdminGateError"
    this.gate = gate
  }
}

export function resolveAdminAccess(input: {
  forbidden: boolean
  session: Pick<AdminSession, "isAdmin" | "isSuperAdmin"> | null
}): AdminAccess {
  if (input.forbidden) {
    return "forbidden"
  }
  if (!input.session) {
    return "signing-in"
  }
  if (!isOperator(input.session)) {
    return "operator"
  }
  return "ready"
}
