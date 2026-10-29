import type { NoticePart, NoticeTab } from "../api/notice-api.types"

export type NoticeCreateStaffScope = Extract<
  NoticeTab,
  "CENTRAL_MEMBER" | "SCHOOL_CORE" | "SCHOOL_PART_LEADER"
>

export type NoticeCreateGisuMode = "all" | "specific"
export type NoticeCreateOrgMode = "umc" | "chapter" | "school"

export type NoticeCreateFormState = {
  challengerEnabled: boolean
  staffEnabled: boolean
  staffScope: NoticeCreateStaffScope
  gisuMode: NoticeCreateGisuMode
  targetGisuId: number | null
  orgMode: NoticeCreateOrgMode
  chapterId: number | null
  schoolId: number | null
  parts: NoticePart[]
  title: string
  content: string
  linkDraft: string
  links: string[]
  imageFiles: File[]
  mustRead: boolean
  sendNotification: boolean
}

export const NOTICE_CREATE_TITLE_MAX_LENGTH = 255
export const NOTICE_CREATE_CONTENT_MAX_LENGTH = 3000

export const INITIAL_NOTICE_CREATE_FORM: NoticeCreateFormState = {
  challengerEnabled: false,
  staffEnabled: true,
  staffScope: "CENTRAL_MEMBER",
  gisuMode: "specific",
  targetGisuId: null,
  orgMode: "school",
  chapterId: null,
  schoolId: null,
  parts: ["WEB", "ANDROID"],
  title: "",
  content: "",
  linkDraft: "",
  links: [],
  imageFiles: [],
  mustRead: true,
  sendNotification: true,
}

export const NOTICE_CREATE_STAFF_SCOPE_OPTIONS: {
  value: NoticeCreateStaffScope
  label: string
}[] = [
  { value: "CENTRAL_MEMBER", label: "중앙 운영진 이상" },
  { value: "SCHOOL_CORE", label: "교내 회장단 이상" },
  { value: "SCHOOL_PART_LEADER", label: "교내 파트장 이상" },
]

export const NOTICE_CREATE_PART_OPTIONS: NoticePart[] = [
  "PLAN",
  "DESIGN",
  "WEB",
  "ANDROID",
  "IOS",
  "NODEJS",
  "SPRINGBOOT",
]
