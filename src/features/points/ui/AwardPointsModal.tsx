import {
  AddIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  SubtractionIcon,
} from "@umc-product/icons"
import {
  BottomSheetActions,
  Checkbox,
  Dialog,
  Dimmed,
  Field,
  FieldControl,
  Panel,
  PanelCloseButton,
  Tab,
  TabList,
  Tabs,
  Tag,
  TextButton,
} from "@umc-product/react"
import { useEffect, useMemo, useState } from "react"
import { createPortal } from "react-dom"

import { cn } from "@/shared/lib/cn"

import { getPartLabel } from "../model/member-labels"
import {
  AWARD_MODAL_TITLE,
  formatAwardScoreLabel,
  formatOtherScoreCaption,
  formatTypeListScore,
  getPointTypeOptions,
  getTypeListLabel,
  REASON_MAX_LENGTH,
  toSignedOtherScore,
} from "../model/point-types"

import type { AwardPointOutcome } from "../model/mock-award-point"
import type {
  OtherPointKind,
  PointAwardTab,
  PointTypeOption,
} from "../model/point-types"
import type { PointsMember } from "../model/types"

type AwardPayload = {
  tab: PointAwardTab
  typeLabel: string
  score: number
  reason: string
}

type AwardError = Exclude<AwardPointOutcome, "success">

type AwardPointsModalProps = {
  open: boolean
  member: PointsMember
  initialTab?: PointAwardTab
  onOpenChange: (open: boolean) => void
  onSubmit: (payload: AwardPayload) => Promise<AwardPointOutcome>
}

function getAwardErrorMessage(error: AwardError, tab: PointAwardTab): string {
  if (error === "network_error") {
    return "점수를 부여하지 못했어요. 다시 시도해 주세요"
  }
  if (tab === "reward") {
    return "상점을 부여할 권한이 없는 구성원이에요"
  }
  if (tab === "penalty") {
    return "벌점을 부여할 권한이 없는 구성원이에요"
  }
  return "상벌점을 부여할 권한이 없는 구성원이에요"
}

/**
 * Figma Web/Panel (795:16342) — DS `Panel` + `BottomSheetActions`.
 * 짧은 이탈 확인은 `Dialog`.
 */
