/** 챌린저·공지 API 공통 파트 enum */
export const MEMBER_PARTS = [
  "PLAN",
  "DESIGN",
  "WEB",
  "ANDROID",
  "IOS",
  "NODEJS",
  "SPRINGBOOT",
  "ADMIN",
  "WEB_PRODUCT_ENGINEER",
  "MOBILE_PRODUCT_ENGINEER",
] as const

export type MemberPart = (typeof MEMBER_PARTS)[number]

/** 11기부터 PE 통합 파트 enum 사용 */
export const PE_PART_GENERATION = 11

export function usesLegacyPartLabel(
  generation: number | null | undefined,
): boolean {
  return generation != null && generation < PE_PART_GENERATION
}
