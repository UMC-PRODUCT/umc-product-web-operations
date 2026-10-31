import { Field, TextArea, TextFieldBoxField } from "@umc-product/react"
import { useCallback, useRef } from "react"

import { cn } from "@/shared/lib/cn"

import {
  applyNoticeContentMarkdownFormat,
  type NoticeContentMarkdownFormat,
} from "../../model/notice-content-markdown"
import { NOTICE_CREATE_CONTENT_MAX_LENGTH } from "../../model/notice-create-form"
import { NoticeCreateContentToolbar } from "./notice-create-content-toolbar"

const BODY_FIELD_MIN_HEIGHT_PX = 214
const BODY_FIELD_MAX_HEIGHT_PX = 640
const BODY_TEXT_MIN_HEIGHT_PX = 140
/** toolbar(32) + divider(1) + gap(16) inside slot */
const BODY_SLOT_CHROME_PX = 49
const BODY_FIELD_VERTICAL_PADDING_PX = 26

const BODY_TEXT_MAX_HEIGHT_PX =
  BODY_FIELD_MAX_HEIGHT_PX -
  BODY_FIELD_VERTICAL_PADDING_PX -
  BODY_SLOT_CHROME_PX

const NESTED_TEXT_AREA_CLASS = cn(
  "flex h-full min-h-0 w-full flex-1 flex-col self-stretch",
  "[&_.umc-field]:h-full",
  "[&_.umc-field__label]:hidden",
  "[&_.umc-field__caption]:hidden",
  "[&_.umc-field]:flex",
  "[&_.umc-field]:min-h-0",
  "[&_.umc-field]:flex-1",
  "[&_.umc-field]:flex-col",
  "[&_.umc-field]:gap-0",
  "[&_.umc-text-area]:flex",
  "[&_.umc-text-area]:min-h-0",
  "[&_.umc-text-area]:flex-1",
  "[&_.umc-text-area]:flex-col",
  "[&_.umc-text-area]:rounded-none",
  "[&_.umc-text-area]:border-0",
  "[&_.umc-text-area]:bg-transparent",
  "[&_.umc-text-area]:p-0",
  "[&_.umc-text-area]:shadow-none",
  "[&_.umc-text-area]:relative",
  "[&_.umc-text-area]:h-full",
  "[&_.umc-text-area__input]:min-h-0",
  "[&_.umc-text-area__input]:h-full",
  "[&_.umc-text-area__input]:flex-1",
  "[&_.umc-text-area__input]:overflow-y-auto",
  "[&_.umc-text-area__input]:pb-7",
  "[&_.umc-text-area__input]:[field-sizing:fixed]",
  "[&_.umc-text-area__counter]:absolute",
  "[&_.umc-text-area__counter]:right-0",
  "[&_.umc-text-area__counter]:bottom-0",
  `[--umc-text-area-min-height:${BODY_TEXT_MIN_HEIGHT_PX}px]`,
  `[--umc-text-area-max-height:${BODY_TEXT_MAX_HEIGHT_PX}px]`,
)

type NoticeCreateBodyFieldProps = {
  errorMessage?: string
  invalid: boolean
  onChange: (value: string) => void
  value: string
}

export function NoticeCreateBodyField({
  errorMessage,
  invalid,
  onChange,
  value,
}: NoticeCreateBodyFieldProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const applyFormat = useCallback(
    (format: NoticeContentMarkdownFormat) => {
      const textarea = textareaRef.current
      if (!textarea) {
        return
      }

      const result = applyNoticeContentMarkdownFormat(
        value,
        textarea.selectionStart,
        textarea.selectionEnd,
        format,
      )

      if (result.value.length > NOTICE_CREATE_CONTENT_MAX_LENGTH) {
        return
      }

      onChange(result.value)

      requestAnimationFrame(() => {
        textarea.focus()
        textarea.setSelectionRange(result.selectionStart, result.selectionEnd)
      })
    },
    [onChange, value],
  )

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
          "relative flex max-h-[640px] min-h-[214px] flex-col items-stretch",
          "gap-(--umc-spacing-gap-16) pt-(--umc-spacing-padding-12) pr-(--umc-spacing-padding-16) pb-3.5 pl-(--umc-spacing-padding-16)",
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
          <NoticeCreateContentToolbar onFormat={applyFormat} />
          <div
            aria-hidden
            className="border-neutral-weak-200 w-full border-t"
          />
        </div>

        <div
          className="relative flex min-h-0 w-full flex-1 flex-col"
          style={{ minHeight: BODY_TEXT_MIN_HEIGHT_PX }}
        >
          <TextArea
            aria-label="본문"
            className={NESTED_TEXT_AREA_CLASS}
            maxLength={NOTICE_CREATE_CONTENT_MAX_LENGTH}
            onChange={(event) => {
              onChange(event.target.value)
            }}
            placeholder="본문을 입력하세요"
            ref={textareaRef}
            value={value}
          />
        </div>
      </TextFieldBoxField>
    </Field>
  )
}
