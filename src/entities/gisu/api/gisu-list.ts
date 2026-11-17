import { api } from "@/shared/api/client"
import { unwrapApiResult } from "@/shared/api/unwrap-api-result"
import { toPositiveInt } from "@/shared/lib/to-positive-int"

export type GisuListItem = {
  gisuId: number
  generation: number
  isActive: boolean
  /** API `startAt` (기수 시작일). 프로필 기수 메뉴 연도 표시에 사용 */
  startAt: string | null
}

type GisuListRawItem = {
  gisuId?: number | string | null
  generation?: number | string | null
  gisu?: number | string | null
  isActive?: boolean | null
  startAt?: string | null
  startedAt?: string | null
}

type GisuListPage = {
  content?: GisuListRawItem[] | null
}

/** 기수 수가 적어 size를 크게 잡아 1회 조회한다. */
const GISU_LIST_SIZE = 200

function toStartAt(item: GisuListRawItem): string | null {
  if (typeof item.startAt === "string" && item.startAt.trim() !== "") {
    return item.startAt
  }
  if (typeof item.startedAt === "string" && item.startedAt.trim() !== "") {
    return item.startedAt
  }
  return null
}

/** `startAt`에서 연도 문자열을 뽑는다. 파싱 실패 시 undefined. */
export function formatGisuStartYear(
  startAt: string | null | undefined,
): string | undefined {
  if (startAt == null || startAt.trim() === "") {
    return undefined
  }
  const date = new Date(startAt)
  if (Number.isNaN(date.getTime())) {
    return undefined
  }
  return String(date.getFullYear())
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
      startAt: toStartAt(item),
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
