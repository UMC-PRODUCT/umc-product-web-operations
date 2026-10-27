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
  BEST_WORKBOOK: "베스트 워크북 선정",
  BEST_WORKBOOK_V2: "베스트 워크북 선정",
  BLOG_CHALLENGE: "블로그 챌린지",
  UMC_EVENT_REVIEW: "행사 리뷰어",
  PEER_REVIEW_SUBMISSION: "피어리뷰 제출",
  NO_WORKBOOK_MISSION: "과제 미수행",
  STUDY_LATE: "스터디 지각",
  STUDY_ABSENT: "스터디 불참",
  EVENT_LATE: "행사 지각",
  EVENT_EARLY_LEAVE: "행사 중도 퇴실",
  EVENT_LATE_CANCEL: "행사 기간 외 취소",
  EVENT_NO_SHOW: "노쇼",
  WARNING: "경고",
  OUT: "아웃",
  CUSTOM: "기타",
  PART_LEAD_FEEDBACK_LATE: "파트장 피드백 지각",
  SCHOOL_CORE_MEETING_ABSENT: "회의 불참",
  SCHOOL_CORE_TASK_NOT_COMPLETED: "업무 불이행",
}

const LABEL_TO_POINT_TYPE: Record<string, PointType> = {
  "블로그 챌린지": "BLOG_CHALLENGE",
  "베스트 워크북 선정": "BEST_WORKBOOK_V2",
  "행사 리뷰어": "UMC_EVENT_REVIEW",
  "과제 미수행": "NO_WORKBOOK_MISSION",
  "스터디 지각": "STUDY_LATE",
  "스터디 불참": "STUDY_ABSENT",
  "행사 지각": "EVENT_LATE",
  "행사 중도 퇴실": "EVENT_EARLY_LEAVE",
  "행사 기간 외 취소": "EVENT_LATE_CANCEL",
  노쇼: "EVENT_NO_SHOW",
  "회의 불참": "SCHOOL_CORE_MEETING_ABSENT",
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

const PENALTY_POINT_TYPES = new Set<PointType>([
  "WARNING",
  "OUT",
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
  const pointType = LABEL_TO_POINT_TYPE[input.typeLabel]
  if (!pointType) {
    return {
      pointType: "CUSTOM" as const,
      pointValue: input.score,
      description,
    }
  }
  return { pointType, description }
}

export function toDetailMember(
  info: ChallengerInfo,
  memberId: string,
): PointsMember {
  const mapped = toPointsMember({
    memberId: info.memberId ?? Number(memberId),
    name: info.name,
    nickname: info.nickname,
    schoolName: info.schoolName,
    currentChallenger: {
      challengerId: info.challengerId,
      generation: info.gisu,
      part: info.part,
    },
    isAdminInActiveGisu: (info.roles?.length ?? 0) > 0,
    challengerRecords: [
      {
        part: info.part,
        gisu: info.gisu,
        chapterName: info.chapterName,
        schoolName: info.schoolName,
        challengerRoleType: info.roles?.[0]?.roleType,
      },
    ],
  })
  return { ...mapped, id: memberId }
}
