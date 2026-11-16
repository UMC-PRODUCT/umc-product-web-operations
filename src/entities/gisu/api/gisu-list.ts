import { api } from "@/shared/api/client"
import { unwrapApiResult } from "@/shared/api/unwrap-api-result"
import { toPositiveInt } from "@/shared/lib/to-positive-int"

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
}

/** 기수 수가 적어 size를 크게 잡아 1회 조회한다. */
const GISU_LIST_SIZE = 200

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
  const { data } = await api.get<unknown>("/v1/gisu", {
    params: {
      page: 0,
      size: GISU_LIST_SIZE,
      sort: "generation,desc",
    },
  })
  const result = unwrapApiResult<GisuListPage>(data)
  return toGisuListItems(result.content)
}
