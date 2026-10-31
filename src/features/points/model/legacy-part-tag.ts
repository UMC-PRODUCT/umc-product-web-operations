import type { CSSProperties } from "react"

import type { MemberSearchPart } from "../api/member-search"

/**
 * Figma `Tag/Product Part` (620:13468) — 10기 이하 filled 배경.
 * Node.js는 Spring과 동일 (`#ede3d9`).
 */
export const LEGACY_PART_FILLED_BG: Record<MemberSearchPart, string> = {
  PLAN: "#eee3fc",
  ADMIN: "#eee3fc",
  DESIGN: "#ffe0f1",
  WEB: "#fff0c2",
  WEB_PRODUCT_ENGINEER: "#fff0c2",
  ANDROID: "#daf1e5",
  IOS: "#e0e8ff",
  MOBILE_PRODUCT_ENGINEER: "#daf1e5",
  SPRINGBOOT: "#ede3d9",
  NODEJS: "#ede3d9",
}

export function getLegacyPartTagStyle(
  sourcePart: MemberSearchPart | null | undefined,
): CSSProperties | undefined {
  if (sourcePart == null) {
    return undefined
  }
  const background = LEGACY_PART_FILLED_BG[sourcePart]
  if (!background) {
    return undefined
  }
  return {
    ["--umc-part-tag-bg" as string]: background,
  }
}
