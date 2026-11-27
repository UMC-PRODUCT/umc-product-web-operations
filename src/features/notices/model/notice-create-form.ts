import type { NoticePart, NoticeTab } from "../api/notice-api.types"

export type NoticeCreateStaffScope = Extract<
  NoticeTab,
  "ALL_STAFF" | "CENTRAL_MEMBER" | "SCHOOL_CORE" | "SCHOOL_PART_LEADER"
>

export type NoticeCreateGisuMode = "all" | "specific"
export type NoticeCreateOrgMode = "umc" | "chapter" | "school"

export type NoticeCreateExistingImage = {
  fileId: string
  src: string
}

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
  /** 수정 화면: 서버에 이미 등록된 이미지 */
  existingImages: NoticeCreateExistingImage[]
  imageFiles: File[]
  mustRead: boolean
  sendNotification: boolean
}

export const NOTICE_CREATE_TITLE_MAX_LENGTH = 255
export const NOTICE_CREATE_CONTENT_MAX_LENGTH = 3000

export const INITIAL_NOTICE_CREATE_FORM: NoticeCreateFormState = {
  challengerEnabled: false,
  staffEnabled: false,
  staffScope: "ALL_STAFF",
  gisuMode: "all",
  targetGisuId: null,
  orgMode: "umc",
  chapterId: null,
  schoolId: null,
  parts: [],
  title: "",
  content: "",
  linkDraft: "",
  links: [],
  existingImages: [],
  imageFiles: [],
  mustRead: false,
  sendNotification: false,
}

export const NOTICE_CREATE_STAFF_SCOPE_OPTIONS: {
  value: NoticeCreateStaffScope
  label: string
}[] = [
  { value: "ALL_STAFF", label: "모든 운영진" },
  { value: "CENTRAL_MEMBER", label: "중앙 운영진" },
  { value: "SCHOOL_CORE", label: "회장단" },
  { value: "SCHOOL_PART_LEADER", label: "학교 운영진" },
]
