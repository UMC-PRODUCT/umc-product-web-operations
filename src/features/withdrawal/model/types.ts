import type { PartTagPart } from "@umc-product/react"

export type WithdrawalStatus = "pending" | "withdrawn"

export type WithdrawalReasonType = "voluntary" | "involuntary"

export type WithdrawalMember = {
  id: string
  /** 등록 API 경로용. 검색·CHALLENGER-101에서 채운다. */
  challengerId?: number | null
  name: string
  nickname: string
  /** 표시용 지부명. API `chapterName` 등 */
  chapterLabel: string
  /** 활동 기수. API `generation` */
  generationNumber: number
  schoolLabel: string
  part: PartTagPart
  /** API 파트 없음 등 — 표시용. 있으면 `getWithdrawalPartLabel(part)` 대신 사용 */
  partLabel?: string
  reasonType: WithdrawalReasonType
  reasonLabel: string
  status: WithdrawalStatus
  /** `withdrawn` 일 때 표시 (예: 10/23) */
  withdrawnAtLabel: string | null
}
