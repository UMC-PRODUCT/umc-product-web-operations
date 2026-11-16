import { RemoveCircleIcon } from "@umc-product/icons"
import {
  Field,
  FieldControl,
  TextFieldBox,
  TextFieldBoxField,
} from "@umc-product/react"
import {
  type ChangeEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  useRef,
} from "react"

import { cn } from "@/shared/lib/cn"

import {
  composeVoteTimeValue,
  isVoteTimeValueInvalid,
  parseVoteTimeValue,
} from "../../model/notice-create-vote-validation"

export const VOTE_TEXT_FIELD_CLEAR_LABEL = "입력 내용 지우기"

export function VoteTextFieldClearButton({
  ariaLabel,
  onClick,
}: {
  ariaLabel: string
  onClick: () => void
}) {
  return (
    <button
      aria-label={ariaLabel}
      className="umc-text-field-box-field__clear"
      onClick={onClick}
      tabIndex={-1}
      type="button"
    >
      <RemoveCircleIcon size={24} weight="fill" />
    </button>
  )
}

type VoteFilledTextFieldBoxProps = {
  clearAriaLabel?: string
  errorMessage?: string
  invalid?: boolean
  label?: string
  onChange: (value: string) => void
  onClear?: () => void
  placeholder?: string
  required?: boolean
  value: string
}

export function VoteFilledTextFieldBox({
  clearAriaLabel = VOTE_TEXT_FIELD_CLEAR_LABEL,
  errorMessage,
  invalid = false,
  label,
  onChange,
  onClear,
  placeholder,
  required,
  value,
}: VoteFilledTextFieldBoxProps) {
  // 항목 삭제(onClear)가 없으면 DS TextFieldBox 의 기본 지우기 동작과 같다.
  if (onClear == null) {
    return (
      <TextFieldBox
        errorMessage={errorMessage}
        invalid={invalid}
        label={label}
        onChange={(event) => {
          onChange(event.target.value)
        }}
        placeholder={placeholder}
        required={required}
        size="lg"
        value={value}
      />
    )
  }

  return (
    <Field
      errorMessage={errorMessage}
      invalid={invalid}
      label={label}
      required={required}
    >
      <TextFieldBoxField data-type="text" invalid={invalid} size="lg">
        <FieldControl
          className="umc-text-field-box-field__input"
          onChange={(event) => {
            onChange(event.target.value)
          }}
          placeholder={placeholder}
          required={required}
          value={value}
        />
        <VoteTextFieldClearButton
          ariaLabel={clearAriaLabel}
          onClick={onClear}
        />
      </TextFieldBoxField>
    </Field>
  )
}

type VoteTimeFieldBoxProps = {
  invalid?: boolean
  onChange: (value: string) => void
  value: string
}

/** Figma 1192:24490 · HH:mm (고정 `:`) 분할 입력 */
export function VoteTimeFieldBox({
  invalid = false,
  onChange,
  value,
}: VoteTimeFieldBoxProps) {
  const hoursRef = useRef<HTMLInputElement>(null)
  const minutesRef = useRef<HTMLInputElement>(null)
  const { hours, minutes } = parseVoteTimeValue(value)
  const showPlaceholder = hours.length === 0 && minutes.length === 0
  const showInvalid = invalid || isVoteTimeValueInvalid(value)

  const handleHoursChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextHours = event.target.value.replace(/\D/g, "").slice(0, 2)
    onChange(composeVoteTimeValue(nextHours, minutes))
    if (nextHours.length === 2) {
      minutesRef.current?.focus()
      minutesRef.current?.select()
    }
  }

  const handleMinutesChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextMinutes = event.target.value.replace(/\D/g, "").slice(0, 2)
    onChange(composeVoteTimeValue(hours, nextMinutes))
  }

  const handleHoursKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === ":" && minutes.length === 0) {
      event.preventDefault()
      minutesRef.current?.focus()
    }
  }

  const handleMinutesKeyDown = (
    event: ReactKeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Backspace" && minutes.length === 0 && hours.length > 0) {
      event.preventDefault()
      hoursRef.current?.focus()
    }
  }

  return (
    <TextFieldBoxField
      className="relative w-[78px] shrink-0 justify-center"
      invalid={showInvalid}
      size="lg"
    >
      {showPlaceholder ? (
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 flex items-center",
            "text-label-2-medium text-placeholder justify-center",
            "font-variant-numeric tabular-nums",
          )}
        >
          00:00
        </span>
      ) : null}
      <span
        className={cn(
          "relative z-1 inline-grid grid-cols-[2ch_auto_2ch] items-center",
          "justify-items-center whitespace-nowrap tabular-nums",
        )}
      >
        <input
          aria-label="시"
          className={cn(
            "umc-text-field-box-field__input w-full min-w-0 p-0 text-center",
            "font-variant-numeric tabular-nums",
          )}
          inputMode="numeric"
          maxLength={2}
          onChange={handleHoursChange}
          onKeyDown={handleHoursKeyDown}
          ref={hoursRef}
          value={hours}
        />
        <span
          aria-hidden="true"
          className={cn(
            showPlaceholder ? "invisible" : "text-neutral-default-900",
          )}
        >
          :
        </span>
        <input
          aria-label="분"
          className={cn(
            "umc-text-field-box-field__input w-full min-w-0 p-0 text-center",
            "font-variant-numeric tabular-nums",
          )}
          inputMode="numeric"
          maxLength={2}
          onChange={handleMinutesChange}
          onKeyDown={handleMinutesKeyDown}
          ref={minutesRef}
          value={minutes}
        />
      </span>
    </TextFieldBoxField>
  )
}
