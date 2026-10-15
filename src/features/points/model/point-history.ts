export type PointKind = "reward" | "penalty"

export type PointHistoryItem = {
  id: string
  kind: PointKind
  typeLabel: string
  reason: string
  score: number
  occurredAt: string
}

export type MemberPointSummary = {
  total: number
  rewardTotal: number
  penaltyTotal: number
}

export function formatPointScore(score: number): string {
  if (score > 0) {
    return `+${score}`
  }
  return String(score)
}
