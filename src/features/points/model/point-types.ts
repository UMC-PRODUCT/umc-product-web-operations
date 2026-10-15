export type PointAwardTab = "reward" | "penalty" | "other"

export type PointTypeOption = {
  id: string
  label: string
  score: number
}

/** TODO: API 연동 시 서버 목록으로 교체 */
export const MOCK_REWARD_TYPES: PointTypeOption[] = [
  { id: "r1", label: "해커톤 우수상", score: 3 },
  { id: "r2", label: "스터디 리드", score: 2 },
  { id: "r3", label: "프로젝트 기여", score: 2 },
  { id: "r4", label: "행사 스태프", score: 1 },
  { id: "r5", label: "멘토링 활동", score: 2 },
]

/** TODO: API 연동 시 서버 목록으로 교체 */
export const MOCK_PENALTY_TYPES: PointTypeOption[] = [
  { id: "p1", label: "과제 미수행", score: -4 },
  { id: "p2", label: "스터디 무단 지각", score: -2 },
  { id: "p3", label: "스터디 무단 불참", score: -4 },
  { id: "p4", label: "행사 무단 지각", score: -2 },
  { id: "p5", label: "행사 무단 조퇴", score: -2 },
  { id: "p6", label: "행사 기간 외 취소", score: -4 },
  { id: "p7", label: "노쇼", score: -10 },
  { id: "p8", label: "기간 외 피드백", score: -4 },
  { id: "p9", label: "회의 무단 불참", score: -4 },
]

export const REASON_MAX_LENGTH = 200

export function getAwardModalTitle(tab: PointAwardTab): string {
  switch (tab) {
    case "reward":
      return "상점 부여하기"
    case "penalty":
      return "벌점 부여하기"
    case "other":
      return "기타 상벌점 부여하기"
  }
}

export function getTypeListLabel(tab: Exclude<PointAwardTab, "other">): string {
  return tab === "reward" ? "상점 유형" : "벌점 유형"
}

export function formatAwardScoreLabel(score: number): string {
  if (score > 0) {
    return `+${score}점`
  }
  return `${score}점`
}
