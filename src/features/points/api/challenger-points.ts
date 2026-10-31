import { api } from "@/shared/api/client"
import { unwrapApiResult } from "@/shared/api/unwrap-api-result"

import type { MemberSearchPart } from "./member-search"

export type PointType =
  | "BEST_WORKBOOK"
  | "WARNING"
  | "OUT"
  | "CUSTOM"
  | "BLOG_CHALLENGE"
  | "BEST_WORKBOOK_V2"
  | "UMC_EVENT_REVIEW"
  | "PEER_REVIEW_SUBMISSION"
  | "NO_WORKBOOK_MISSION"
  | "STUDY_LATE"
  | "STUDY_ABSENT"
  | "EVENT_LATE"
  | "EVENT_EARLY_LEAVE"
  | "EVENT_LATE_CANCEL"
  | "EVENT_NO_SHOW"
  | "PART_LEAD_FEEDBACK_LATE"
  | "SCHOOL_CORE_MEETING_ABSENT"
  | "SCHOOL_CORE_TASK_NOT_COMPLETED"

export type ChallengerPointInfo = {
  id: number
  challengerId?: number | null
  pointType?: PointType | string | null
  point?: number | string | null
  description?: string | null
  createdAt?: string | null
}

export type ChallengerRoleInfo = {
  roleType?: string | null
}

export type ChallengerInfo = {
  challengerId: number
  memberId?: number | null
  gisuId?: number | null
  gisu?: number | null
  chapterId?: number | null
  chapterName?: string | null
  part?: MemberSearchPart | null
  challengerPoints?: ChallengerPointInfo[] | null
  points?: ChallengerPointInfo[] | null
  totalPoints?: number | null
  roles?: ChallengerRoleInfo[] | null
  name?: string | null
  nickname?: string | null
  schoolName?: string | null
}

export type GrantChallengerPointBody = {
  pointType: PointType
  description: string
  pointValue?: number
}

export async function fetchChallenger(challengerId: number) {
  const { data } = await api.get<unknown>(`/v1/challenger/${challengerId}`)
  return unwrapApiResult<ChallengerInfo>(data)
}

export async function grantChallengerPoint(
  challengerId: number,
  body: GrantChallengerPointBody,
) {
  const { data } = await api.post<unknown>(
    `/v1/challenger/${challengerId}/points`,
    body,
  )
  return unwrapApiResult<ChallengerInfo>(data)
}

export async function deleteChallengerPoint(challengerPointId: number) {
  await api.delete(`/v1/challenger/points/${challengerPointId}`)
}
