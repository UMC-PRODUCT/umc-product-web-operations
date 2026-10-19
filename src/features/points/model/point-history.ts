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

export function formatAwardToastMessage(
  typeLabel: string,
  score: number,
): string {
  const kindLabel = score < 0 ? "벌점" : "상점"
  return `'${typeLabel}'으로 ${kindLabel} ${Math.abs(score)}점을 주었어요`
}

export function formatDeleteToastMessage(
  previousTotal: number,
  nextTotal: number,
): string {
  return `기록을 삭제했어요. 총점이 ${formatPointScore(previousTotal)}에서 ${formatPointScore(nextTotal)}로 바뀌었어요`
}
