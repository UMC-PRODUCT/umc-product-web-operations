import type { GisuListItem } from "@/shared/api/gisu-list"

export type GisuGenerationLookup = ReadonlyMap<number, number>

export function buildGisuGenerationLookup(
  items: readonly Pick<GisuListItem, "gisuId" | "generation">[],
): GisuGenerationLookup {
  const map = new Map<number, number>()
  for (const item of items) {
    map.set(item.gisuId, item.generation)
  }
  return map
}

/** API `targetGisuId` / `gisuId`는 기수 PK — 화면에는 `generation`기 로 표시 */
export function formatGisuGenerationLabel(
  gisuId: number,
  lookup?: GisuGenerationLookup | null,
): string {
  const generation = lookup?.get(gisuId)
  if (generation != null) {
    return `${generation}기`
  }
  return `기수 #${gisuId}`
}
