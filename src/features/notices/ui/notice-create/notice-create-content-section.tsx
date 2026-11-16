import { AddIcon, RemoveCircleIcon } from "@umc-product/icons"
import { Button, Divider, TextFieldBox } from "@umc-product/react"
import { type ReactNode, useMemo } from "react"

import { cn } from "@/shared/lib/cn"

import { mapNoticeCreateVoteDraftToPoll } from "../../model/map-notice-create-vote-draft-to-poll"
import {
  NOTICE_CREATE_TITLE_MAX_LENGTH,
  type NoticeCreateFormState,
} from "../../model/notice-create-form"
import { getNoticeCreateLinkDraftValidation } from "../../model/notice-create-link"
import { NOTICE_CREATE_LENGTH_COUNTER_CLASS } from "../constants"
import { NoticeCreateBodyField } from "./notice-create-body-field"
import { NoticeCreateFormRow } from "./notice-create-form-row"
import { NoticeCreateImageGallery } from "./notice-create-image-gallery"
import { NoticeCreateSection } from "./notice-create-section"
import { NoticeFormVoteAttachSection } from "./notice-form-vote-attach-section"

import type { NoticeCreateVoteDraft } from "../../model/notice-create-vote-draft"
import type { NoticePoll } from "../../model/notice-detail.types"
import type { NoticeFormMode } from "./notice-create-form-locks"

/** Figma link row — accessory inset 8px (top / bottom / right) */
const NOTICE_CREATE_LINK_FIELD_CLASS = cn(
  "w-full",
  "[&_.umc-text-field-box-field]:min-h-[52px]",
  "[&_.umc-text-field-box-field]:pe-0",
  "[&_.umc-text-field-box-field__unit]:flex",
  "[&_.umc-text-field-box-field__unit]:items-center",
  "[&_.umc-text-field-box-field__unit]:self-stretch",
  "[&_.umc-text-field-box-field__unit]:p-0",
)

const NOTICE_CREATE_TITLE_FIELD_CLASS = cn(
  "w-full",
  "[&_.umc-text-field-box-field__unit]:ms-[var(--umc-spacing-gap-8,8px)]",
  "[&_.umc-text-field-box-field__input]:pe-[var(--umc-spacing-gap-8,8px)]",
)

function formatNoticeCreateTitleCounter(length: number, max: number): string {
  return `${length}/${max}`
}

function NoticeCreateLinkFieldUnit({ children }: { children: ReactNode }) {
  return (
    <span className="flex items-center self-stretch py-(--umc-spacing-padding-8) pe-(--umc-spacing-padding-8)">
      {children}
    </span>
  )
}

type NoticeCreateContentSectionProps = {
  attachedVoteNoticeId?: string
  attachedVotePoll: NoticePoll | null
  form: NoticeCreateFormState
  mode: NoticeFormMode
  onChange: (patch: Partial<NoticeCreateFormState>) => void
  onImageUploadReject?: () => void
  onVoteAddClick?: () => void
  onVoteDeleteClick?: () => void
  onVoteEditClick?: () => void
  showRequiredFieldErrors: boolean
  voteDraft: NoticeCreateVoteDraft | null
}

