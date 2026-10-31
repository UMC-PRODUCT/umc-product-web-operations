import type { RoleTagColor } from "@umc-product/react"

export type PointAwardTab = "reward" | "penalty" | "other"

export type PointTypeOption = {
  id: string
  label: string
  score: number
}

export type PenaltyScope = "all" | "campus" | "presidency"

/** TODO: API 연동 시 서버 목록으로 교체 */
export const MOCK_REWARD_TYPES: PointTypeOption[] = [
  { id: "r-blog", label: "블로그 챌린지", score: 3 },
  { id: "r-workbook", label: "베스트 워크북 선정", score: 2 },
  { id: "r-reviewer", label: "행사 리뷰어", score: 1 },
  { id: "r-central-event", label: "중앙 행사 참여", score: 2 },
  { id: "r-knowledge", label: "지식인 채널 활동", score: 1 },
]

/** 벌점 — 전체 적용 */
export const MOCK_PENALTY_TYPES_ALL: PointTypeOption[] = [
  { id: "p-all-homework", label: "과제 미수행", score: -4 },
  { id: "p-all-study-late", label: "스터디 지각", score: -2 },
  { id: "p-all-study-absent", label: "스터디 불참", score: -4 },
  { id: "p-all-event-late", label: "행사 지각", score: -2 },
  { id: "p-all-event-leave", label: "행사 중도 퇴실", score: -2 },
  { id: "p-all-event-cancel", label: "행사 기간 외 취소", score: -4 },
  { id: "p-all-noshow", label: "노쇼", score: -10 },
]

/** 벌점 — 교내 운영진 */
export const MOCK_PENALTY_TYPES_CAMPUS: PointTypeOption[] = [
  { id: "p-campus-duty", label: "업무 불이행", score: -4 },
  { id: "p-campus-policy", label: "운영 기준 위반", score: -6 },
]

/** 벌점 — 회장단 */
export const MOCK_PENALTY_TYPES_PRESIDENCY: PointTypeOption[] = [
  { id: "p-pres-meeting", label: "회의 불참", score: -4 },
  { id: "p-pres-duty", label: "업무 불이행", score: -4 },
  { id: "p-pres-document", label: "문서 미제출", score: -4 },
  { id: "p-pres-policy", label: "운영 기준 위반", score: -6 },
]

const PENALTY_BY_SCOPE: Record<PenaltyScope, PointTypeOption[]> = {
  all: MOCK_PENALTY_TYPES_ALL,
  campus: MOCK_PENALTY_TYPES_CAMPUS,
  presidency: MOCK_PENALTY_TYPES_PRESIDENCY,
}

/** 대상 구성원 역할에 따라 노출할 벌점 스코프 */
export function getPenaltyScopesForMemberRole(
  role: RoleTagColor,
): PenaltyScope[] {
  const scopes: PenaltyScope[] = ["all"]
  if (role === "campus") {
    scopes.push("campus")
  }
  if (role === "chapter" || role === "central" || role === "product") {
    scopes.push("presidency")
  }
  return scopes
}

export function getPointTypeOptions(
  tab: Exclude<PointAwardTab, "other">,
  memberRole: RoleTagColor,
): PointTypeOption[] {
  if (tab === "reward") {
    return MOCK_REWARD_TYPES
  }
  return getPenaltyScopesForMemberRole(memberRole).flatMap(
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
