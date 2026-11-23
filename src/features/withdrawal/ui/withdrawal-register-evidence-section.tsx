import { AddIcon, RemoveCircleIcon } from "@umc-product/icons"
import { Button, TextFieldBox } from "@umc-product/react"
import { type ReactNode, useMemo } from "react"

import { cn } from "@/shared/lib/cn"
import { getLinkDraftValidation } from "@/shared/lib/link-draft-validation"
import { FormImageGallery } from "@/shared/ui/form-image-gallery"
import { TEXT_FIELD_LENGTH_COUNTER_CLASS } from "@/shared/ui/text-field-length-counter"

import {
  WITHDRAWAL_REGISTER_IMAGE_MAX,
  WITHDRAWAL_REGISTER_LINK_MAX,
  WITHDRAWAL_REGISTER_MEMO_MAX,
  type WithdrawalRegisterFormState,
} from "../model/withdrawal-register-form"
import {
  WITHDRAWAL_REGISTER_SECTION_BODY_WIDTH_PX,
  WithdrawalRegisterSection,
} from "./withdrawal-register-section"

const WITHDRAWAL_TEXT_FIELD_BOX_UNIT_CLASS = cn(
  "w-full",
  "[&_.umc-text-field-box-field__unit]:ms-[var(--umc-spacing-gap-8,8px)]",
  "[&_.umc-text-field-box-field__input]:pe-[var(--umc-spacing-gap-8,8px)]",
)

const WITHDRAWAL_LINK_FIELD_CLASS = cn(
  "w-full",
  "[&_.umc-text-field-box-field]:min-h-[52px]",
  "[&_.umc-text-field-box-field]:pe-0",
  "[&_.umc-text-field-box-field__unit]:flex",
  "[&_.umc-text-field-box-field__unit]:items-center",
  "[&_.umc-text-field-box-field__unit]:self-stretch",
  "[&_.umc-text-field-box-field__unit]:p-0",
)

const WITHDRAWAL_IMAGE_ADD_DESCRIPTION = (
  <>
    jpg, png 장당 5MB
    <br />
    최대 5장까지
  </>
)

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

function LinkFieldUnit({ children }: { children: ReactNode }) {
  return (
    <span className="flex items-center self-stretch py-(--umc-spacing-padding-8) pe-(--umc-spacing-padding-8)">
      {children}
    </span>
  )
}

type WithdrawalRegisterEvidenceSectionProps = {
  form: WithdrawalRegisterFormState
  onChange: (patch: Partial<WithdrawalRegisterFormState>) => void
}

export function WithdrawalRegisterEvidenceSection({
  form,
  onChange,
}: WithdrawalRegisterEvidenceSectionProps) {
  const linkDraftValidation = useMemo(
    () => getLinkDraftValidation(form.linkDraft),
    [form.linkDraft],
  )

  const canAddMoreLinks = form.links.length < WITHDRAWAL_REGISTER_LINK_MAX

  const appendLink = () => {
    if (!linkDraftValidation.canAdd || !linkDraftValidation.normalizedUrl) {
      return
    }
    if (!canAddMoreLinks) {
      return
    }
    onChange({
      links: [...form.links, linkDraftValidation.normalizedUrl],
      linkDraft: "",
    })
  }

  const removeLink = (index: number) => {
    onChange({
      links: form.links.filter((_, linkIndex) => linkIndex !== index),
    })
  }

  const addImage = (file: File) => {
    if (form.imageFiles.length >= WITHDRAWAL_REGISTER_IMAGE_MAX) {
      return
    }
    onChange({ imageFiles: [...form.imageFiles, file] })
  }

  const removeImage = (index: number) => {
    onChange({
      imageFiles: form.imageFiles.filter((_, fileIndex) => fileIndex !== index),
    })
  }

  const memoLength = form.adminMemo.length

  return (
    <WithdrawalRegisterSection title="근거 자료">
      <div className="flex w-full flex-col gap-(--umc-spacing-gap-12)">
        <SectionFieldLabel
          hint="다른 사람 이름 · 연락처는 가리고 올려 주세요"
          label="사진"
        />
        <FormImageGallery
          addDescription={WITHDRAWAL_IMAGE_ADD_DESCRIPTION}
          imageFiles={form.imageFiles}
          layoutMaxWidthPx={WITHDRAWAL_REGISTER_SECTION_BODY_WIDTH_PX}
          maxImages={WITHDRAWAL_REGISTER_IMAGE_MAX}
          onAdd={addImage}
          onRemove={removeImage}
          showEmptyPlaceholders
        />
      </div>

      <div className="flex w-full flex-col gap-(--umc-spacing-gap-12)">
        <SectionFieldLabel hint="최대 3개까지" label="링크" />
        <div className="flex w-full flex-col gap-(--umc-spacing-gap-4)">
          {canAddMoreLinks ? (
            <TextFieldBox
              className={WITHDRAWAL_LINK_FIELD_CLASS}
              clearable={false}
              errorMessage={linkDraftValidation.errorMessage}
              invalid={Boolean(linkDraftValidation.errorMessage)}
              onChange={(event) => {
                onChange({ linkDraft: event.target.value })
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault()
                  appendLink()
                }
              }}
              placeholder="연결할 링크(URL)를 입력해 주세요"
              size="lg"
              unit={
                <LinkFieldUnit>
                  <Button
                    color="white"
                    disabled={!linkDraftValidation.canAdd}
                    leadingIcon={<AddIcon aria-hidden size={14} />}
                    onClick={appendLink}
                    size="xs"
                    type="button"
                    variant="fill"
                  >
                    링크 추가
                  </Button>
                </LinkFieldUnit>
              }
              value={form.linkDraft}
            />
          ) : null}
          {form.links.map((link, index) => (
            <TextFieldBox
              className={WITHDRAWAL_LINK_FIELD_CLASS}
              clearable={false}
              key={`${link}-${index}`}
              readOnly
              size="lg"
              unit={
                <LinkFieldUnit>
                  <button
                    aria-label="링크 삭제"
                    className="umc-text-field-box-field__clear shrink-0 self-center !py-0"
                    onClick={() => {
                      removeLink(index)
                    }}
                    type="button"
                  >
                    <RemoveCircleIcon aria-hidden size={24} weight="fill" />
                  </button>
                </LinkFieldUnit>
              }
              value={link}
            />
          ))}
        </div>
      </div>

      <TextFieldBox
        className={WITHDRAWAL_TEXT_FIELD_BOX_UNIT_CLASS}
        clearable={false}
        label="메모"
        maxLength={WITHDRAWAL_REGISTER_MEMO_MAX}
        onChange={(event) => {
          onChange({
            adminMemo: event.target.value.slice(
              0,
              WITHDRAWAL_REGISTER_MEMO_MAX,
            ),
          })
        }}
        placeholder="메모를 입력해주세요"
        size="lg"
        unit={
          <span className={TEXT_FIELD_LENGTH_COUNTER_CLASS}>
            {`${memoLength}/${WITHDRAWAL_REGISTER_MEMO_MAX}`}
          </span>
        }
        value={form.adminMemo}
      />
    </WithdrawalRegisterSection>
  )
}
