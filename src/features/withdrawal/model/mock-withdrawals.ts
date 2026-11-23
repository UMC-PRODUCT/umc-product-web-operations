import type { WithdrawalMember } from "./types"

/** Figma 탈부 관리 테이블 목 데이터 (API 연동 전) */
export const MOCK_WITHDRAWALS: WithdrawalMember[] = [
  {
    id: "1",
    name: "김땡땡",
    nickname: "닉네임닉네임",
    chapterLabel: "서울 지부",
    generationNumber: 11,
    schoolLabel: "중앙대학교",
    part: "design",
    reasonType: "involuntary",
    reasonLabel: "프로젝트 참여 저조",
    status: "pending",
    withdrawnAtLabel: null,
  },
  {
    id: "2",
    name: "김땡땡",
    nickname: "닉네임닉네임",
    chapterLabel: "서울 지부",
    generationNumber: 11,
    schoolLabel: "중앙대학교",
    part: "design",
    reasonType: "involuntary",
    reasonLabel: "프로젝트 참여 저조",
    status: "withdrawn",
    withdrawnAtLabel: "10/23",
  },
  {
    id: "3",
    name: "김땡땡",
    nickname: "닉네임닉네임",
    chapterLabel: "서울 지부",
    generationNumber: 11,
    schoolLabel: "중앙대학교",
    part: "design",
    reasonType: "involuntary",
    reasonLabel: "프로젝트 참여 저조",
    status: "pending",
    withdrawnAtLabel: null,
  },
]

export const WITHDRAWAL_REASON_FILTER_OPTIONS = [
  { value: "voluntary", label: "자의" },
  { value: "involuntary", label: "타의" },
] as const

export const WITHDRAWAL_STATUS_FILTER_OPTIONS = [
  { value: "pending", label: "등록 전" },
  { value: "withdrawn", label: "탈부" },
] as const

export function withdrawalReasonTypeLabel(
  reasonType: WithdrawalMember["reasonType"],
): string {
  return reasonType === "voluntary" ? "자의" : "타의"
}

export function withdrawalStatusLabel(
  status: WithdrawalMember["status"],
): string {
  return status === "pending" ? "등록 전" : "탈부"
}
