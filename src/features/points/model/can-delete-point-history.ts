/** 상벌점 이력 삭제 — 중앙 총괄단(회장·부회장) · 슈퍼 어드민 */
const DELETE_POINT_HISTORY_ROLES = new Set<string>([
  "CENTRAL_PRESIDENT",
  "CENTRAL_VICE_PRESIDENT",
])

type PointHistoryDeleteSession = {
  isSuperAdmin: boolean
  roleTypes: readonly string[]
}

export function canDeletePointHistory(
  session: PointHistoryDeleteSession,
): boolean {
  if (session.isSuperAdmin) {
    return true
  }
  return session.roleTypes.some((role) => DELETE_POINT_HISTORY_ROLES.has(role))
}
