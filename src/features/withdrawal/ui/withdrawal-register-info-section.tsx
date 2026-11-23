import { Checkbox } from "@umc-product/react"

import { cn } from "@/shared/lib/cn"

import {
  getWithdrawalRegisterReasonOptions,
  isWithdrawalRegisterOtherReason,
  type WithdrawalRegisterReasonId,
  type WithdrawalRegisterReasonOption,
} from "../model/withdrawal-register-reasons"
import { WithdrawalRegisterReasonSelectList } from "./withdrawal-register-reason-select-list"
import { WithdrawalRegisterSection } from "./withdrawal-register-section"

import type { SelectOption } from "@umc-product/react"

import type { WithdrawalReasonType } from "../model/types"
import type { WithdrawalRegisterFormState } from "../model/withdrawal-register-form"

type WithdrawalRegisterInfoSectionProps = {
  form: WithdrawalRegisterFormState
  onChange: (patch: Partial<WithdrawalRegisterFormState>) => void
  showReasonError?: boolean
}

function SectionFieldLabel({
  hint,
  label,
  required,
}: {
  label: string
  hint?: string
  required?: boolean
}) {
  return (
    <div
      className={cn(
        "flex w-full min-w-0 flex-wrap items-center",
        hint || required
          ? hint && required
            ? "gap-[3px]"
            : "gap-px"
          : "gap-0",
      )}
    >
      <span className="text-neutral-medium-600 text-body-2-medium inline-flex items-center gap-[5px]">
        <span>{label}</span>
        {hint ? (
          <span className="text-body-3-regular text-placeholder">{hint}</span>
        ) : null}
      </span>
      {required ? (
        <span className="text-error text-body-2-medium shrink-0">*</span>
      ) : null}
    </div>
  )
}

function TypeOptionRow({
  caption,
  checked,
  label,
  onChecked,
}: {
  label: string
  caption: string
  checked: boolean
  onChecked: (checked: boolean) => void
}) {
  return (
    <div className="flex items-center gap-(--umc-spacing-gap-8)">
      <Checkbox
        checked={checked}
        color={checked ? "brand" : "neutral"}
        labelPlacement="end"
        onCheckedChange={(value) => {
          onChecked(value === true)
        }}
        size="lg"
      >
        {label}
      </Checkbox>
      <span className="text-body-3-regular text-neutral-medium-600">
        {caption}
      </span>
    </div>
  )
}

function toReasonSelectOptions(
  reasons: readonly WithdrawalRegisterReasonOption[],
): SelectOption<WithdrawalRegisterReasonId>[] {
  return reasons.map((reason) => ({
    value: reason.id,
    label: reason.label,
    caption: reason.caption,
  }))
}

export function WithdrawalRegisterInfoSection({
  form,
  onChange,
  showReasonError = false,
}: WithdrawalRegisterInfoSectionProps) {
  const selectReasonType = (reasonType: WithdrawalReasonType) => {
    onChange({
      reasonType,
      reasonId: null,
      otherReasonDetail: "",
    })
  }

  const clearReasonType = (current: WithdrawalReasonType) => {
    if (form.reasonType === current) {
      onChange({
        reasonType: null,
        reasonId: null,
        otherReasonDetail: "",
      })
    }
  }

  const reasonOptions =
    form.reasonType != null
      ? getWithdrawalRegisterReasonOptions(form.reasonType)
      : []
  const selectOptions = toReasonSelectOptions(reasonOptions)
  const showOtherField = isWithdrawalRegisterOtherReason(form.reasonId)

  return (
    <WithdrawalRegisterSection title="탈부 정보">
      <div className="flex w-full flex-col gap-(--umc-spacing-gap-12)">
        <SectionFieldLabel label="탈부 유형" required />
        <div className="flex flex-col gap-(--umc-spacing-gap-16)">
          <TypeOptionRow
            caption="챌린저가 직접 그만두겠다고 했어요"
            checked={form.reasonType === "voluntary"}
            label="자진 탈부"
            onChecked={(checked) => {
              if (checked) {
                selectReasonType("voluntary")
              } else {
                clearReasonType("voluntary")
              }
            }}
          />
          <TypeOptionRow
            caption="규정에 따라 운영진이 탈부를 결정했어요"
            checked={form.reasonType === "involuntary"}
            label="타의 탈부"
            onChecked={(checked) => {
              if (checked) {
                selectReasonType("involuntary")
              } else {
                clearReasonType("involuntary")
              }
            }}
          />
        </div>
      </div>

      {form.reasonType != null ? (
        <div className="flex w-full flex-col gap-(--umc-spacing-gap-12)">
          <SectionFieldLabel
            hint="목록 중 하나를 선택해주세요"
            label="탈부 사유"
            required
          />
          <WithdrawalRegisterReasonSelectList
            invalid={showReasonError && !form.reasonId}
            onOtherReasonDetailChange={(detail) => {
              onChange({ otherReasonDetail: detail })
            }}
            onValueChange={(value) => {
              onChange({
                reasonId: value as WithdrawalRegisterReasonId,
                ...(value !== form.reasonId &&
                !isWithdrawalRegisterOtherReason(
                  value as WithdrawalRegisterReasonId,
                )
                  ? { otherReasonDetail: "" }
                  : {}),
              })
            }}
            options={selectOptions}
            otherReasonDetail={form.otherReasonDetail}
            otherReasonInvalid={
              showReasonError &&
              showOtherField &&
              !form.otherReasonDetail.trim()
            }
            value={form.reasonId}
          />
        </div>
      ) : null}
    </WithdrawalRegisterSection>
  )
}