export function AwardPointsModal({
  open,
  member,
  initialTab = "reward",
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
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<AwardError | null>(null)

  useEffect(() => {
    if (!open) {
      setDiscardOpen(false)
      setSubmitting(false)
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
    setSubmitting(false)
    setSubmitError(null)
  }, [open, initialTab])

  useEffect(() => {
    if (!discardOpen) {
      return
    }
    document.body.classList.add("award-discard-open")
    return () => {
      document.body.classList.remove("award-discard-open")
    }
  }, [discardOpen])

  const typeOptions = useMemo(
    () => (tab === "other" ? [] : getPointTypeOptions(tab, member.role)),
    [member.role, tab],
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

  const reasonLength = reason.length
  const reasonAtMax = reasonLength >= REASON_MAX_LENGTH
  const isDirty =
    reason.trim() !== "" ||
    selectedTypeId !== null ||
    otherKind !== null ||
    otherMagnitude !== null

  const memberMetaParts = [
    `${member.name} / ${member.nickname}`,
    member.schoolLabel,
    getPartLabel(member.part),
  ]

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

  const handleSubmit = async () => {
    if (submitting || !canSubmit || score === null) {
      return
    }
    const trimmedReason = reason.trim()
    if (!trimmedReason) {
      setReasonInvalid(true)
      return
    }
    setSubmitting(true)
    setSubmitError(null)
    const outcome = await onSubmit({
      tab,
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
    setSubmitting(false)
  }

  const confirmDiscard = () => {
    setDiscardOpen(false)
    onOpenChange(false)
  }

  const scoreStepperEnabled = otherKind !== null && !submitting
  const scoreDisplay =
    otherKind === null || otherMagnitude === null
      ? "-"
      : otherKind === "penalty"
        ? `-${otherMagnitude}`
        : `+${otherMagnitude}`

  const errorBanner = submitError ? (
    <div
      className="flex min-h-11 w-full items-center gap-(--umc-spacing-gap-8) rounded-(--umc-radius-14) bg-[var(--umc-toast-error-bg,#fed7d7)] py-(--umc-spacing-padding-12) pr-(--umc-spacing-padding-16) pl-[14px] shadow-[0_4px_16px_rgba(64,68,67,0.16)]"
      role="alert"
    >
      <CheckCircleIcon
        aria-hidden
        className="shrink-0 text-[var(--umc-color-icon-error,#dc3d3d)]"
        size={24}
        weight="fill"
      />
      <p className="text-label-3-medium min-w-0 flex-1 text-[var(--umc-color-red-700,#a60303)]">
        {getAwardErrorMessage(submitError, tab)}
      </p>
    </div>
  ) : null

  /*
   * Figma Text Field/Box (795:16309):
   * 기본 2줄 · 최대 3줄 · 카운터는 박스 하단(회색 유지)
   * 200자 도달 시 label/box/caption error
   */
  const reasonField = (
    <Field
      caption={
        !reasonInvalid && reasonAtMax
          ? "최대 200자까지 입력할 수 있어요"
          : undefined
      }
      className="umc-text-area-field"
      errorMessage={reasonInvalid ? "사유를 입력해 주세요" : undefined}
      invalid={reasonInvalid || reasonAtMax}
      label="사유"
      required
    >
      <div
        className={cn(
          "umc-text-area justify-between",
          "[--umc-text-area-min-height:calc(var(--umc-typography-label-3-medium-font-size)*1.4*3+1.5em+var(--umc-text-area-padding-block)*2)]",
        )}
        data-invalid={reasonInvalid || reasonAtMax ? "" : undefined}
      >
        <div
          className={cn(
            "max-h-[calc(var(--umc-typography-label-3-medium-font-size)*1.4*3)] min-h-[calc(var(--umc-typography-label-3-medium-font-size)*1.4*2)] w-full shrink-0 overflow-y-auto",
            "[&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar]:w-1.5",
            "[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#adadad]",
            "[&::-webkit-scrollbar-track]:bg-transparent",
            "[&::-webkit-scrollbar-button]:hidden [&::-webkit-scrollbar-button]:h-0 [&::-webkit-scrollbar-button]:w-0",
          )}
        >
          <FieldControl
            maxLength={REASON_MAX_LENGTH}
            onChange={(event) => {
              setReason(event.target.value)
              if (event.target.value.trim()) {
                setReasonInvalid(false)
              }
            }}
            placeholder="사유를 입력하세요"
            required
            value={reason}
            render={(controlProps) => (
              <textarea
                {...controlProps}
                className="umc-text-area__input [field-sizing:content] overflow-hidden"
                rows={2}
              />
            )}
          />
        </div>
        <span aria-hidden className="umc-text-area__counter shrink-0">
          {reasonLength}/{REASON_MAX_LENGTH}
        </span>
      </div>
    </Field>
  )

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
            <div className="bg-fill-neutral-disabled flex min-h-12 items-center gap-(--umc-spacing-gap-16) overflow-hidden rounded-(--umc-radius-14) pr-2 pl-(--umc-spacing-padding-16)">
              <span className="text-body-1-medium text-neutral-weak-500 shrink-0">
                대상
              </span>
              <p className="text-body-1-medium text-teal-grey-800 flex min-w-0 flex-1 items-center gap-(--umc-spacing-gap-12) overflow-hidden">
                {memberMetaParts.map((part, index) => (
                  <span
                    className="flex shrink-0 items-center gap-(--umc-spacing-gap-12)"
                    key={part}
                  >
                    {index > 0 ? (
                      <span
                        aria-hidden
                        className="text-body-3-regular text-teal-grey-400"
                      >
                        |
                      </span>
                    ) : null}
                    <span className="whitespace-nowrap">{part}</span>
                  </span>
                ))}
              </p>
            </div>

            <Tabs onValueChange={handleTabChange} value={tab}>
              <TabList aria-label="상벌점 구분">
                <Tab value="reward">상점</Tab>
                <Tab value="penalty">벌점</Tab>
                <Tab value="other">기타</Tab>
              </TabList>
            </Tabs>

            {tab === "other" ? (
              <>
                <div className="flex flex-col gap-(--umc-spacing-gap-12)">
                  <p className="text-label-4-medium text-neutral-medium-600 flex items-center gap-px px-1">
                    <span>구분</span>
                    <span className="text-error">*</span>
                  </p>
                  <div className="flex flex-col gap-(--umc-spacing-gap-16)">
                    <div className="flex items-center gap-(--umc-spacing-gap-8)">
                      <Checkbox
                        checked={otherKind === "reward"}
                        color={otherKind === "reward" ? "brand" : "neutral"}
                        disabled={submitting}
                        labelPlacement="end"
                        onCheckedChange={(checked) => {
                          handleSelectOtherKind("reward", checked)
                        }}
                        size="lg"
                      >
                        상점
                      </Checkbox>
                      <span className="text-body-3-regular text-neutral-medium-600">
                        점수가 더해져요
                      </span>
                    </div>
                    <div className="flex items-center gap-(--umc-spacing-gap-8)">
                      <Checkbox
                        checked={otherKind === "penalty"}
                        color={otherKind === "penalty" ? "brand" : "neutral"}
                        disabled={submitting}
                        labelPlacement="end"
                        onCheckedChange={(checked) => {
                          handleSelectOtherKind("penalty", checked)
                        }}
                        size="lg"
                      >
                        벌점
                      </Checkbox>
                      <span className="text-body-3-regular text-neutral-medium-600">
                        점수가 깎여요
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-(--umc-spacing-gap-12)">
                  <p className="text-label-4-medium text-neutral-medium-600 flex items-center gap-px px-1">
                    <span>점수</span>
                    <span className="text-error">*</span>
                  </p>
                  <div className="flex flex-col gap-(--umc-spacing-gap-8)">
                    <div className="flex items-center gap-(--umc-spacing-gap-8)">
                      <button
                        aria-label="점수 감소"
                        className={cn(
                          "flex size-11 shrink-0 items-center justify-center rounded-(--umc-radius-8) border bg-white",
                          scoreStepperEnabled && otherMagnitude !== null
                            ? "border-neutral-weak-200 text-neutral-strong-800"
                            : "border-neutral-disabled text-neutral-weak-500",
                        )}
                        disabled={
                          !scoreStepperEnabled || otherMagnitude === null
                        }
                        onClick={handleDecrementScore}
                        type="button"
                      >
                        <SubtractionIcon aria-hidden size={24} weight="fill" />
                      </button>
                      <div className="bg-fill-neutral-weak-75 flex h-11 min-w-0 flex-1 items-center justify-center rounded-(--umc-radius-12) p-1">
                        <span
                          className={cn(
                            "text-heading-2-semibold w-full truncate text-center",
                            otherMagnitude === null || otherKind === null
                              ? "text-neutral-weak-500"
                              : otherKind === "penalty"
                                ? "text-error"
                                : "text-brand-default-600",
                          )}
                        >
                          {scoreDisplay}
                        </span>
                      </div>
                      <button
                        aria-label="점수 증가"
                        className={cn(
                          "flex size-11 shrink-0 items-center justify-center rounded-(--umc-radius-8) border bg-white",
                          scoreStepperEnabled
                            ? "border-neutral-weak-200 text-neutral-strong-800"
                            : "border-neutral-disabled text-neutral-weak-500",
                        )}
                        disabled={!scoreStepperEnabled}
                        onClick={handleIncrementScore}
                        type="button"
                      >
                        <AddIcon aria-hidden size={24} weight="fill" />
                      </button>
                    </div>
                    {otherKind !== null && otherMagnitude !== null ? (
                      <p className="text-body-3-regular text-neutral-weak-500 flex h-6 items-center">
                        {formatOtherScoreCaption(otherKind, otherMagnitude)}
                      </p>
                    ) : null}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-(--umc-spacing-gap-12)">
                <p className="text-label-4-medium text-neutral-medium-600 flex items-center gap-px px-1">
                  <span>{getTypeListLabel(tab)}</span>
                  <span className="text-error">*</span>
                </p>
                <div className="border-neutral-disabled max-h-[191px] overflow-y-auto rounded-(--umc-radius-12) border">
                  {typeOptions.map((option, index) => {
                    const selected = option.id === selectedTypeId
                    const isFirst = index === 0
                    const isLast = index === typeOptions.length - 1
                    return (
                      <button
                        className={cn(
                          "border-neutral-disabled flex h-[39px] w-full items-center justify-between border-b py-(--umc-spacing-padding-8) pr-6 pl-(--umc-spacing-padding-16) text-left last:border-b-0",
                          selected ? "bg-fill-neutral-weak-75" : "bg-white",
                          isFirst && "rounded-t-(--umc-radius-12)",
                          isLast && "rounded-b-(--umc-radius-12)",
                        )}
                        key={option.id}
                        onClick={() => handleSelectType(option)}
                        type="button"
                      >
                        <span className="flex items-center gap-5">
                          <span className="text-label-4-medium w-[120px] text-[#212121]">
                            {option.label}
                          </span>
                          <Tag
                            color={option.score < 0 ? "error" : "brand"}
                            size="sm"
                            variant="weak"
                          >
                            {formatTypeListScore(option.score)}
                          </Tag>
                        </span>
                        <Checkbox
                          aria-label={`${option.label} 선택`}
                          checked={selected}
                          color="brand"
                          onCheckedChange={() => handleSelectType(option)}
                          size="md"
                        />
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-(--umc-spacing-gap-16)">
            {tab !== "other" ? (
              <div className="bg-fill-neutral-disabled flex min-h-12 items-center gap-(--umc-spacing-gap-16) overflow-hidden rounded-(--umc-radius-14) pr-2 pl-(--umc-spacing-padding-16)">
                <span className="text-body-1-medium text-neutral-weak-500 shrink-0">
                  점수
                </span>
                <div className="flex min-w-0 flex-1 items-center justify-between gap-(--umc-spacing-gap-12)">
                  <span
                    className={cn(
                      "text-body-1-semibold",
                      score === null
                        ? "text-neutral-medium-600"
                        : score < 0
                          ? "text-error"
                          : "text-brand-default-600",
                    )}
                  >
                    {score === null ? "0점" : formatAwardScoreLabel(score)}
                  </span>
                  <TextButton
                    color="neutral"
                    onClick={() => handleTabChange("other")}
                    size="xs"
                    trailingIcon={
                      <ChevronRightIcon
                        aria-hidden
                        color="currentColor"
                        size={16}
                      />
                    }
                    type="button"
                  >
                    직접 정하려면 기타 탭
                  </TextButton>
                </div>
              </div>
            ) : null}

            {reasonField}
            {errorBanner}
          </div>
        </div>
      </Panel>

      {/*
        이탈 확인: Panel 딤은 끄고(app.css), Dialog용 Dimmed(medium)만 켠다.
        Dialog 자체 backdrop은 transparent.
      */}
      {discardOpen && typeof document !== "undefined"
        ? createPortal(
            <Dimmed
              aria-hidden="true"
              className="award-discard-dimmed"
              intensity="medium"
            />,
            document.body,
          )
        : null}
      <Dialog
        cancelLabel="계속 작성"
        color="brand"
        confirmLabel="나가기"
        description="지금 나가면 입력한 내용이 모두 사라져요"
        onCancel={() => {
          setDiscardOpen(false)
        }}
        onConfirm={confirmDiscard}
        onOpenChange={(nextOpen) => {
          setDiscardOpen(nextOpen)
        }}
        open={discardOpen}
        title="작성 중인 내용이 있어요"
      />
    </>
  )
}
