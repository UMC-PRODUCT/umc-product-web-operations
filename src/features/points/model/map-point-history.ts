import { isRoleType } from "@/entities/member"

import { toPointsMember } from "./map-search-member"

import type {
  ChallengerInfo,
  ChallengerPointInfo,
  PointType,
} from "../api/challenger-points"
import type { PointHistoryItem } from "./point-history"
import type { PointAwardTab } from "./point-types"
import type { PointsMember } from "./types"

const POINT_TYPE_LABEL: Record<PointType, string> = {
  BEST_WORKBOOK: "베스트 워크북",
  BEST_WORKBOOK_V2: "베스트 워크북 선정",
  BLOG_CHALLENGE: "블로그 챌린지 참여",
  UMC_EVENT_REVIEW: "행사 리뷰어",
  PEER_REVIEW_SUBMISSION: "Peer Review 작성",
  NO_WORKBOOK_MISSION: "과제 미수행",
  STUDY_LATE: "스터디 무단 지각",
  STUDY_ABSENT: "스터디 무단 불참",
  EVENT_LATE: "행사 무단 지각",
  EVENT_EARLY_LEAVE: "행사 중도 퇴실",
  EVENT_LATE_CANCEL: "행사 기간 외 취소",
  EVENT_NO_SHOW: "노쇼(무단 결석)",
  WARNING: "경고",
  OUT: "퇴출",
  CUSTOM: "기타",
  PART_LEAD_FEEDBACK_LATE: "기간 외 피드백",
  SCHOOL_CORE_MEETING_ABSENT: "회의 무단 불참",
  SCHOOL_CORE_TASK_NOT_COMPLETED: "업무 무단 불이행",
}

export function pointTypeLabel(pointType: string | null | undefined): string {
  if (!pointType) {
    return "기타"
  }
  if (pointType in POINT_TYPE_LABEL) {
    return POINT_TYPE_LABEL[pointType as PointType]
  }
  return pointType
}

export function formatOccurredAt(value: string | null | undefined): string {
  if (!value) {
    return ""
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, "0")
  const dd = String(date.getDate()).padStart(2, "0")
  const hh = String(date.getHours()).padStart(2, "0")
  const mi = String(date.getMinutes()).padStart(2, "0")
  return `${yyyy}.${mm}.${dd} ${hh}:${mi}`
}

/** 부호가 양수로 내려와도 벌점으로 뒤집을 유형. OUT(+1)·WARNING(0)은 제외. */
const PENALTY_POINT_TYPES = new Set<PointType>([
  "NO_WORKBOOK_MISSION",
  "STUDY_LATE",
  "STUDY_ABSENT",
  "EVENT_LATE",
  "EVENT_EARLY_LEAVE",
  "EVENT_LATE_CANCEL",
  "EVENT_NO_SHOW",
  "PART_LEAD_FEEDBACK_LATE",
  "SCHOOL_CORE_MEETING_ABSENT",
  "SCHOOL_CORE_TASK_NOT_COMPLETED",
])

function toPointScore(
  pointType: string | null | undefined,
  value: number | string | null | undefined,
) {
  const parsed = typeof value === "number" ? value : Number(value)
  const score = Number.isFinite(parsed) ? parsed : 0
  if (
    pointType != null &&
    PENALTY_POINT_TYPES.has(pointType as PointType) &&
    score > 0
  ) {
    return -score
  }
  return score
}

export function toPointHistoryItem(
  point: ChallengerPointInfo,
): PointHistoryItem {
  const score = toPointScore(point.pointType, point.point)
  return {
    id: String(point.id),
    kind: score < 0 ? "penalty" : "reward",
    typeLabel: pointTypeLabel(point.pointType),
    reason: point.description ?? "",
    score,
    occurredAt: formatOccurredAt(point.createdAt),
  }
}

function pointTime(point: ChallengerPointInfo) {
  const time = point.createdAt ? Date.parse(point.createdAt) : Number.NaN
  return Number.isFinite(time) ? time : 0
}

export function challengerPointList(
  info: ChallengerInfo,
): ChallengerPointInfo[] {
  const merged = new Map<string, ChallengerPointInfo>()
  for (const point of [
    ...(info.challengerPoints ?? []),
    ...(info.points ?? []),
  ]) {
    merged.set(String(point.id), point)
  }
  return [...merged.values()].sort((left, right) => {
    const byTime = pointTime(right) - pointTime(left)
    if (byTime !== 0) {
      return byTime
    }
    return Number(right.id) - Number(left.id)
  })
}

export function toGrantPointBody(input: {
  tab: PointAwardTab
  pointType?: PointType
  typeLabel: string
  score: number
  reason: string
}) {
  const description = input.reason
  if (input.tab === "other") {
    return {
      pointType: "CUSTOM" as const,
      pointValue: input.score,
      description,
    }
  }
  const pointType = input.pointType ?? "CUSTOM"
  if (pointType === "CUSTOM") {
    return {
      pointType: "CUSTOM" as const,
      pointValue: input.score,
      description,
    }
  }
  return { pointType, description }
}

export function toDetailMember(info: ChallengerInfo): PointsMember {
  const mapped = toPointsMember({
    memberId: info.memberId,
    name: info.name,
    nickname: info.nickname,
    schoolName: info.schoolName,
    challengerId: info.challengerId,
    generation: info.gisu,
    part: info.part,
    isAdminInActiveGisu: (info.roles?.length ?? 0) > 0,
    roleTypes: info.roles
      ?.map((role) => role.roleType)
      .filter((role): role is string => Boolean(role))
      .filter(isRoleType),
  })
  return {
    ...mapped,
    id: String(info.memberId ?? info.challengerId),
    regionLabel: info.chapterName ?? undefined,
  }
}
