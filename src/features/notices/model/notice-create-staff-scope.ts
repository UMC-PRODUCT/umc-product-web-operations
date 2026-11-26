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

/** 대상 섹션 받는 사람 요약 */
export function getNoticeCreateStaffScopeRecipientHint(
  staffScope: NoticeCreateStaffScope,
  schoolName?: string | null,
): string {
  const trimmedSchoolName = schoolName?.trim()

  switch (staffScope) {
    case "ALL_STAFF":
      return "중앙 운영진 + 모든 지부장 + 모든 학교 운영진"
    case "CENTRAL_MEMBER":
      return "중앙 운영진 (총괄, 부총괄, 운영국원, 교육국원)"
    case "SCHOOL_CORE":
      return trimmedSchoolName
        ? `중앙 운영진 + ${trimmedSchoolName} 회장, 부회장`
        : "중앙 운영진 + 모든 학교 회장, 부회장"
    case "SCHOOL_PART_LEADER":
      return trimmedSchoolName
        ? `중앙 운영진 + ${trimmedSchoolName} 회장, 부회장, 파트장, 기타 운영진`
        : "중앙 운영진 + 학교 회장, 부회장, 파트장, 기타 운영진"
    default:
      return ""
  }
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

/**
 * 운영진 목록 — 범위·대상 필터 비활성.
 * 받는 사람 전체·모든 운영진·중앙 운영진은 학교 구분 없음.
 * 회장단·학교 운영진을 골랐을 때만 범위가 열린다.
 */
export function isNoticeListStaffScopeTargetDisabled(
  staffRecipient: NoticeCreateStaffScope | null,
): boolean {
  if (staffRecipient == null) {
    return true
  }

  return staffRecipient === "ALL_STAFF" || staffRecipient === "CENTRAL_MEMBER"
}
