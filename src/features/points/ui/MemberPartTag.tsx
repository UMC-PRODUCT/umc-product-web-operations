import { PartTag } from "@umc-product/react"

import { getLegacyPartTagStyle } from "../model/legacy-part-tag"
import { usesLegacyPartLabel } from "../model/map-search-member"

import type { PartTagPart } from "@umc-product/react"

import type { MemberSearchPart } from "../api/member-search"

type MemberPartTagProps = {
  part: PartTagPart
  sourcePart?: MemberSearchPart | null
  partLabel?: string
  generationNumber: number | null
  size?: "sm" | "md" | "lg"
}

/**
 * 11기 미만: Figma Tag/Product Part 색 + API 파트명 그대로.
 * 11기 이상: DS PartTag(PE) 기본 라벨·색.
 */
export function MemberPartTag({
  part,
  sourcePart = null,
  partLabel,
  generationNumber,
  size = "sm",
}: MemberPartTagProps) {
  const legacy = usesLegacyPartLabel(generationNumber)
  const label = legacy && partLabel ? partLabel : undefined
  const style = legacy ? getLegacyPartTagStyle(sourcePart) : undefined

  return (
    <PartTag part={part} size={size} style={style}>
      {label}
    </PartTag>
  )
}
