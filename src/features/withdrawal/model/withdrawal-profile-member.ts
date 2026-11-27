import type { PartTagPart } from "@umc-product/react"

export type WithdrawalRegisterMemberStatus =
  "active" | "graduated" | "expelled" | "withdrawn"

export type WithdrawalRegisterProfileMember = {
  id: string
  memberId?: number | null
  challengerId?: number | null
  name: string
  nickname: string
  schoolLabel: string
  part: PartTagPart
  partLabel: string
  generation: string
  generationNumber: number
  roleLabel: string
  status: WithdrawalRegisterMemberStatus
  regionLabel: string
}

export function withdrawalRegisterMemberStatusLabel(
  status: WithdrawalRegisterMemberStatus,
): string {
  switch (status) {
    case "graduated":
      return "수료"
    case "expelled":
      return "제적"
    case "withdrawn":
      return "탈퇴"
    case "active":
    default:
      return "활동"
  }
}

export function withdrawalRegisterMemberStatusTagColor(
  status: WithdrawalRegisterMemberStatus,
): "brand" | "neutral" {
  return status === "active" ? "brand" : "neutral"
}
