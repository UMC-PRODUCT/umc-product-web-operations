import { api } from "@/shared/api/client"
import { unwrapApiResult } from "@/shared/api/unwrap-api-result"

import type {
  GisuItem,
  GisuOrganizationV2Response,
} from "./organization-api.types"

/** GISU-201: `id` / `generation` / `active` 중 조회 기준은 하나만 허용 */
function serializeGisuOrganizationQuery(input: {
  gisuId?: number
  includeChapter: boolean
  includeSchool: boolean
}) {
  const search = new URLSearchParams()
  search.append("includeChapter", String(input.includeChapter))
  search.append("includeSchool", String(input.includeSchool))

  if (input.gisuId != null) {
    search.append("id", String(input.gisuId))
  } else {
    search.append("active", "true")
  }

  return search.toString()
}

export async function fetchActiveGisuOrganization(
  gisuId: number,
): Promise<GisuItem | null> {
  const query = serializeGisuOrganizationQuery({
    gisuId,
    includeChapter: true,
    includeSchool: true,
  })
  const { data } = await api.get<unknown>(`/v2/gisu?${query}`)
  const result = unwrapApiResult<GisuOrganizationV2Response>(data)
  return (
    result.gisus.find((gisu) => gisu.gisuId === gisuId) ??
    result.gisus[0] ??
    null
  )
}
