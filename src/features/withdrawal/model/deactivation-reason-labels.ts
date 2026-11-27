import type { DeactivationReasonCode } from "../api/deactivations"

export const DEACTIVATION_REASON_LABELS: Record<
  DeactivationReasonCode,
  string
> = {
  VOLUNTARY_ACADEMIC_AND_SCHEDULE: "학업·일정",
  VOLUNTARY_CAREER_PREPARATION: "취업·진로 준비",
  VOLUNTARY_PERSONAL_CIRCUMSTANCES: "개인 사정",
  VOLUNTARY_LEARNING_DIFFICULTY_AND_WORKLOAD: "학습 난이도·업무량",
  VOLUNTARY_ACTIVITY_EXPECTATION_MISMATCH: "활동 기대 불일치",
  VOLUNTARY_COMMUNICATION_AND_RELATIONSHIP: "소통·관계",
  VOLUNTARY_OTHER: "기타 (자진)",
  INVOLUNTARY_POINT_THRESHOLD: "상벌점 -20점",
  INVOLUNTARY_EVENT_NO_SHOW: "행사 노쇼",
  INVOLUNTARY_LOW_PROJECT_PARTICIPATION: "프로젝트 참여 저조",
  INVOLUNTARY_OTHER: "기타 (타의)",
}

export function isVoluntaryReason(reason: DeactivationReasonCode): boolean {
  return reason.startsWith("VOLUNTARY_")
}

export function deactivationReasonLabel(
  reason: DeactivationReasonCode | null | undefined,
): string {
  if (reason == null) {
    return "-"
  }
  return DEACTIVATION_REASON_LABELS[reason] ?? reason
}
