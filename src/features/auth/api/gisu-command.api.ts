import { api } from "@/shared/api/client"
import { unwrapApiResult } from "@/shared/api/unwrap-api-result"

/** GISU-003 — 활성 기수 변경 */
export async function activateActiveGisu(gisuId: number): Promise<void> {
  const { data } = await api.post<unknown>(`/v1/gisu/${gisuId}/active`)
  if (data !== null && data !== undefined && data !== "") {
    unwrapApiResult<null>(data)
  }
}
