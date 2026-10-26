import type { NoticeAudience } from "./types"

export function parseNoticeListAudience(value: unknown): NoticeAudience {
  return value === "staff" ? "staff" : "challenger"
}

export function parseNoticeListAudienceOptional(
  value: unknown,
): NoticeAudience | undefined {
  if (value === "staff" || value === "challenger") {
    return value
  }

  return undefined
}
