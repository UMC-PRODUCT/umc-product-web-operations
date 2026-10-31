/** Figma TextBox — 글자 수 카운터 (Label/2-Medium + text-disabled) */
export const NOTICE_CREATE_LENGTH_COUNTER_CLASS =
  "text-label-2-medium text-disabled tabular-nums whitespace-nowrap"

/** Figma NT-L01 필터 Select — 110px 고정 (472:9363) */
export const NOTICE_FILTER_SELECT_WIDTH_CLASS = "w-auto shrink-0"

/** Label/3-Medium + placeholder 컬러는 DS text-* 유틸 (Select `size="md"`와 동일 토큰) */
export const NOTICE_FILTER_SELECT_TYPO_CLASS = [
  NOTICE_FILTER_SELECT_WIDTH_CLASS,
  "[&_.umc-select__trigger]:text-label-3-medium",
  "[&_.umc-select__value[data-placeholder]]:text-placeholder",
].join(" ")
