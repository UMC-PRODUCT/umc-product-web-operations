import { api } from "@/shared/api/client"
import { unwrapApiResult } from "@/shared/api/unwrap-api-result"

import type { MemberPart } from "@/entities/member"

/** CHALLENGER-105 목록 status — PENDING=등록 전, REGISTERED=탈부 */
export type DeactivationListStatus = "PENDING" | "REGISTERED"

export type DeactivationReasonCode =
  | "VOLUNTARY_ACADEMIC_AND_SCHEDULE"
  | "VOLUNTARY_CAREER_PREPARATION"
  | "VOLUNTARY_PERSONAL_CIRCUMSTANCES"
  | "VOLUNTARY_LEARNING_DIFFICULTY_AND_WORKLOAD"
  | "VOLUNTARY_ACTIVITY_EXPECTATION_MISMATCH"
  | "VOLUNTARY_COMMUNICATION_AND_RELATIONSHIP"
  | "VOLUNTARY_OTHER"
  | "INVOLUNTARY_POINT_THRESHOLD"
  | "INVOLUNTARY_EVENT_NO_SHOW"
  | "INVOLUNTARY_LOW_PROJECT_PARTICIPATION"
  | "INVOLUNTARY_OTHER"

export type ChallengerStatus = "ACTIVE" | "GRADUATED" | "EXPELLED" | "WITHDRAWN"

export type DeactivationListItem = {
  challengerId?: number | null
  deactivationId?: number | null
  name?: string | null
  nickname?: string | null
  profileImageId?: string | null
  gisuId?: number | null
  schoolId?: number | null
  schoolName?: string | null
  part?: MemberPart | null
  status?: DeactivationListStatus | null
  challengerStatus?: ChallengerStatus | null
  reason?: DeactivationReasonCode | null
  registeredAt?: string | null
}

export type DeactivationListPage = {
  content?: DeactivationListItem[] | null
  page?: number | null
  size?: number | null
  totalElements?: number | null
  totalPages?: number | null
  hasNext?: boolean | null
  hasPrevious?: boolean | null
}

export type ListDeactivationsParams = {
  gisuId?: number
  chapterId?: number
  schoolId?: number
  part?: MemberPart
  keyword?: string
  reason?: DeactivationReasonCode
  status?: DeactivationListStatus
  page: number
  size: number
  sort?: string[]
}

export const DEACTIVATION_LIST_PAGE_SIZE = 20

/** GET /api/v1/challenger/admin/deactivations (CHALLENGER-105) */
export async function listDeactivations(params: ListDeactivationsParams) {
  const { data } = await api.get<unknown>(
    "/v1/challenger/admin/deactivations",
    {
      params: {
        page: params.page,
        size: params.size,
        ...(params.gisuId != null ? { gisuId: params.gisuId } : {}),
        ...(params.chapterId != null ? { chapterId: params.chapterId } : {}),
        ...(params.schoolId != null ? { schoolId: params.schoolId } : {}),
        ...(params.part ? { part: params.part } : {}),
        ...(params.keyword ? { keyword: params.keyword } : {}),
        ...(params.reason ? { reason: params.reason } : {}),
        ...(params.status ? { status: params.status } : {}),
        ...(params.sort?.length ? { sort: params.sort } : {}),
      },
    },
  )
  return unwrapApiResult<DeactivationListPage>(data)
}

export type DeactivationDetail = {
  deactivationId?: number | null
  challenger?: {
    challengerId?: number | null
    name?: string | null
    nickname?: string | null
    gisuId?: number | null
    generation?: number | null
    schoolId?: number | null
    schoolName?: string | null
    chapterName?: string | null
    part?: MemberPart | null
  } | null
  status?: ChallengerStatus | null
  reason?: DeactivationReasonCode | null
  reasonName?: string | null
  reasonDetail?: string | null
  memo?: string | null
  registeredAt?: string | null
  registeredBy?: {
    memberId?: number | null
    name?: string | null
    nickname?: string | null
  } | null
  images?: Array<{
    imageUrl?: string | null
    originalFileName?: string | null
  }> | null
  links?: string[] | null
  histories?: Array<{
    generation?: number | null
    status?: ChallengerStatus | null
    registeredDate?: string | null
  }> | null
}

/** GET /api/v1/challenger/admin/deactivations/{deactivationId} (CHALLENGER-106) */
export async function getDeactivationDetail(deactivationId: number) {
  const { data } = await api.get<unknown>(
    `/v1/challenger/admin/deactivations/${deactivationId}`,
  )
  return unwrapApiResult<DeactivationDetail>(data)
}

export type ExportDeactivationType =
  | "VOLUNTARY"
  | "POINT_THRESHOLD"
  | "EVENT_NO_SHOW"
  | "LOW_PROJECT_PARTICIPATION"
  | "INVOLUNTARY_OTHER"

export type ExportDeactivationColumn =
  | "ORGANIZATION"
  | "REASON"
  | "REGISTERED_DATE"
  | "REGISTRAR_ROLE"
  | "MEMO"
  | "NAME"

export type ExportDeactivationsBody = {
  gisuId?: number
  chapterId?: number
  schoolId?: number
  part?: MemberPart
  keyword?: string
  reason?: DeactivationReasonCode
  types?: ExportDeactivationType[]
  startDate?: string
  endDate?: string
  deactivationIds?: number[]
  columns?: ExportDeactivationColumn[]
}

/** POST /api/v1/challenger/admin/deactivations/export (CHALLENGER-107) */
export async function exportDeactivationsCsv(body: ExportDeactivationsBody) {
  const { data, headers } = await api.post<Blob>(
    "/v1/challenger/admin/deactivations/export",
    body,
    { responseType: "blob" },
  )
  return { blob: data, headers }
}
