import { MODERN_NOTICE_PART_MIN_GENERATION } from "./notice-create-target-parts"
import { NOTICE_PART_LABELS } from "./notice-part-options"

import type { NoticePart } from "../api/notice-api.types"
import type { NoticeCreateFormState } from "./notice-create-form"

/** 11기부터 공지·상벌점과 동일한 PE 통합 파트 enum */
const MODERN_PARTS_MIN_GENERATION = MODERN_NOTICE_PART_MIN_GENERATION

const LEGACY_NOTICE_CREATE_PARTS: NoticePart[] = [
  "PLAN",
  "DESIGN",
  "WEB",
  "ANDROID",
  "IOS",
  "NODEJS",
  "SPRINGBOOT",
]

const MODERN_NOTICE_CREATE_PARTS: NoticePart[] = [
  "PLAN",
  "DESIGN",
  "WEB_PRODUCT_ENGINEER",
  "MOBILE_PRODUCT_ENGINEER",
]

export type NoticeCreatePartOption = {
  label: string
  value: NoticePart
}

export function resolveNoticeCreatePartOptions(
  generation: number | null,
): NoticeCreatePartOption[] {
  const parts =
    generation != null && generation >= MODERN_PARTS_MIN_GENERATION
      ? MODERN_NOTICE_CREATE_PARTS
      : LEGACY_NOTICE_CREATE_PARTS

  return parts.map((value) => ({
    value,
    label: NOTICE_PART_LABELS[value],
  }))
}

export function filterNoticeCreateParts(
  selected: NoticePart[],
  generation: number | null,
): NoticePart[] {
  const allowed = new Set(
    resolveNoticeCreatePartOptions(generation).map((option) => option.value),
  )
  return selected.filter((part) => allowed.has(part))
}

/** 공지 작성 UI에서 조직·파트를 불러올 기준 기수 */
export function resolveNoticeCreateContextGisuId(
  form: Pick<NoticeCreateFormState, "gisuMode" | "targetGisuId">,
  selectedGisuId: number | null,
): number | null {
  if (form.gisuMode === "specific") {
    return form.targetGisuId ?? selectedGisuId
  }
  return selectedGisuId
}
