import { NOTICE_LIST_FILTER_ALL } from "./notice-list-filter-all"
import { NOTICE_LIST_STAFF_SCOPE_ALL_SCHOOLS } from "./notice-scope-stage"

import type { SelectOption } from "@umc-product/react"

import type { NoticeCreateStaffScope } from "./notice-create-form"

/** 운영진 목록 — 범위 필터 옵션 설명 (Figma 2808-42174) */
const NOTICE_LIST_STAFF_SCOPE_STAGE_CAPTIONS = {
  all: "모든 학교 대상 + 학교 지정",
  allSchools: "학교를 지정하지 않은 공지",
  school: "대상에서 학교 선택",
  part: "대상에서 파트 선택",
} as const

export function buildNoticeListStaffScopeStageSelectOptions(
  staffRecipient: NoticeCreateStaffScope | null,
): SelectOption<string>[] {
  const schoolScopeRecipients =
    staffRecipient === "SCHOOL_CORE" || staffRecipient === "SCHOOL_PART_LEADER"

  if (!schoolScopeRecipients) {
    return []
  }

  const options: SelectOption<string>[] = [
    {
      value: NOTICE_LIST_FILTER_ALL,
      label: "범위 전체",
      caption: NOTICE_LIST_STAFF_SCOPE_STAGE_CAPTIONS.all,
    },
    {
      value: NOTICE_LIST_STAFF_SCOPE_ALL_SCHOOLS,
      label: "모든 학교 대상",
      caption: NOTICE_LIST_STAFF_SCOPE_STAGE_CAPTIONS.allSchools,
    },
    {
      value: "school",
      label: "학교별",
      caption: NOTICE_LIST_STAFF_SCOPE_STAGE_CAPTIONS.school,
    },
  ]

  if (staffRecipient === "SCHOOL_PART_LEADER") {
    options.push({
      value: "part",
      label: "파트별",
      caption: NOTICE_LIST_STAFF_SCOPE_STAGE_CAPTIONS.part,
    })
  }

  return options
}
