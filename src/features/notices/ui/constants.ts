import type { NoticeRangeFilter, NoticeTargetFilter } from "../model/types"

/** Figma NT-L01 필터 Select — 110px 고정 (472:9363) */
export const NOTICE_FILTER_SELECT_WIDTH_CLASS = "w-[110px] shrink-0"

/** Label/3-Medium + placeholder 컬러는 DS text-* 유틸 (Select `size="md"`와 동일 토큰) */
export const NOTICE_FILTER_SELECT_TYPO_CLASS = [
  NOTICE_FILTER_SELECT_WIDTH_CLASS,
  "[&_.umc-select__trigger]:text-label-3-medium",
  "[&_.umc-select__value[data-placeholder]]:text-placeholder",
].join(" ")

export const NOTICE_RANGE_SELECT_OPTIONS: {
  label: string
  value: NoticeRangeFilter
}[] = [
  { value: "all", label: "범위 전체" },
  { value: "branch", label: "지부별" },
  { value: "school", label: "학교별" },
  { value: "part", label: "파트별" },
]

export const NOTICE_TARGET_SELECT_OPTIONS: {
  label: string
  value: NoticeTargetFilter
}[] = [
  { value: "all", label: "대상 전체" },
  { value: "web", label: "Web" },
  { value: "server", label: "Server" },
  { value: "design", label: "Design" },
]
