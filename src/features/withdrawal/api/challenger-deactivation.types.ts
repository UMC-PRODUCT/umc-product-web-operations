/** CHALLENGER-006 — RegisterChallengerDeactivationRequest.reason */
export type ChallengerDeactivationReason =
  | "VOLUNTARY_ACADEMIC_AND_SCHEDULE"
  | "VOLUNTARY_CAREER_PREPARATION"
  | "VOLUNTARY_PERSONAL_CIRCUMSTANCES"
  | "VOLUNTARY_LEARNING_DIFFICULTY_AND_WORKLOAD"
  | "VOLUNTARY_ACTIVITY_EXPECTATION_MISMATCH"
  | "VOLUNTARY_COMMUNICATION_AND_RELATIONSHIP"
  | "VOLUNTARY_OTHER"
  | "INVOLUNTARY_POINT_THRESHOLD"
  | "INVOLUNTARY_EVENT_NO_SHOW"
  | "INVOLUNTARY_LOW_PROJECT_PARTICIPATION"
  | "INVOLUNTARY_OTHER"

export type RegisterChallengerDeactivationRequest = {
  reason: ChallengerDeactivationReason
  /** 기타 사유일 때 필수 (0–100) */
  reasonDetail?: string
  /** 운영진 메모 (0–100) */
  memo?: string
  /** 증빙 이미지 fileId (0–5) */
  imageIds?: string[]
  /** 근거 링크 (0–3) */
  links?: string[]
}

export type RegisterChallengerDeactivationResponse = {
  deactivationId?: number
  challengerId?: number
}

/** CHALLENGER-007 — 기존 탈부 기록에 근거 추가 */
export type AddChallengerDeactivationEvidenceRequest = {
  imageIds?: string[]
  links?: string[]
}
