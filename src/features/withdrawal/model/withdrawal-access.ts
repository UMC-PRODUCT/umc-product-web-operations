const SCHOOL_EXECUTIVE_ROLES = new Set([
  "SCHOOL_PRESIDENT",
  "SCHOOL_VICE_PRESIDENT",
])

export type WithdrawalAccessInput = {
  scope: "SUPER_ADMIN" | "CENTRAL" | "CHAPTER" | "SCHOOL" | "SCHOOL_PART" | null
  roleTypes: readonly string[]
}

/**
 * 탈부 관리 페이지 접근: 중앙(슈퍼·중앙·지부) + 학교 회장단만.
 * Figma 2550:27917 — 그 외는 접근 권한 없음 화면.
 */
export function canAccessWithdrawalManagement(
  input: WithdrawalAccessInput,
): boolean {
  if (
    input.scope === "SUPER_ADMIN" ||
    input.scope === "CENTRAL" ||
    input.scope === "CHAPTER"
  ) {
    return true
  }

  return (
    input.scope === "SCHOOL" &&
    input.roleTypes.some((role) => SCHOOL_EXECUTIVE_ROLES.has(role))
  )
}
