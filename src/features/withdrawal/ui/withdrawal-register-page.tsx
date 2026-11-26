import { useQuery } from "@tanstack/react-query"
import { useNavigate, useRouterState } from "@tanstack/react-router"
import { useToast } from "@umc-product/react"
import { useMemo, useState } from "react"

import { useSelectedGisu } from "@/entities/gisu"
import { useFormLeaveConfirm } from "@/shared/lib/use-form-leave-confirm"

import { loadWithdrawalRegisterTargetByRouteId } from "../model/load-withdrawal-register-target"
import { submitWithdrawalRegister } from "../model/submit-withdrawal-register"
import {
  buildWithdrawalLocationState,
  parseWithdrawalLocationState,
  recallWithdrawalListView,
} from "../model/withdrawal-location-state"
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

import type { WithdrawalRegisterTarget } from "../model/map-challenger-to-register-target"

type WithdrawalRegisterPageProps = {
  memberId?: string
}

export function WithdrawalRegisterPage({
  memberId,
}: WithdrawalRegisterPageProps) {
  const navigate = useNavigate()
  const toast = useToast()
  const selectedGisu = useSelectedGisu()
  const listSearch = useRouterState({
    select: (state) =>
      parseWithdrawalLocationState(state.location.state).withdrawalListSearch ??
      recallWithdrawalListView(),
  })
  const [form, setForm] = useState<WithdrawalRegisterFormState>(
    INITIAL_WITHDRAWAL_REGISTER_FORM,
  )
  const [showReasonError, setShowReasonError] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pickedTarget, setPickedTarget] =
    useState<WithdrawalRegisterTarget | null>(null)

  const isPreselectedMember = memberId != null

  const preselectedTargetQuery = useQuery({
    queryKey: ["withdrawal", "register-prefill", memberId, selectedGisu.gisuId],
    queryFn: () =>
      loadWithdrawalRegisterTargetByRouteId({
        routeMemberId: memberId!,
        gisuId: selectedGisu.gisuId,
      }),
    enabled: isPreselectedMember && selectedGisu.gisuId != null,
    retry: false,
  })

  const registerTarget = isPreselectedMember
    ? (preselectedTargetQuery.data ?? null)
    : pickedTarget

  const isDirty = useMemo(
    () =>
      isWithdrawalRegisterFormDirty(
        form,
        registerTarget != null,
        isPreselectedMember,
      ),
    [form, isPreselectedMember, registerTarget],
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
      void navigate({
        to,
        search: (previous) => ({ mock: previous.mock }),
        state: buildWithdrawalLocationState(
          listSearch == null ? {} : { withdrawalListSearch: listSearch },
        ),
      })
    },
  })

  const canSubmitForm = useMemo(() => {
    if (registerTarget == null) {
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
  }, [form.otherReasonDetail, form.reasonId, form.reasonType, registerTarget])

  const patchForm = (patch: Partial<WithdrawalRegisterFormState>) => {
    setForm((current) => ({ ...current, ...patch }))
  }

  const handleCancel = () => {
    requestLeave("/activity/withdrawal")
  }

  const handleSubmit = () => {
    if (registerTarget == null) {
      return
    }
    if (!canSubmitForm) {
      setShowReasonError(true)
      return
    }
    setIsSubmitting(true)
    void (async () => {
      try {
        const result = await submitWithdrawalRegister({
          target: registerTarget,
          form,
        })
        if (!result.ok) {
          showWithdrawalRegisterFailureToast(toast)
          return
        }
        allowLeave()
        await navigate({
          state: buildWithdrawalLocationState({
            registerSuccessToast: formatWithdrawalRegisterSuccessToastMessage(
              registerTarget.name,
              registerTarget.nickname,
            ),
            ...(listSearch == null ? {} : { withdrawalListSearch: listSearch }),
          }),
          search: (previous) => ({ mock: previous.mock }),
          to: "/activity/withdrawal",
        })
      } catch {
        showWithdrawalRegisterFailureToast(toast)
      } finally {
        setIsSubmitting(false)
      }
    })()
  }

  if (
    isPreselectedMember &&
    preselectedTargetQuery.isPending &&
    selectedGisu.gisuId != null
  ) {
    return (
      <section className="flex flex-col gap-(--umc-spacing-gap-20) pl-(--umc-spacing-padding-12)">
        <p className="text-body-3-regular text-neutral-medium-600">
          구성원 정보를 불러오는 중이에요
        </p>
      </section>
    )
  }

  if (isPreselectedMember && registerTarget == null) {
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
          {isPreselectedMember && registerTarget != null ? (
            <WithdrawalRegisterProfileCard member={registerTarget} />
          ) : (
            <WithdrawalRegisterTargetSection
              onSelectTarget={setPickedTarget}
              selectedTarget={pickedTarget}
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
          member={registerTarget}
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
