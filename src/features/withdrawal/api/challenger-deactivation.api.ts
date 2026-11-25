import { api } from "@/shared/api/client"
import { unwrapApiResult } from "@/shared/api/unwrap-api-result"

import type {
  AddChallengerDeactivationEvidenceRequest,
  RegisterChallengerDeactivationRequest,
  RegisterChallengerDeactivationResponse,
} from "./challenger-deactivation.types"

/** CHALLENGER-006 — 챌린저 탈부 등록 */
export async function registerChallengerDeactivation(
  challengerId: number,
  body: RegisterChallengerDeactivationRequest,
): Promise<RegisterChallengerDeactivationResponse> {
  const { data } = await api.post<unknown>(
    `/v1/challenger/admin/${challengerId}/deactivations`,
    body,
  )
  return unwrapApiResult<RegisterChallengerDeactivationResponse>(data)
}

/** CHALLENGER-007 — 탈부 근거 자료 추가 (등록 직후 사진·링크) */
export async function addChallengerDeactivationEvidence(
  challengerId: number,
  body: AddChallengerDeactivationEvidenceRequest,
): Promise<void> {
  const { data } = await api.post<unknown>(
    `/v1/challenger/admin/${challengerId}/deactivations/evidence`,
    body,
  )
  if (data !== null && data !== undefined && data !== "") {
    unwrapApiResult<unknown>(data)
  }
}
