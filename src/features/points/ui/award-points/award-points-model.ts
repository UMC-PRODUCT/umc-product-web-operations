import type { AwardPointOutcome } from "../../model/mock-award-point"
import type { PointAwardTab, PointTypeOption } from "../../model/point-types"

export type AwardPayload = {
  tab: PointAwardTab
  pointType?: PointTypeOption["pointType"]
  typeLabel: string
  score: number
  reason: string
}

export type AwardError = Exclude<AwardPointOutcome, "success">

export function getAwardErrorMessage(
  error: AwardError,
  tab: PointAwardTab,
): string {
  if (error === "network_error") {
    return "점수를 부여하지 못했어요. 다시 시도해 주세요"
  }
  if (error === "server_error") {
    return "서버에서 점수 부여를 처리하지 못했어요. 잠시 후 다시 시도해 주세요"
  }
  if (tab === "reward") {
    return "상점을 부여할 권한이 없는 구성원이에요"
  }
  if (tab === "penalty") {
    return "벌점을 부여할 권한이 없는 구성원이에요"
  }
  return "상벌점을 부여할 권한이 없는 구성원이에요"
}
