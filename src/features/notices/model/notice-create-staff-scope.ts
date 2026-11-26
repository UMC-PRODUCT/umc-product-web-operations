import type { NoticeCreateStaffScope } from "./notice-create-form"

/** 받는 운영진 칩 하단 안내 */
export const NOTICE_CREATE_STAFF_SCOPE_HINTS: Record<
  NoticeCreateStaffScope,
  string
> = {
  ALL_STAFF: "중앙 운영진, 모든 지부장, 모든 학교 운영진이 받아요",
  CENTRAL_MEMBER: "총괄, 부총괄, 운영국원, 교육국원이 받아요",
  SCHOOL_CORE: "중앙 운영진과 이 학교 회장, 부회장이 받아요",
  SCHOOL_PART_LEADER:
    "중앙 운영진과 이 학교 회장, 부회장, 파트장, 기타 운영진이 받아요",
}

/** UMC 전체 운영진 범위(특정 학교 대상 불가) */
export function isStaffUmcWideRecipientScope(
  scope: NoticeCreateStaffScope,
): boolean {
  return (
    scope === "ALL_STAFF" ||
    scope === "CENTRAL_MEMBER" ||
    scope === "SCHOOL_CORE"
  )
}
