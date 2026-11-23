import type { WithdrawalReasonType } from "./types"

export type WithdrawalVoluntaryReasonId =
  | "academic-schedule"
  | "career"
  | "personal"
  | "learning-burden"
  | "expectation-gap"
  | "communication"
  | "other-voluntary"

export type WithdrawalInvoluntaryReasonId =
  | "points-total-minus-20"
  | "event-no-show"
  | "low-project-participation"
  | "other-involuntary"

export type WithdrawalRegisterReasonId =
  WithdrawalVoluntaryReasonId | WithdrawalInvoluntaryReasonId

export type WithdrawalRegisterReasonOption = {
  id: WithdrawalRegisterReasonId
  label: string
  caption: string
  summaryLabel: string
  reasonType: WithdrawalReasonType
}

/** 자의 탈부 사유 목록 */
export const WITHDRAWAL_VOLUNTARY_REASON_OPTIONS: readonly WithdrawalRegisterReasonOption[] =
  [
    {
      id: "academic-schedule",
      reasonType: "voluntary",
      label: "학업 및 일정 병행의 어려움",
      caption: "수업, 시험, 다른 대외활동과 병행",
      summaryLabel: "학업 · 일정 병행 어려움",
    },
    {
      id: "career",
      reasonType: "voluntary",
      label: "취업 및 진로 준비",
      caption: "취업 준비, 인턴, 진로 변경",
      summaryLabel: "취업 · 진로 준비",
    },
    {
      id: "personal",
      reasonType: "voluntary",
      label: "개인 사정",
      caption: "건강, 가정 사정 등",
      summaryLabel: "개인 사정",
    },
    {
      id: "learning-burden",
      reasonType: "voluntary",
      label: "학습 난이도 및 학습량 부담",
      caption: "수업, 시험, 다른 대외활동과 병행",
      summaryLabel: "학습 난이도 · 학습량 부담",
    },
    {
      id: "expectation-gap",
      reasonType: "voluntary",
      label: "활동 내용과 기대의 차이",
      caption: "희망한 학습 · 프로젝트 경험과 실제 활동의 차이",
      summaryLabel: "활동 내용과 기대의 차이",
    },
    {
      id: "communication",
      reasonType: "voluntary",
      label: "소통 및 관계의 어려움",
      caption: "운영진 · 구성원과의 소통 · 협업 문제",
      summaryLabel: "소통 · 관계의 어려움",
    },
    {
      id: "other-voluntary",
      reasonType: "voluntary",
      label: "기타",
      caption: "직접 입력",
      summaryLabel: "기타",
    },
  ] as const

/** 타의 탈부 사유 목록 */
export const WITHDRAWAL_INVOLUNTARY_REASON_OPTIONS: readonly WithdrawalRegisterReasonOption[] =
  [
    {
      id: "points-total-minus-20",
      reasonType: "involuntary",
      label: "상벌점 합계 -20점",
      caption: "상벌점 총점이 -20점 이하",
      summaryLabel: "상벌점 합계 -20점",
    },
    {
      id: "event-no-show",
      reasonType: "involuntary",
      label: "행사 노쇼",
      caption: "사전 연락 없이 행사 불참 (총칙 기준 횟수)",
      summaryLabel: "행사 노쇼",
    },
    {
      id: "low-project-participation",
      reasonType: "involuntary",
      label: "프로젝트 참여 저조",
      caption: "TF 조사를 거친 경우",
      summaryLabel: "프로젝트 참여 저조",
    },
    {
      id: "other-involuntary",
      reasonType: "involuntary",
      label: "기타",
      caption: "직접 입력",
      summaryLabel: "기타",
    },
  ] as const

const ALL_WITHDRAWAL_REGISTER_REASON_OPTIONS = [
  ...WITHDRAWAL_VOLUNTARY_REASON_OPTIONS,
  ...WITHDRAWAL_INVOLUNTARY_REASON_OPTIONS,
] as const

export function getWithdrawalRegisterReasonOptions(
  reasonType: WithdrawalReasonType,
): readonly WithdrawalRegisterReasonOption[] {
  return reasonType === "voluntary"
    ? WITHDRAWAL_VOLUNTARY_REASON_OPTIONS
    : WITHDRAWAL_INVOLUNTARY_REASON_OPTIONS
}

export function findWithdrawalRegisterReason(
  id: WithdrawalRegisterReasonId | null,
): WithdrawalRegisterReasonOption | null {
  if (id == null) {
    return null
  }
  return (
    ALL_WITHDRAWAL_REGISTER_REASON_OPTIONS.find((option) => option.id === id) ??
    null
  )
}

export function isWithdrawalRegisterOtherReason(
  id: WithdrawalRegisterReasonId | null,
): boolean {
  return id === "other-voluntary" || id === "other-involuntary"
}

export const WITHDRAWAL_REGISTER_TYPE_LABEL: Record<
  WithdrawalReasonType,
  string
> = {
  voluntary: "자진 탈부",
  involuntary: "타의 탈부",
}
