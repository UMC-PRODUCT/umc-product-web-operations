import type { RoleType } from "@/entities/member"

import type { PointType } from "../api/challenger-points"

export type PointAwardTab = "reward" | "penalty" | "other"

export type PointTypeOption = {
  id: string
  label: string
  score: number
  pointType: PointType
}

export type PenaltyScope = "all" | "campus" | "presidency"

/**
 * 신규 선택 가능한 상점 유형.
 * 과거 전용(BEST_WORKBOOK 등)은 넣지 않는다. CUSTOM은 「기타」 탭에서만.
 */
export const MOCK_REWARD_TYPES: PointTypeOption[] = [
  {
    id: "r-blog",
    label: "블로그 챌린지 참여",
    score: 3,
    pointType: "BLOG_CHALLENGE",
  },
  {
    id: "r-workbook",
    label: "베스트 워크북 선정",
    score: 2,
    pointType: "BEST_WORKBOOK_V2",
  },
  {
    id: "r-reviewer",
    label: "행사 리뷰어",
    score: 1,
    pointType: "UMC_EVENT_REVIEW",
  },
  {
    id: "r-peer-review",
    label: "Peer Review 작성",
    score: 1,
    pointType: "PEER_REVIEW_SUBMISSION",
  },
]

/** 벌점 — 전체 적용 */
export const MOCK_PENALTY_TYPES_ALL: PointTypeOption[] = [
  {
    id: "p-all-homework",
    label: "과제 미수행",
    score: -4,
    pointType: "NO_WORKBOOK_MISSION",
  },
  {
    id: "p-all-study-late",
    label: "스터디 무단 지각",
    score: -2,
    pointType: "STUDY_LATE",
  },
  {
    id: "p-all-study-absent",
    label: "스터디 무단 불참",
    score: -4,
    pointType: "STUDY_ABSENT",
  },
  {
    id: "p-all-event-late",
    label: "행사 무단 지각",
    score: -2,
    pointType: "EVENT_LATE",
  },
  {
    id: "p-all-event-leave",
    label: "행사 중도 퇴실",
    score: -2,
    pointType: "EVENT_EARLY_LEAVE",
  },
  {
    id: "p-all-event-cancel",
    label: "행사 기간 외 취소",
    score: -4,
    pointType: "EVENT_LATE_CANCEL",
  },
  {
    id: "p-all-noshow",
    label: "노쇼(무단 결석)",
    score: -10,
    pointType: "EVENT_NO_SHOW",
  },
]

/** 벌점 — 교내 운영진 */
export const MOCK_PENALTY_TYPES_CAMPUS: PointTypeOption[] = [
  {
    id: "p-campus-feedback",
    label: "기간 외 피드백",
    score: -4,
    pointType: "PART_LEAD_FEEDBACK_LATE",
  },
  {
    id: "p-campus-duty",
    label: "업무 무단 불이행",
    score: -4,
    pointType: "SCHOOL_CORE_TASK_NOT_COMPLETED",
  },
]

/** 벌점 — 회장단 */
export const MOCK_PENALTY_TYPES_PRESIDENCY: PointTypeOption[] = [
  {
    id: "p-pres-meeting",
    label: "회의 무단 불참",
    score: -4,
    pointType: "SCHOOL_CORE_MEETING_ABSENT",
  },
  {
    id: "p-pres-duty",
    label: "업무 무단 불이행",
    score: -4,
    pointType: "SCHOOL_CORE_TASK_NOT_COMPLETED",
  },
]

const PENALTY_BY_SCOPE: Record<PenaltyScope, PointTypeOption[]> = {
  all: MOCK_PENALTY_TYPES_ALL,
  campus: MOCK_PENALTY_TYPES_CAMPUS,
  presidency: MOCK_PENALTY_TYPES_PRESIDENCY,
}

const CAMPUS_ROLES = new Set<RoleType>([
  "SCHOOL_PART_LEADER",
  "SCHOOL_ETC_ADMIN",
])

const PRESIDENCY_ROLES = new Set<RoleType>([
  "SCHOOL_PRESIDENT",
  "SCHOOL_VICE_PRESIDENT",
  "CHAPTER_PRESIDENT",
  "CENTRAL_PRESIDENT",
  "CENTRAL_VICE_PRESIDENT",
  "CENTRAL_OPERATING_TEAM_MEMBER",
  "CENTRAL_EDUCATION_TEAM_MEMBER",
])

/** 대상 구성원의 역할 타입 전체로 노출할 벌점 스코프를 계산한다. */
export function getPenaltyScopesForRoleTypes(
  roleTypes: readonly RoleType[],
): PenaltyScope[] {
  const scopes: PenaltyScope[] = ["all"]
  if (roleTypes.some((role) => CAMPUS_ROLES.has(role))) {
    scopes.push("campus")
  }
  if (roleTypes.some((role) => PRESIDENCY_ROLES.has(role))) {
    scopes.push("presidency")
  }
  return scopes
}

export function getPointTypeOptions(
  tab: Exclude<PointAwardTab, "other">,
  roleTypes: readonly RoleType[],
): PointTypeOption[] {
  if (tab === "reward") {
    return MOCK_REWARD_TYPES
  }
  return getPenaltyScopesForRoleTypes(roleTypes).flatMap(
    (scope) => PENALTY_BY_SCOPE[scope],
  )
}

export const REASON_MAX_LENGTH = 200

export const AWARD_MODAL_TITLE = "상벌점 부여하기"

export type OtherPointKind = "reward" | "penalty"

export function getTypeListLabel(tab: Exclude<PointAwardTab, "other">): string {
  return tab === "reward" ? "상점 유형" : "벌점 유형"
}

export function formatAwardScoreLabel(score: number): string {
  if (score > 0) {
    return `+${score}점`
  }
  return `${score}점`
}

/** 유형 리스트 Tag용. 상점 +3, 벌점 -4 */
export function formatTypeListScore(score: number): string {
  if (score > 0) {
    return `+${score}`
  }
  return `${score}`
}

export function formatOtherScoreCaption(
  kind: OtherPointKind,
  magnitude: number,
): string {
  if (kind === "reward") {
    return `상점 +${magnitude}점으로 기록돼요`
  }
  return `벌점 -${magnitude}점으로 기록돼요`
}

export function toSignedOtherScore(
  kind: OtherPointKind,
  magnitude: number,
): number {
  return kind === "penalty" ? -magnitude : magnitude
}
