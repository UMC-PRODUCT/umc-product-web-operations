import type { PointHistoryItem } from "./point-history"

export const MOCK_POINT_HISTORY_BY_MEMBER: Record<string, PointHistoryItem[]> =
  {
    "1": [
      {
        id: "h1",
        kind: "penalty",
        typeLabel: "스터디 무단 불참",
        reason: "3주차 스터디 사전 연락 없이 불참",
        score: -4,
        occurredAt: "2026.10.20 21:30",
      },
      {
        id: "h2",
        kind: "reward",
        typeLabel: "해커톤 우수상",
        reason: "중앙대 해커톤 우수상 수상",
        score: 3,
        occurredAt: "2026.10.12 18:00",
      },
      {
        id: "h3",
        kind: "penalty",
        typeLabel: "지각",
        reason: "전체 회의 지각",
        score: -2,
        occurredAt: "2026.09.28 14:10",
      },
    ],
    "2": [],
    "3": [
      {
        id: "h4",
        kind: "reward",
        typeLabel: "스터디 리드",
        reason: "웹 스터디 리드 활동",
        score: 2,
        occurredAt: "2026.10.01 20:00",
      },
    ],
    "4": [
      {
        id: "h5",
        kind: "penalty",
        typeLabel: "스터디 무단 불참",
        reason: "1주차 스터디 무단 불참",
        score: -1,
        occurredAt: "2026.08.15 21:00",
      },
    ],
  }

export function getMockPointHistory(memberId: string): PointHistoryItem[] {
  return MOCK_POINT_HISTORY_BY_MEMBER[memberId] ?? []
}
