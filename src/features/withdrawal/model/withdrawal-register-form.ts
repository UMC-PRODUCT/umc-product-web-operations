import type { WithdrawalReasonType } from "./types"
import type { WithdrawalRegisterReasonId } from "./withdrawal-register-reasons"

export const WITHDRAWAL_REGISTER_LINK_MAX = 3
export const WITHDRAWAL_REGISTER_IMAGE_MAX = 5
export const WITHDRAWAL_REGISTER_MEMO_MAX = 100
export const WITHDRAWAL_REGISTER_OTHER_REASON_MAX = 100

export type WithdrawalRegisterFormState = {
  reasonType: WithdrawalReasonType | null
  reasonId: WithdrawalRegisterReasonId | null
  otherReasonDetail: string
  imageFiles: File[]
  linkDraft: string
  links: string[]
  adminMemo: string
}

export const INITIAL_WITHDRAWAL_REGISTER_FORM: WithdrawalRegisterFormState = {
  reasonType: null,
  reasonId: null,
  otherReasonDetail: "",
  imageFiles: [],
  linkDraft: "",
  links: [],
  adminMemo: "",
}
