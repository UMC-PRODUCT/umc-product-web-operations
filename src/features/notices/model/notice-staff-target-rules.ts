import { NOTICE_LIST_FILTER_ALL } from "./notice-list-filter-all"
import { NOTICE_SCOPE_STAGE_SELECT_OPTIONS } from "./notice-scope-stage"

import type { NoticeTab } from "../api/notice-api.types"
import type {
  NoticeCreateFormState,
  NoticeCreateStaffScope,
} from "./notice-create-form"

export function isStaffCentralNoticeTab(
  tab: NoticeTab | NoticeCreateStaffScope,
): boolean {
  return tab === "CENTRAL_MEMBER" || tab === "SCHOOL_CORE"
}

/** 운영진 공지는 지부(org chapter) 미지원 — 챌린저 공지를 함께 쓸 때만 지부 UI */
export function canNoticeCreateUseChapterOrg(form: {
  challengerEnabled: boolean
}): boolean {
  return form.challengerEnabled
}

/** NOTICE-201: 중앙운영진·회장단 이상은 targetSchoolId null */
export function canStaffNoticeUseSchoolOrg(
  staffScope: NoticeCreateStaffScope,
): boolean {
  return staffScope === "SCHOOL_PART_LEADER"
}

export function canNoticeCreateUsePartSelection(
  form: Pick<
    NoticeCreateFormState,
    "challengerEnabled" | "staffEnabled" | "staffScope" | "gisuMode" | "orgMode"
  >,
): boolean {
  const challengerParts =
    form.challengerEnabled &&
    (form.gisuMode !== "all" || form.orgMode !== "umc")
  const staffParts =
    form.staffEnabled &&
    form.staffScope === "SCHOOL_PART_LEADER" &&
    form.gisuMode === "specific"

  return challengerParts || staffParts
}

export function validateStaffNoticeCreateForm(
  form: NoticeCreateFormState,
): string | null {
  if (!form.staffEnabled) {
    return null
  }

  if (!form.challengerEnabled && form.orgMode === "chapter") {
    return "운영진 공지에는 지부 대상을 지정할 수 없어요. UMC 전체 또는 학교를 선택해 주세요"
  }

  if (!form.challengerEnabled && form.gisuMode === "all") {
    return "운영진 공지는 특정 기수를 선택해 주세요"
  }

  if (isStaffCentralNoticeTab(form.staffScope) && form.orgMode === "school") {
    return "중앙운영사무국·회장단 이상 공지에는 학교를 지정할 수 없어요"
  }

  if (
    form.staffScope === "SCHOOL_PART_LEADER" &&
    form.orgMode === "school" &&
    form.schoolId == null
  ) {
    return "교내 운영진 공지는 학교를 선택해 주세요"
  }

  if (
    isStaffCentralNoticeTab(form.staffScope) &&
    form.parts.length > 0 &&
    !form.challengerEnabled
  ) {
    return "파트 지정은 교내 운영진 전체(받는 사람)에서만 가능해요"
  }

  return null
}

export const STAFF_NOTICE_LIST_SCOPE_STAGE_OPTIONS = [
  { label: "범위 전체", value: NOTICE_LIST_FILTER_ALL },
  ...NOTICE_SCOPE_STAGE_SELECT_OPTIONS.filter(
    (option) => option.value !== "chapter",
  ),
]
