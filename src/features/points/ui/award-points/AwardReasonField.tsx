import { Field, FieldControl } from "@umc-product/react"

import { cn } from "@/shared/lib/cn"

import { REASON_MAX_LENGTH } from "../../model/point-types"

type AwardReasonFieldProps = {
  reason: string
  invalid: boolean
  onChange: (value: string) => void
}

/*
 * Figma Text Field/Box (795:16309):
 * 기본 2줄 · 최대 3줄 · 카운터는 박스 하단(회색 유지)
 * 200자 도달 시 label/box/caption error
 */
export function AwardReasonField({
  reason,
  invalid,
  onChange,
}: AwardReasonFieldProps) {
  const reasonLength = reason.length
  const reasonAtMax = reasonLength >= REASON_MAX_LENGTH

  return (
    <Field
      caption={
        !invalid && reasonAtMax ? "최대 200자까지 입력할 수 있어요" : undefined
      }
      className="umc-text-area-field"
      errorMessage={invalid ? "사유를 입력해 주세요" : undefined}
      invalid={invalid || reasonAtMax}
      label="사유"
      required
    >
      <div
        className={cn(
          "umc-text-area justify-between",
          "[--umc-text-area-min-height:calc(var(--umc-typography-label-3-medium-font-size)*1.4*3+1.5em+var(--umc-text-area-padding-block)*2)]",
        )}
        data-invalid={invalid || reasonAtMax ? "" : undefined}
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
              onChange(event.target.value)
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
}
