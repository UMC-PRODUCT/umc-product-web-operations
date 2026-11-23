import "./withdrawal-register-reason-select-list.css"

import { CheckIcon } from "@umc-product/icons"
import { TextFieldBox } from "@umc-product/react"
import { Fragment } from "react"

import { cn } from "@/shared/lib/cn"
import { TEXT_FIELD_LENGTH_COUNTER_CLASS } from "@/shared/ui/text-field-length-counter"

import { WITHDRAWAL_REGISTER_OTHER_REASON_MAX } from "../model/withdrawal-register-form"
import {
  isWithdrawalRegisterOtherReason,
  type WithdrawalRegisterReasonId,
} from "../model/withdrawal-register-reasons"

import type { SelectOption } from "@umc-product/react"

type WithdrawalRegisterReasonSelectListProps = {
  options: SelectOption<string>[]
  value: string | null
  invalid?: boolean
  otherReasonDetail?: string
  otherReasonInvalid?: boolean
  onOtherReasonDetailChange?: (value: string) => void
  onValueChange: (value: string) => void
}

function ReasonSelectListRow({
  isEdgeFirst,
  isEdgeLast,
  isOther,
  onOtherReasonDetailChange,
  option,
  otherReasonDetail,
  otherReasonInvalid,
  selected,
  onSelect,
}: {
  option: SelectOption<string>
  selected: boolean
  isEdgeFirst: boolean
  isEdgeLast: boolean
  isOther: boolean
  otherReasonDetail: string
  otherReasonInvalid: boolean
  onOtherReasonDetailChange?: (value: string) => void
  onSelect: () => void
}) {
  const rowClassName = cn(
    "umc-dropdown-item w-full text-left",
    isEdgeFirst && "umc-dropdown-item--edge-first",
    isEdgeLast && "umc-dropdown-item--edge-last",
    isOther && selected && "umc-dropdown-item--other-selected",
  )

  if (isOther && selected) {
    const detailLength = otherReasonDetail.length

    return (
      <div
        aria-selected
        className={rowClassName}
        data-layout="default"
        data-selected=""
        data-size="md"
        role="option"
      >
        <div className="flex w-full items-start justify-between">
          <span className="text-label-3-medium text-brand-default-600">
            {option.label}
          </span>
          <span className="umc-dropdown-item__indicator">
            <CheckIcon aria-hidden size={16} weight="fill" />
          </span>
        </div>
        <TextFieldBox
          aria-label="기타 탈부 사유"
          className="w-full"
          clearable={false}
          invalid={otherReasonInvalid}
          maxLength={WITHDRAWAL_REGISTER_OTHER_REASON_MAX}
          onChange={(event) => {
            onOtherReasonDetailChange?.(
              event.target.value.slice(0, WITHDRAWAL_REGISTER_OTHER_REASON_MAX),
            )
          }}
          placeholder="사유를 작성해주세요"
          size="md"
          unit={
            <span className={TEXT_FIELD_LENGTH_COUNTER_CLASS}>
              {`${detailLength}/${WITHDRAWAL_REGISTER_OTHER_REASON_MAX}`}
            </span>
          }
          value={otherReasonDetail}
        />
      </div>
    )
  }

  return (
    <button
      aria-selected={selected}
      className={rowClassName}
      data-layout="default"
      data-selected={selected ? "" : undefined}
      data-size="md"
      onClick={onSelect}
      role="option"
      type="button"
    >
      <span className="umc-dropdown-item__content">
        <span
          className={cn(
            selected
              ? "text-label-3-medium text-neutral-default-900"
              : "text-label-2-regular text-neutral-strong-800",
          )}
        >
          {option.label}
        </span>
        {option.caption != null ? (
          <span className="umc-dropdown-item__caption text-caption-3-regular text-placeholder">
            {option.caption}
          </span>
        ) : null}
      </span>
      {selected ? (
        <span className="umc-dropdown-item__indicator">
          <CheckIcon aria-hidden size={16} weight="fill" />
        </span>
      ) : null}
    </button>
  )
}

export function WithdrawalRegisterReasonSelectList({
  options,
  value,
  invalid = false,
  otherReasonDetail = "",
  otherReasonInvalid = false,
  onOtherReasonDetailChange,
  onValueChange,
}: WithdrawalRegisterReasonSelectListProps) {
  return (
    <div
      className={cn(
        "withdrawal-register-reason-select-list border-neutral-disabled flex w-full max-w-[454px] flex-col overflow-hidden rounded-(--umc-radius-10) border bg-white",
        invalid && "border-error",
      )}
      role="listbox"
    >
      <p className="sr-only">탈부 사유 목록</p>
      {options.map((option, index) => (
        <Fragment key={option.value}>
          {index > 0 ? (
            <div
              aria-hidden
              className="border-neutral-disabled w-full shrink-0 border-t"
            />
          ) : null}
          <ReasonSelectListRow
            isEdgeFirst={index === 0}
            isEdgeLast={index === options.length - 1}
            isOther={isWithdrawalRegisterOtherReason(
              option.value as WithdrawalRegisterReasonId,
            )}
            onOtherReasonDetailChange={onOtherReasonDetailChange}
            onSelect={() => {
              onValueChange(option.value)
            }}
            option={option}
            otherReasonDetail={otherReasonDetail}
            otherReasonInvalid={otherReasonInvalid}
            selected={value === option.value}
          />
        </Fragment>
      ))}
    </div>
  )
}
