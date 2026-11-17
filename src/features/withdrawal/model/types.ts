import type { PartTagPart } from "@umc-product/react"

export type WithdrawalStatus = "pending" | "withdrawn"

export type WithdrawalReasonType = "voluntary" | "involuntary"

export type WithdrawalMember = {
  id: string
  name: string
  nickname: string
  schoolLabel: string
  part: PartTagPart
  reasonType: WithdrawalReasonType
  reasonLabel: string
  status: WithdrawalStatus
  /** `withdrawn` 일 때 표시 (예: 10/23) */
  withdrawnAtLabel: string | null
}
