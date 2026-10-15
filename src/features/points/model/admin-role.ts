export type AdminRole = "SUPER_ADMIN" | "HQ_LEAD" | "HQ_ADMIN" | "SCHOOL_ADMIN"

/** 상벌점 이력 삭제는 SUPER ADMIN / HQ_LEAD만 가능 */
export function canDeletePointHistory(role: AdminRole): boolean {
  return role === "SUPER_ADMIN" || role === "HQ_LEAD"
}