/** 내용 (제목 · 본문 · 이미지 · 링크 · 투표) */
export function NoticeCreateContentSection({
  attachedVoteNoticeId,
  attachedVotePoll,
  form,
  mode,
  onChange,
  onImageUploadReject,
  onVoteAddClick,
  onVoteDeleteClick,
  onVoteEditClick,
  showRequiredFieldErrors,
  voteDraft,
}: NoticeCreateContentSectionProps) {
  const createVotePoll = useMemo(
    () =>
      voteDraft != null ? mapNoticeCreateVoteDraftToPoll(voteDraft) : null,
    [voteDraft],
  )
  const displayedVotePoll =
    mode === "edit" ? (attachedVotePoll ?? createVotePoll) : createVotePoll
  const voteAttachSectionMode =
    mode === "edit" && attachedVotePoll != null ? "edit" : "create"
  const isEditMode = mode === "edit"
  const titleInvalid = showRequiredFieldErrors && !form.title.trim()
  const titleLength = form.title.length
  const titleAtMax = titleLength >= NOTICE_CREATE_TITLE_MAX_LENGTH
  const contentInvalid = showRequiredFieldErrors && !form.content.trim()

  const linkDraftValidation = useMemo(
    () => getNoticeCreateLinkDraftValidation(form.linkDraft),
    [form.linkDraft],
  )

  const appendLink = () => {
    const { canAdd, normalizedUrl } = getNoticeCreateLinkDraftValidation(
      form.linkDraft,
    )
    if (!canAdd || !normalizedUrl) {
      return
    }
    onChange({
      linkDraft: "",
      links: [...form.links, normalizedUrl],
    })
  }

  const removeLink = (index: number) => {
    onChange({
      links: form.links.filter((_, linkIndex) => linkIndex !== index),
    })
  }

  const removeImage = (index: number) => {
    onChange({
      imageFiles: form.imageFiles.filter((_, fileIndex) => fileIndex !== index),
    })
  }

  const addImage = (file: File) => {
    if (form.imageFiles.length >= 10) {
      return
    }
    onChange({ imageFiles: [...form.imageFiles, file] })
  }

  return (
    <NoticeCreateSection title="내용">
      <div className="flex flex-col gap-[28px]">
        <div className="flex flex-col gap-(--umc-spacing-gap-20)">
          <TextFieldBox
            className={NOTICE_CREATE_TITLE_FIELD_CLASS}
            clearable={false}
            errorMessage={
              titleInvalid
                ? "제목을 입력해 주세요"
                : titleAtMax
                  ? "최대 255자까지 입력할 수 있어요"
                  : undefined
            }
            invalid={titleInvalid || titleAtMax}
            label="제목"
            maxLength={NOTICE_CREATE_TITLE_MAX_LENGTH}
            onChange={(event) => {
              onChange({ title: event.target.value })
            }}
            placeholder="제목을 입력하세요"
            required
            size="lg"
            unit={
              <span className={NOTICE_CREATE_LENGTH_COUNTER_CLASS}>
                {formatNoticeCreateTitleCounter(
                  titleLength,
                  NOTICE_CREATE_TITLE_MAX_LENGTH,
                )}
              </span>
            }
            value={form.title}
          />

          <NoticeCreateBodyField
            errorMessage={contentInvalid ? "본문을 입력해 주세요" : undefined}
            invalid={contentInvalid}
            onChange={(content) => {
              onChange({ content })
            }}
            value={form.content}
          />
        </div>

        <Divider className="w-full [--umc-divider-color:var(--umc-color-border-neutral-disabled)] [--umc-divider-line-thickness:1px]" />

        <div className="flex flex-col gap-(--umc-spacing-gap-20)">
          <NoticeCreateFormRow label="이미지">
            <NoticeCreateImageGallery
              existingImages={form.existingImages}
              imageFiles={form.imageFiles}
              onAdd={addImage}
              onRemove={removeImage}
              onRemoveExisting={(index) => {
                onChange({
                  existingImages: form.existingImages.filter(
                    (_, imageIndex) => imageIndex !== index,
                  ),
                })
              }}
              onUploadReject={onImageUploadReject}
              showEmptyPlaceholders={!isEditMode}
            />
          </NoticeCreateFormRow>

          <NoticeCreateFormRow label="링크">
            <div className="flex max-w-[710px] flex-col gap-(--umc-spacing-gap-8)">
              <TextFieldBox
                className={NOTICE_CREATE_LINK_FIELD_CLASS}
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
                  <NoticeCreateLinkFieldUnit>
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
                  </NoticeCreateLinkFieldUnit>
                }
                value={form.linkDraft}
              />
              {form.links.map((link, index) => (
                <TextFieldBox
                  className={NOTICE_CREATE_LINK_FIELD_CLASS}
                  clearable={false}
                  key={`${link}-${index}`}
                  readOnly
                  size="lg"
                  unit={
                    <NoticeCreateLinkFieldUnit>
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
                    </NoticeCreateLinkFieldUnit>
                  }
                  value={link}
                />
              ))}
            </div>
          </NoticeCreateFormRow>

          {displayedVotePoll != null ? (
            <NoticeFormVoteAttachSection
              mode={voteAttachSectionMode}
              noticeId={
                mode === "edit"
                  ? (attachedVoteNoticeId ?? "notice-edit-vote")
                  : "notice-create-vote-preview"
              }
              onDeleteClick={() => {
                onVoteDeleteClick?.()
              }}
              onEditClick={
                voteAttachSectionMode === "create"
                  ? () => {
                      onVoteEditClick?.()
                    }
                  : undefined
              }
              poll={displayedVotePoll}
            />
          ) : (
            <NoticeCreateFormRow label="투표">
              <Button
                color="white"
                leadingIcon={<AddIcon aria-hidden size={16} />}
                onClick={onVoteAddClick}
                size="md"
                type="button"
                variant="fill"
              >
                투표 추가
              </Button>
            </NoticeCreateFormRow>
          )}
        </div>
      </div>
    </NoticeCreateSection>
  )
}
