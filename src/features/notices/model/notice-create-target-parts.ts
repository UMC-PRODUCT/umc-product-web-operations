import type { NoticePart } from "../api/notice-api.types"

/** 11기부터 공지 API는 PE 통합 파트 enum만 허용 (NOTICE-0013) */
export const MODERN_NOTICE_PART_MIN_GENERATION = 11

/** 10기 이하 UI·멤버 데이터의 트랙 파트 → 공지 API 현재 파트 */
const LEGACY_TRACK_PART_TO_MODERN: Partial<Record<NoticePart, NoticePart>> = {
  ADMIN: "PLAN",
  ANDROID: "MOBILE_PRODUCT_ENGINEER",
  IOS: "MOBILE_PRODUCT_ENGINEER",
  NODEJS: "WEB_PRODUCT_ENGINEER",
  SPRINGBOOT: "WEB_PRODUCT_ENGINEER",
  WEB: "WEB_PRODUCT_ENGINEER",
}

export function normalizeNoticeCreateTargetParts(
  parts: NoticePart[],
  targetGeneration: number | null,
): NoticePart[] {
  if (parts.length === 0) {
    return []
  }

  const mapped =
    targetGeneration != null &&
    targetGeneration >= MODERN_NOTICE_PART_MIN_GENERATION
      ? parts
      : parts.map((part) => LEGACY_TRACK_PART_TO_MODERN[part] ?? part)

  return [...new Set(mapped)]
}
