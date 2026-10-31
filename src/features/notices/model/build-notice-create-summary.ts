import { NOTICE_CREATE_STAFF_SCOPE_OPTIONS } from "./notice-create-form"
import { NOTICE_PART_LABELS } from "./notice-part-options"
import {
  canNoticeCreateUseChapterOrg,
  canNoticeCreateUsePartSelection,
  canStaffNoticeUseSchoolOrg,
} from "./notice-staff-target-rules"

import type { NoticeCreateFormState } from "./notice-create-form"

type SummaryLabels = {
  gisuLabel: string | null
  chapterName: string | null
  schoolName: string | null
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

  const showSchoolInSummary =
    form.orgMode === "school" &&
    labels.schoolName &&
    (!form.staffEnabled ||
      form.challengerEnabled ||
      canStaffNoticeUseSchoolOrg(form.staffScope))

  if (showSchoolInSummary) {
    targetParts.push(labels.schoolName!)
  }

  if (
    form.orgMode === "chapter" &&
    labels.chapterName &&
    canNoticeCreateUseChapterOrg(form)
  ) {
    targetParts.push(labels.chapterName)
  }

  if (form.parts.length > 0 && canNoticeCreateUsePartSelection(form)) {
    targetParts.push(
      form.parts.map((part) => NOTICE_PART_LABELS[part]).join(", "),
    )
  }

  return {
    audienceTags,
    staffScopeLabel: form.staffEnabled ? staffScopeLabel : "",
    targetLine: targetParts.join(" · "),
  }
}
