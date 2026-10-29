import { Field, FieldControl, TextFieldBoxField } from "@umc-product/react"

import { cn } from "@/shared/lib/cn"

import { NOTICE_CREATE_CONTENT_MAX_LENGTH } from "../../model/notice-create-form"
import { NOTICE_CREATE_LENGTH_COUNTER_CLASS } from "../constants"
import { NoticeCreateContentToolbar } from "./notice-create-content-toolbar"

const BODY_FIELD_MIN_HEIGHT_PX = 214
const BODY_FIELD_MAX_HEIGHT_PX = 640
const BODY_TEXT_MIN_HEIGHT_PX = 140
/** toolbar(32) + divider(1) + gap(16) inside slot */
const BODY_SLOT_CHROME_PX = 49
const BODY_FIELD_VERTICAL_PADDING_PX = 26

type NoticeCreateBodyFieldProps = {
  errorMessage?: string
  invalid: boolean
  onChange: (value: string) => void
  value: string
}

function formatContentCounter(length: number, max: number): string {
  return `${length.toLocaleString("en-US")}/${max.toLocaleString("en-US")}`
}

export function NoticeCreateBodyField({
  errorMessage,
  invalid,
  onChange,
  value,
}: NoticeCreateBodyFieldProps) {
  const contentLength = value.length
  const textAreaMaxHeightPx =
    BODY_FIELD_MAX_HEIGHT_PX -
    BODY_FIELD_VERTICAL_PADDING_PX -
    BODY_SLOT_CHROME_PX

  return (
    <Field
      className="umc-text-area-field w-full"
      errorMessage={errorMessage}
      invalid={invalid}
      label="본문"
      required
    >
      <TextFieldBoxField
        className={cn(
          "relative flex h-auto max-h-[640px] min-h-[214px] flex-col items-stretch",
          "gap-(--umc-spacing-gap-16) pt-3 pr-(--umc-spacing-padding-16) pb-3.5 pl-(--umc-spacing-padding-16)",
        )}
        data-type="custom"
        invalid={invalid}
        size="lg"
        style={{
          maxHeight: BODY_FIELD_MAX_HEIGHT_PX,
          minHeight: BODY_FIELD_MIN_HEIGHT_PX,
        }}
      >
        <div className="flex w-full shrink-0 flex-col gap-(--umc-spacing-gap-8)">
          <NoticeCreateContentToolbar />
          <div
            aria-hidden
            className="border-neutral-weak-200 w-full border-t"
          />
        </div>

        <div className="relative flex min-h-0 w-full flex-1 flex-col pb-7">
          <div
            className={cn(
              "w-full min-w-0 flex-1 overflow-y-auto",
              "[&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar]:w-1.5",
              "[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#adadad]",
              "[&::-webkit-scrollbar-track]:bg-transparent",
              "[&::-webkit-scrollbar-button]:hidden [&::-webkit-scrollbar-button]:h-0 [&::-webkit-scrollbar-button]:w-0",
            )}
            style={{
              maxHeight: textAreaMaxHeightPx,
              minHeight: BODY_TEXT_MIN_HEIGHT_PX,
            }}
          >
            <FieldControl
              onChange={(event) => {
                onChange(event.target.value)
              }}
              required
              value={value}
              render={(controlProps) => (
                <textarea
                  {...controlProps}
                  className="text-label-2-medium text-neutral-default-900 placeholder:text-placeholder [field-sizing:content] min-h-[140px] w-full resize-none border-0 bg-transparent p-0 shadow-none outline-none"
                  maxLength={NOTICE_CREATE_CONTENT_MAX_LENGTH}
                  placeholder="본문을 입력하세요"
                  rows={1}
                />
              )}
            />
          </div>
          <span
            aria-hidden
            className={cn(
              NOTICE_CREATE_LENGTH_COUNTER_CLASS,
              "absolute right-0 bottom-0 text-right",
            )}
          >
            {formatContentCounter(
              contentLength,
              NOTICE_CREATE_CONTENT_MAX_LENGTH,
            )}
          </span>
        </div>
      </TextFieldBoxField>
    </Field>
  )
}
