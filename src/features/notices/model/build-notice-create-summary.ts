import { NOTICE_CREATE_STAFF_SCOPE_OPTIONS } from "./notice-create-form"
import { getNoticeCreateStaffScopeRecipientHint } from "./notice-create-staff-scope"
import { NOTICE_PART_LABELS } from "./notice-part-options"
import {
  canNoticeCreateUsePartSelection,
  canStaffNoticeUseSchoolOrg,
} from "./notice-staff-target-rules"

import type { NoticeCreateFormState } from "./notice-create-form"

type SummaryLabels = {
  chapterPresidentChallengerActive?: boolean
  gisuLabel: string | null
  chapterName: string | null
  schoolName: string | null
  sessionGisuId?: number | null
}

export function buildNoticeCreateSummary(
  form: NoticeCreateFormState,
  labels: SummaryLabels,
) {
  const audienceTags: string[] = []
  if (form.challengerEnabled) {
    audienceTags.push("챌린저")
  }
  if (form.staffEnabled) {
    audienceTags.push("운영진")
  }

  const staffScopeLabel =
    NOTICE_CREATE_STAFF_SCOPE_OPTIONS.find(
      (option) => option.value === form.staffScope,
    )?.label ?? ""

  const targetParts: string[] = []
  if (form.gisuMode === "all") {
    targetParts.push("전체 기수")
  } else if (labels.gisuLabel) {
    targetParts.push(labels.gisuLabel)
  }

  if (form.challengerEnabled && form.orgMode === "umc") {
    targetParts.push("UMC 전체")
  }

  const schoolNameInStaffRecipientHint =
    form.staffEnabled &&
    !form.challengerEnabled &&
    form.staffScope === "SCHOOL_PART_LEADER"

  const showSchoolInSummary =
    form.orgMode === "school" &&
    labels.schoolName &&
    !schoolNameInStaffRecipientHint &&
    (!form.staffEnabled ||
      form.challengerEnabled ||
      canStaffNoticeUseSchoolOrg(form.staffScope))

  if (showSchoolInSummary) {
    targetParts.push(labels.schoolName!)
  }

  if (form.orgMode === "chapter" && labels.chapterName) {
    targetParts.push(labels.chapterName)
  }

  if (
    form.parts.length > 0 &&
    canNoticeCreateUsePartSelection(form, labels.sessionGisuId)
  ) {
    targetParts.push(
      form.parts.map((part) => NOTICE_PART_LABELS[part]).join(", "),
    )
  }

  const targetLine = targetParts.join(" · ")
  const recipientLine = form.staffEnabled
    ? buildStaffNoticeRecipientLine(form, labels, targetParts)
    : targetLine

  return {
    audienceTags,
    recipientLine,
    staffScopeLabel: form.staffEnabled ? staffScopeLabel : "",
    targetLine,
  }
}

/** 목록 `formatTargetDisplay`와 같은 순서 — 칩 라벨 자리만 상세 받는 사람 문구 */
function buildStaffNoticeRecipientLine(
  form: NoticeCreateFormState,
  labels: SummaryLabels,
  targetParts: string[],
): string {
  const recipientParts: string[] = []

  if (form.gisuMode === "all") {
    recipientParts.push("전체 기수")
  } else if (labels.gisuLabel) {
    recipientParts.push(labels.gisuLabel)
  }

  recipientParts.push(
    getNoticeCreateStaffScopeRecipientHint(form.staffScope, labels.schoolName),
  )

  const filterTailStart =
    recipientParts.length > 0 && targetParts.length > 0 ? 1 : 0
  recipientParts.push(...targetParts.slice(filterTailStart))

  return recipientParts.filter((part) => part.length > 0).join(" · ")
}
