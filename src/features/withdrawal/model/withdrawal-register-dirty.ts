import type { WithdrawalMember } from "./types"
import type { WithdrawalRegisterFormState } from "./withdrawal-register-form"

/** 탈부 등록 폼·대상 선택에 사용자 입력이 있으면 true */
export function isWithdrawalRegisterFormDirty(
  form: WithdrawalRegisterFormState,
  pickedMember: WithdrawalMember | null,
  isPreselectedMember: boolean,
): boolean {
  if (!isPreselectedMember && pickedMember != null) {
    return true
  }

  if (form.reasonType != null || form.reasonId != null) {
    return true
  }
  if (form.otherReasonDetail.trim()) {
    return true
  }
  if (form.imageFiles.length > 0) {
    return true
  }
  if (form.linkDraft.trim() || form.links.length > 0) {
    return true
  }
  if (form.adminMemo.trim()) {
    return true
  }

  return false
}
