import {
  findWithdrawalRegisterReason,
  isWithdrawalRegisterOtherReason,
  type WithdrawalRegisterReasonId,
} from "./withdrawal-register-reasons"

import type { ChallengerDeactivationReason } from "../api/challenger-deactivation.types"
import type { RegisterChallengerDeactivationRequest } from "../api/challenger-deactivation.types"
import type { WithdrawalRegisterFormState } from "./withdrawal-register-form"

const REASON_ID_TO_API: Record<
  WithdrawalRegisterReasonId,
  ChallengerDeactivationReason
> = {
  "academic-schedule": "VOLUNTARY_ACADEMIC_AND_SCHEDULE",
  career: "VOLUNTARY_CAREER_PREPARATION",
  personal: "VOLUNTARY_PERSONAL_CIRCUMSTANCES",
  "learning-burden": "VOLUNTARY_LEARNING_DIFFICULTY_AND_WORKLOAD",
  "expectation-gap": "VOLUNTARY_ACTIVITY_EXPECTATION_MISMATCH",
  communication: "VOLUNTARY_COMMUNICATION_AND_RELATIONSHIP",
  "other-voluntary": "VOLUNTARY_OTHER",
  "points-total-minus-20": "INVOLUNTARY_POINT_THRESHOLD",
  "event-no-show": "INVOLUNTARY_EVENT_NO_SHOW",
  "low-project-participation": "INVOLUNTARY_LOW_PROJECT_PARTICIPATION",
  "other-involuntary": "INVOLUNTARY_OTHER",
}

export function toChallengerDeactivationReason(
  reasonId: WithdrawalRegisterReasonId,
): ChallengerDeactivationReason {
  return REASON_ID_TO_API[reasonId]
}

export function buildRegisterChallengerDeactivationBody(
  form: WithdrawalRegisterFormState,
): RegisterChallengerDeactivationRequest | null {
  if (form.reasonId == null) {
    return null
  }
  const option = findWithdrawalRegisterReason(form.reasonId)
  if (option == null || option.reasonType !== form.reasonType) {
    return null
  }

  const reason = toChallengerDeactivationReason(form.reasonId)
  const reasonDetail = isWithdrawalRegisterOtherReason(form.reasonId)
    ? form.otherReasonDetail.trim()
    : undefined

  const memo = form.adminMemo.trim()

  return {
    reason,
    ...(reasonDetail ? { reasonDetail } : {}),
    ...(memo ? { memo } : {}),
  }
}
