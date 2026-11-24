import type { PartTagPart } from "@umc-product/react"

export type WithdrawalStatus = "pending" | "withdrawn"

export type WithdrawalReasonType = "voluntary" | "involuntary"

export type WithdrawalMember = {
  /** 행 키. `deactivationId` 또는 `challenger:{id}` */
  id: string
  challengerId: number
  /** 상세·CSV 선택에 사용. 등록 전/구기록은 null */
  deactivationId: number | null
  name: string
  nickname: string
  /** 표시용 지부명. API `chapterName` 등 */
  chapterLabel: string
  /** 활동 기수. API `generation` */
  generationNumber: number
  schoolLabel: string
  part: PartTagPart
  reasonType: WithdrawalReasonType
  reasonLabel: string
  status: WithdrawalStatus
  /** `withdrawn` 일 때 표시 (예: 10/23) */
  withdrawnAtLabel: string | null
}
