import {
  BottomSheetActions,
  Panel,
  PanelCloseButton,
  Tab,
  TabList,
  Tabs,
} from "@umc-product/react"
import { useEffect, useMemo, useState } from "react"

import {
  AWARD_MODAL_TITLE,
  getPointTypeOptions,
  REASON_MAX_LENGTH,
  toSignedOtherScore,
} from "../model/point-types"
import { AwardDiscardDialog } from "./award-points/AwardDiscardDialog"
import { AwardErrorBanner } from "./award-points/AwardErrorBanner"
import { AwardOtherPointFields } from "./award-points/AwardOtherPointFields"
import { AwardReasonField } from "./award-points/AwardReasonField"
import { AwardScoreSummaryRow } from "./award-points/AwardScoreSummaryRow"
import { AwardTargetRow } from "./award-points/AwardTargetRow"
import { AwardTypeList } from "./award-points/AwardTypeList"

import type { AwardPointOutcome } from "../model/mock-award-point"
import type {
  OtherPointKind,
  PointAwardTab,
  PointTypeOption,
} from "../model/point-types"
import type { PointsMember } from "../model/types"
import type {
  AwardError,
  AwardPayload,
} from "./award-points/award-points-model"

type AwardPointsModalProps = {
  open: boolean
  member: PointsMember
  initialTab?: PointAwardTab
  isSubmitting?: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (payload: AwardPayload) => Promise<AwardPointOutcome>
}

/**
 * Figma Web/Panel (795:16342) — DS `Panel` + `BottomSheetActions`.
 * 짧은 이탈 확인은 `Dialog`.
 */
