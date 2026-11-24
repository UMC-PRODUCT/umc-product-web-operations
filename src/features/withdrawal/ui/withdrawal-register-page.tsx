import { useNavigate } from "@tanstack/react-router"
import { useToast } from "@umc-product/react"
import { useMemo, useState } from "react"

import { useFormLeaveConfirm } from "@/shared/lib/use-form-leave-confirm"

import { mapWithdrawalMemberToProfileMember } from "../model/map-withdrawal-register-member"
import { MOCK_WITHDRAWALS } from "../model/mock-withdrawals"
import { buildWithdrawalLocationState } from "../model/withdrawal-location-state"
import { isWithdrawalRegisterFormDirty } from "../model/withdrawal-register-dirty"
import {
  INITIAL_WITHDRAWAL_REGISTER_FORM,
  type WithdrawalRegisterFormState,
} from "../model/withdrawal-register-form"
import {
  findWithdrawalRegisterReason,
  isWithdrawalRegisterOtherReason,
} from "../model/withdrawal-register-reasons"
import { showWithdrawalRegisterFailureToast } from "./show-withdrawal-register-failure-toast"
import { formatWithdrawalRegisterSuccessToastMessage } from "./show-withdrawal-register-success-toast"
import { WithdrawalRegisterDiscardDialog } from "./withdrawal-register-discard-dialog"
import { WithdrawalRegisterEvidenceSection } from "./withdrawal-register-evidence-section"
import { WithdrawalRegisterInfoSection } from "./withdrawal-register-info-section"
import { WithdrawalRegisterProfileCard } from "./withdrawal-register-profile-card"
import { WithdrawalRegisterServiceNotice } from "./withdrawal-register-service-notice"
import { WithdrawalRegisterSummaryPanel } from "./withdrawal-register-summary-panel"
import { WithdrawalRegisterTargetSection } from "./withdrawal-register-target-section"

import type { WithdrawalMember } from "../model/types"

type WithdrawalRegisterPageProps = {
  memberId?: string
}

export function WithdrawalRegisterPage({
  memberId,
}: WithdrawalRegisterPageProps) {
  const navigate = useNavigate()
  const toast = useToast()
  const [form, setForm] = useState<WithdrawalRegisterFormState>(
    INITIAL_WITHDRAWAL_REGISTER_FORM,
  )
  const [showReasonError, setShowReasonError] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pickedMember, setPickedMember] = useState<WithdrawalMember | null>(
    null,
  )

  const isPreselectedMember = memberId != null

  const withdrawalMember = useMemo(() => {
    if (isPreselectedMember) {
      return (
        MOCK_WITHDRAWALS.find(
          (member) =>
            member.id === memberId || String(member.challengerId) === memberId,
        ) ?? null
      )
    }
    return pickedMember
  }, [isPreselectedMember, memberId, pickedMember])

  const profileMember = useMemo(
    () =>
      withdrawalMember != null
        ? mapWithdrawalMemberToProfileMember(withdrawalMember)
        : null,
    [withdrawalMember],
  )

  const isDirty = useMemo(
    () =>
      isWithdrawalRegisterFormDirty(form, pickedMember, isPreselectedMember),
    [form, isPreselectedMember, pickedMember],
  )

  const {
    allowLeave,
    confirmLeave,
    dismissLeaveDialog,
    leaveDialogOpen,
    requestLeave,
  } = useFormLeaveConfirm({
    isDirty,
    navigateTo: (to) => {
      void navigate({ to, search: { mock: undefined } })
    },
  })

  const canSubmitForm = useMemo(() => {
    if (profileMember == null) {
      return false
    }
    if (form.reasonType == null || form.reasonId == null) {
      return false
    }
    if (
      isWithdrawalRegisterOtherReason(form.reasonId) &&
      !form.otherReasonDetail.trim()
    ) {
      return false
    }
    return (
      findWithdrawalRegisterReason(form.reasonId)?.reasonType ===
      form.reasonType
    )
  }, [form.otherReasonDetail, form.reasonId, form.reasonType, profileMember])

  const patchForm = (patch: Partial<WithdrawalRegisterFormState>) => {
    setForm((current) => ({ ...current, ...patch }))
  }

  const handleCancel = () => {
    requestLeave("/activity/withdrawal")
  }

  const handleSubmit = () => {
    if (profileMember == null) {
      return
    }
    if (!canSubmitForm) {
      setShowReasonError(true)
      return
    }
    setIsSubmitting(true)
    void (async () => {
      try {
        // TODO: 탈부 등록 API 연동 — 실패 시 catch에서 failure toast
        await new Promise((resolve) => {
          setTimeout(resolve, 400)
        })
        allowLeave()
        await navigate({
          state: buildWithdrawalLocationState({
            registerSuccessToast: formatWithdrawalRegisterSuccessToastMessage(
              profileMember.name,
              profileMember.nickname,
            ),
          }),
          search: { mock: undefined },
          to: "/activity/withdrawal",
        })
      } catch {
        showWithdrawalRegisterFailureToast(toast)
      } finally {
        setIsSubmitting(false)
      }
    })()
  }

  if (isPreselectedMember && profileMember == null) {
    return (
      <section className="flex flex-col gap-(--umc-spacing-gap-20) pl-(--umc-spacing-padding-12)">
        <p className="text-body-3-regular text-neutral-medium-600">
          구성원을 찾을 수 없어요
        </p>
      </section>
    )
  }

  return (
    <section className="flex min-h-full w-full flex-col gap-(--umc-spacing-gap-32) pl-(--umc-spacing-padding-12)">
      <div className="flex min-w-0 flex-col gap-(--umc-spacing-gap-12)">
        <h1 className="text-heading-2-semibold text-neutral-default-900">
          탈부 등록하기
        </h1>
      </div>

      <div className="flex w-full items-start gap-(--umc-spacing-gap-32)">
        <div className="flex min-w-0 flex-1 flex-col gap-(--umc-spacing-gap-32)">
          {isPreselectedMember && profileMember != null ? (
            <WithdrawalRegisterProfileCard member={profileMember} />
          ) : (
            <WithdrawalRegisterTargetSection
              onSelectMember={setPickedMember}
              selectedMember={pickedMember}
            />
          )}
          <WithdrawalRegisterInfoSection
            form={form}
            onChange={patchForm}
            showReasonError={showReasonError}
          />
          <WithdrawalRegisterEvidenceSection form={form} onChange={patchForm} />
          <WithdrawalRegisterServiceNotice
            message={
              <>
                등록하면 바로 탈부 확정돼요. 사유는 집계용이라 건강 · 가정 사정
                같은 자세한 내용은 적지 않아요
              </>
            }
          />
        </div>

        <WithdrawalRegisterSummaryPanel
          canSubmit={canSubmitForm}
          form={form}
          isSubmitting={isSubmitting}
          member={profileMember}
          onCancel={handleCancel}
          onSubmit={handleSubmit}
        />
      </div>

      <WithdrawalRegisterDiscardDialog
        onConfirm={confirmLeave}
        onDismiss={dismissLeaveDialog}
        open={leaveDialogOpen}
      />
    </section>
  )
}
