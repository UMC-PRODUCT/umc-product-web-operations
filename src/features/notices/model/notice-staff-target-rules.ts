import { canNoticeCreateUseChallengerPartSelection } from "./notice-challenger-target-rules"
import { isStaffUmcWideRecipientScope } from "./notice-create-staff-scope"

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

/** 챌린저 — 지부장 잠금 시에만 지부 UI */
export function canNoticeCreateUseChapterOrg(form: {
  challengerEnabled: boolean
  chapterPresidentChallengerActive?: boolean
}): boolean {
  if (!form.challengerEnabled) {
    return false
  }

  return form.chapterPresidentChallengerActive === true
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
    | "challengerEnabled"
    | "staffEnabled"
    | "staffScope"
    | "gisuMode"
    | "orgMode"
    | "targetGisuId"
  >,
  sessionGisuId?: number | null,
): boolean {
  const challengerParts = canNoticeCreateUseChallengerPartSelection(
    form,
    sessionGisuId,
  )
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

  if (
    isStaffUmcWideRecipientScope(form.staffScope) &&
    form.orgMode === "school"
  ) {
    return "모든 운영진·중앙 운영진·회장단 공지에는 학교를 지정할 수 없어요"
  }

  if (
    form.staffScope === "SCHOOL_PART_LEADER" &&
    form.orgMode === "school" &&
    form.schoolId == null
  ) {
    return "학교 운영진 공지는 학교를 선택해 주세요"
  }

  if (
    form.staffScope !== "SCHOOL_PART_LEADER" &&
    form.parts.length > 0 &&
    !form.challengerEnabled
  ) {
    return "파트 지정은 학교 운영진(받는 사람)에서만 가능해요"
  }

  return null
}
