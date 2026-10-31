/** DS TextArea `.umc-text-area__counter`와 동일 (Body/2-Regular + placeholder) */
export const NOTICE_CREATE_LENGTH_COUNTER_CLASS =
  "text-body-2-regular text-placeholder tabular-nums whitespace-nowrap"

export const NOTICE_FILTER_SELECT_WIDTH_CLASS = "w-auto shrink-0"

/** Label/3-Medium + placeholder 컬러는 DS text-* 유틸 (Select `size="md"`와 동일 토큰) */
export const NOTICE_FILTER_SELECT_TYPO_CLASS = [
  NOTICE_FILTER_SELECT_WIDTH_CLASS,
  "[&_.umc-select__trigger]:text-label-3-medium",
  "[&_.umc-select__value[data-placeholder]]:text-placeholder",
].join(" ")
