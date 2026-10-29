import { api } from "@/shared/api/client"
import { unwrapApiResult } from "@/shared/api/unwrap-api-result"

export type GisuListItem = {
  gisuId: number
  generation: number
  isActive: boolean
}

type GisuListRawItem = {
  gisuId?: number | string | null
  generation?: number | string | null
  gisu?: number | string | null
  isActive?: boolean | null
}

type GisuListPage = {
  content?: GisuListRawItem[] | null
  hasNext?: boolean | null
}

const GISU_PAGE_SIZE = 20
const MAX_GISU_PAGES = 10

function toPositiveInt(
  value: number | string | null | undefined,
): number | null {
  const parsed = typeof value === "number" ? value : Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null
}

export function toGisuListItems(
  content: readonly GisuListRawItem[] | null | undefined,
) {
  const items: GisuListItem[] = []

  for (const item of content ?? []) {
    const gisuId = toPositiveInt(item.gisuId)
    const generation = toPositiveInt(item.generation ?? item.gisu)
    if (gisuId == null || generation == null) {
      continue
    }
    items.push({
      gisuId,
      generation,
      isActive: item.isActive === true,
    })
  }

  return items
}

export async function fetchGisuList() {
  const items: GisuListItem[] = []
  let page = 0
  let hasNext = true

  while (hasNext && page < MAX_GISU_PAGES) {
    const { data } = await api.get<unknown>("/v1/gisu", {
      params: {
        page,
        size: GISU_PAGE_SIZE,
        sort: "generation,desc",
      },
    })
    const result = unwrapApiResult<GisuListPage>(data)
    items.push(...toGisuListItems(result.content))
    hasNext = result.hasNext === true
    page += 1
  }

  return items
}
