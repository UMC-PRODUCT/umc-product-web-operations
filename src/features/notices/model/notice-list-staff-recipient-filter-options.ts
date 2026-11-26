import {
  NOTICE_CREATE_STAFF_SCOPE_OPTIONS,
  type NoticeCreateStaffScope,
} from "./notice-create-form"
import { NOTICE_LIST_FILTER_ALL } from "./notice-list-filter-all"

import type { SelectOption } from "@umc-product/react"

/** 운영진 목록 — 받는 사람 필터 옵션 설명 (Figma 2808-42072) */
export const NOTICE_LIST_STAFF_RECIPIENT_FILTER_CAPTIONS: Record<
  NoticeCreateStaffScope,
  string
> = {
  ALL_STAFF: "전국 운영진 전체",
  CENTRAL_MEMBER: "총괄·부총괄·운영국·교육국",
  SCHOOL_CORE: "회장·부회장 + 중앙 운영진 (모든 학교 지부장도)",
  SCHOOL_PART_LEADER: "파트장·기타 운영진 + 회장단 + 중앙 운영진",
}

export type NoticeListStaffRecipientFilterVariant =
  "default" | "chapterAdmin" | "schoolAdmin"

export function buildNoticeListStaffRecipientSelectOptions(
  staffRecipientScopeAllowlist: NoticeCreateStaffScope[] | null,
  variant: NoticeListStaffRecipientFilterVariant = "default",
): SelectOption<string>[] {
  const scopeOptions =
    staffRecipientScopeAllowlist == null
      ? NOTICE_CREATE_STAFF_SCOPE_OPTIONS
      : NOTICE_CREATE_STAFF_SCOPE_OPTIONS.filter((option) =>
          staffRecipientScopeAllowlist.includes(option.value),
        )

  const allRecipientsOption: SelectOption<string> = {
    value: NOTICE_LIST_FILTER_ALL,
    label: "받는 사람 전체",
    caption: "내가 받는 운영진 공지 전부",
  }

  return [
    allRecipientsOption,
    ...scopeOptions.map((option) => {
      if (variant === "chapterAdmin") {
        if (option.value === "ALL_STAFF") {
          return {
            value: option.value,
            label: option.label,
            caption: NOTICE_LIST_STAFF_RECIPIENT_FILTER_CAPTIONS.ALL_STAFF,
          }
        }

        if (option.value === "SCHOOL_CORE") {
          return {
            value: option.value,
            label: option.label,
            caption: "모든 학교 회장단",
          }
        }

        return {
          value: option.value,
          label: option.label,
        }
      }

      if (variant === "schoolAdmin") {
        if (option.value === "ALL_STAFF") {
          return {
            value: option.value,
            label: option.label,
            caption: NOTICE_LIST_STAFF_RECIPIENT_FILTER_CAPTIONS.ALL_STAFF,
          }
        }

        if (option.value === "SCHOOL_CORE") {
          return {
            value: option.value,
            label: option.label,
            caption: "모든 학교 + 본교",
          }
        }

        if (option.value === "SCHOOL_PART_LEADER") {
          return {
            value: option.value,
            label: option.label,
            caption: "본교",
          }
        }

        return {
          value: option.value,
          label: option.label,
        }
      }

      return {
        value: option.value,
        label: option.label,
        caption: NOTICE_LIST_STAFF_RECIPIENT_FILTER_CAPTIONS[option.value],
      }
    }),
  ]
}
