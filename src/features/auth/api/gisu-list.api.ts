import { api } from "@/shared/api/client"
import { unwrapApiResult } from "@/shared/api/unwrap-api-result"

import type {
  GisuPageResponse,
  GisuSummary,
  ListGisusParams,
} from "./gisu-api.types"

function readNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

export function normalizeGisuSummary(raw: unknown): GisuSummary | null {
  if (!raw || typeof raw !== "object") {
    return null
  }

  const item = raw as Record<string, unknown>
  const gisuId = readNumber(item.gisuId ?? item.gisu)
  const generation = readNumber(item.generation)
  if (gisuId == null || generation == null) {
    return null
  }

  return {
    endAt: typeof item.endAt === "string" ? item.endAt : undefined,
    generation,
    gisu: readNumber(item.gisu) ?? undefined,
    gisuId,
    isActive: item.isActive === true,
    startAt: typeof item.startAt === "string" ? item.startAt : undefined,
  }
}

function serializeListGisusParams(params: ListGisusParams) {
  const search = new URLSearchParams()
  search.append("page", String(params.page ?? 0))
  search.append("size", String(params.size ?? 50))
  for (const sort of params.sort ?? ["generation,desc"]) {
    search.append("sort", sort)
  }
  return search.toString()
}

/** GISU-101 — 기수 목록 페이징 조회 */
export async function listGisus(
  params: ListGisusParams = {},
): Promise<GisuPageResponse> {
  const query = serializeListGisusParams(params)
  const { data } = await api.get<unknown>(`/v1/gisu?${query}`)
  const result = unwrapApiResult<GisuPageResponse>(data)
  const content = (result.content ?? [])
    .map(normalizeGisuSummary)
    .filter((item): item is GisuSummary => item != null)

  return {
    ...result,
    content,
  }
}

export async function fetchAllGisuSummaries(
  params: Omit<ListGisusParams, "page"> = {},
): Promise<GisuSummary[]> {
  const pageSize = params.size ?? 50
  const sort = params.sort ?? ["generation,desc"]
  const collected: GisuSummary[] = []
  let page = 0

  for (;;) {
    const response = await listGisus({ page, size: pageSize, sort })
    collected.push(...response.content)
    if (!response.hasNext || response.content.length === 0) {
      break
    }
    page += 1
  }

  return collected
}