export function AwardPointsModal({
  open,
  member,
  initialTab = "reward",
  isSubmitting = false,
  onOpenChange,
  onSubmit,
}: AwardPointsModalProps) {
  const [tab, setTab] = useState<PointAwardTab>(initialTab)
  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null)
  const [otherKind, setOtherKind] = useState<OtherPointKind | null>(null)
  const [otherMagnitude, setOtherMagnitude] = useState<number | null>(null)
  const [reason, setReason] = useState("")
  const [reasonInvalid, setReasonInvalid] = useState(false)
  const [discardOpen, setDiscardOpen] = useState(false)
  const [localSubmitting, setLocalSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<AwardError | null>(null)
  const submitting = isSubmitting || localSubmitting

  useEffect(() => {
    if (!open) {
      setDiscardOpen(false)
      setLocalSubmitting(false)
      setSubmitError(null)
      return
    }
    setTab(initialTab)
    setSelectedTypeId(null)
    setOtherKind(null)
    setOtherMagnitude(null)
    setReason("")
    setReasonInvalid(false)
    setDiscardOpen(false)
    setLocalSubmitting(false)
    setSubmitError(null)
  }, [open, initialTab])

  const typeOptions = useMemo(
    () => (tab === "other" ? [] : getPointTypeOptions(tab, member.roleTypes)),
    [member.roleTypes, tab],
  )

  const selectedType = useMemo(
    () => typeOptions.find((item) => item.id === selectedTypeId) ?? null,
    [selectedTypeId, typeOptions],
  )

  useEffect(() => {
    if (
      selectedTypeId !== null &&
      !typeOptions.some((item) => item.id === selectedTypeId)
    ) {
      setSelectedTypeId(null)
    }
  }, [selectedTypeId, typeOptions])

  const otherScore =
    tab === "other" && otherKind !== null && otherMagnitude !== null
      ? toSignedOtherScore(otherKind, otherMagnitude)
      : null

  const score = tab === "other" ? otherScore : (selectedType?.score ?? null)

  const canSubmit =
    tab === "other"
      ? otherKind !== null && otherMagnitude !== null
      : selectedTypeId !== null

  const isDirty =
    reason.trim() !== "" ||
    selectedTypeId !== null ||
    otherKind !== null ||
    otherMagnitude !== null

  const handlePanelOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      onOpenChange(true)
      return
    }
    if (submitting) {
      return
    }
    if (isDirty) {
      setDiscardOpen(true)
      return
    }
    onOpenChange(false)
  }

  const handleTabChange = (value: string) => {
    if (submitting) {
      return
    }
    if (value !== "reward" && value !== "penalty" && value !== "other") {
      return
    }
    setTab(value)
    setSelectedTypeId(null)
    setOtherKind(null)
    setOtherMagnitude(null)
    setReasonInvalid(false)
    setSubmitError(null)
  }

  const handleSelectType = (option: PointTypeOption) => {
    if (submitting) {
      return
    }
    setSelectedTypeId(option.id)
    setReasonInvalid(false)
    setSubmitError(null)
  }

  const handleSelectOtherKind = (kind: OtherPointKind, checked: boolean) => {
    if (submitting) {
      return
    }
    setOtherKind(checked ? kind : null)
    if (!checked) {
      setOtherMagnitude(null)
    }
    setSubmitError(null)
  }

  const handleIncrementScore = () => {
    if (submitting || otherKind === null) {
      return
    }
    setOtherMagnitude((prev) => (prev === null ? 1 : prev + 1))
    setSubmitError(null)
  }

  const handleDecrementScore = () => {
    if (submitting || otherKind === null || otherMagnitude === null) {
      return
    }
    setOtherMagnitude((prev) => {
      if (prev === null || prev <= 1) {
        return null
      }
      return prev - 1
    })
    setSubmitError(null)
  }

  const handleReasonChange = (value: string) => {
    setReason(value)
    if (value.trim()) {
      setReasonInvalid(false)
    }
  }

  const handleSubmit = async () => {
    if (submitting || !canSubmit || score === null) {
      return
    }
    const trimmedReason = reason.trim()
    if (!trimmedReason) {
      setReasonInvalid(true)
      return
    }
    setLocalSubmitting(true)
    setSubmitError(null)
    try {
      const outcome = await onSubmit({
        tab,
        pointType: tab === "other" ? "CUSTOM" : selectedType?.pointType,
        typeLabel:
          tab === "other"
            ? otherKind === "reward"
              ? "기타 상점"
              : "기타 벌점"
            : (selectedType?.label ?? "기타"),
        score,
        reason: trimmedReason.slice(0, REASON_MAX_LENGTH),
      })
      if (outcome === "success") {
        return
      }
      setSubmitError(outcome)
    } finally {
      setLocalSubmitting(false)
    }
  }

  const confirmDiscard = () => {
    setDiscardOpen(false)
    onOpenChange(false)
  }

  return (
    <>
      <Panel
        actions={
          <BottomSheetActions
            layout="emphasis"
            primary={{
              label: submitting ? "부여하는 중..." : "부여하기",
              onClick: () => {
                if (!canSubmit || submitting) {
                  return
                }
                void handleSubmit()
              },
            }}
            secondary={{
              label: "취소",
              onClick: () => {
                handlePanelOpenChange(false)
              },
            }}
          />
        }
        headSlot={<PanelCloseButton />}
        onOpenChange={handlePanelOpenChange}
        open={open}
        title={AWARD_MODAL_TITLE}
      >
        <div className="flex flex-col gap-(--umc-spacing-gap-10) py-(--umc-spacing-padding-20)">
          <div className="flex flex-col gap-(--umc-spacing-gap-16)">
            <AwardTargetRow member={member} />

            <Tabs onValueChange={handleTabChange} value={tab}>
              <TabList aria-label="상벌점 구분">
                <Tab value="reward">상점</Tab>
                <Tab value="penalty">벌점</Tab>
                <Tab value="other">기타</Tab>
              </TabList>
            </Tabs>

            {tab === "other" ? (
              <AwardOtherPointFields
                onDecrement={handleDecrementScore}
                onIncrement={handleIncrementScore}
                onSelectKind={handleSelectOtherKind}
                otherKind={otherKind}
                otherMagnitude={otherMagnitude}
                submitting={submitting}
              />
            ) : (
              <AwardTypeList
                onSelect={handleSelectType}
                options={typeOptions}
                selectedTypeId={selectedTypeId}
                tab={tab}
              />
            )}
          </div>

          <div className="flex flex-col gap-(--umc-spacing-gap-16)">
            {tab !== "other" ? (
              <AwardScoreSummaryRow
                onGoToOtherTab={() => handleTabChange("other")}
                score={score}
              />
            ) : null}

            <AwardReasonField
              invalid={reasonInvalid}
              onChange={handleReasonChange}
              reason={reason}
            />
            {submitError ? (
              <AwardErrorBanner error={submitError} tab={tab} />
            ) : null}
          </div>
        </div>
      </Panel>

      <AwardDiscardDialog
        onConfirm={confirmDiscard}
        onOpenChange={setDiscardOpen}
        open={discardOpen}
      />
    </>
  )
}
