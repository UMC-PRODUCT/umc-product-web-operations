import { NOTICE_CREATE_STAFF_SCOPE_OPTIONS } from "./notice-create-form"

import type { NoticeTargetInfo } from "../api/notice-api.types"
import type { NoticeCreateStaffScope } from "./notice-create-form"

function hasNoticeTargetSchoolScope(targetInfo: NoticeTargetInfo): boolean {
  const schoolId = targetInfo.targetSchoolId
  return (
    schoolId != null &&
    Number.isFinite(Number(schoolId)) &&
    Number(schoolId) > 0
  )
}

function hasNoticeTargetPartsScope(targetInfo: NoticeTargetInfo): boolean {
  const parts = targetInfo.targetParts
  return parts != null && parts.length > 0
}

/** NOTICE-201 — UI「모든 운영진」은 API에 SCHOOL_PART_LEADER(학교·파트 없음)로 저장된다 */
export function isNoticeTargetInfoUmcWideAllStaff(
  targetInfo: NoticeTargetInfo | null | undefined,
): boolean {
  if (!targetInfo) {
    return false
  }

  if (targetInfo.targetNoticeTab === "ALL_STAFF") {
    return true
  }

  return (
    targetInfo.targetNoticeTab === "SCHOOL_PART_LEADER" &&
    !hasNoticeTargetSchoolScope(targetInfo) &&
    !hasNoticeTargetPartsScope(targetInfo)
  )
}

/** NOTICE-001 목록 받는 사람 필터 — API tab과 UI staffRecipient 매핑 */
export function resolveNoticeStaffRecipientScope(
  targetInfo: NoticeTargetInfo | null | undefined,
): NoticeCreateStaffScope | null {
  if (
    !targetInfo?.targetNoticeTab ||
    targetInfo.targetNoticeTab === "CHALLENGER"
  ) {
    return null
  }

  if (isNoticeTargetInfoUmcWideAllStaff(targetInfo)) {
    return "ALL_STAFF"
  }

  const tab = targetInfo.targetNoticeTab
  if (
    tab === "CENTRAL_MEMBER" ||
    tab === "SCHOOL_CORE" ||
    tab === "SCHOOL_PART_LEADER"
  ) {
    return tab
  }

  return null
}

export function resolveStaffRecipientDisplayLabel(
  targetInfo: NoticeTargetInfo,
): string | null {
  const tab = targetInfo.targetNoticeTab
  if (tab == null || tab === "CHALLENGER") {
    return null
  }

  if (tab === "ALL_STAFF" || isNoticeTargetInfoUmcWideAllStaff(targetInfo)) {
    return "모든 운영진"
  }

  return (
    NOTICE_CREATE_STAFF_SCOPE_OPTIONS.find((option) => option.value === tab)
      ?.label ?? null
  )
}

export function resolveStaffScopeFromTargetInfo(
  targetInfo: NoticeTargetInfo | null | undefined,
): NoticeCreateStaffScope {
  const tab = targetInfo?.targetNoticeTab
  if (tab === "ALL_STAFF" || isNoticeTargetInfoUmcWideAllStaff(targetInfo)) {
    return "ALL_STAFF"
  }
  if (tab === "SCHOOL_CORE") {
    return "SCHOOL_CORE"
  }
  if (tab === "SCHOOL_PART_LEADER") {
    return "SCHOOL_PART_LEADER"
  }
  if (tab === "CENTRAL_MEMBER") {
    return "CENTRAL_MEMBER"
  }
  return "ALL_STAFF"
}
