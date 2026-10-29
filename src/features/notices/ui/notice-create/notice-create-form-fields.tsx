import { AddIcon, PersonIcon, RemoveCircleIcon } from "@umc-product/icons"
import {
  Button,
  Checkbox,
  OptionButtonGroup,
  Select,
  TextFieldBox,
} from "@umc-product/react"
import { type ReactNode, useMemo } from "react"

import { cn } from "@/shared/lib/cn"

import {
  NOTICE_CREATE_STAFF_SCOPE_OPTIONS,
  NOTICE_CREATE_TITLE_MAX_LENGTH,
  type NoticeCreateFormState,
  type NoticeCreateGisuMode,
  type NoticeCreateOrgMode,
  type NoticeCreateStaffScope,
} from "../../model/notice-create-form"
import { getNoticeCreateLinkDraftValidation } from "../../model/notice-create-link"
import { NOTICE_CREATE_LENGTH_COUNTER_CLASS } from "../constants"
import { NoticeCreateBodyField } from "./notice-create-body-field"
import { NoticeCreateImageGallery } from "./notice-create-image-gallery"
import { NoticeCreateSection } from "./notice-create-section"

import type { NoticeCreatePartOption } from "../../model/notice-create-part-options"

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
  "[&_.umc-text-field-box-field__unit]:text-label-2-medium",
  "[&_.umc-text-field-box-field__unit]:text-placeholder",
)

function formatNoticeCreateTitleCounter(length: number, max: number): string {
  if (length >= max) {
    return `${length}/${max}`
  }
  return `${length} / ${max}`
}

function NoticeCreateLinkFieldUnit({ children }: { children: ReactNode }) {
  return (
    <span className="flex items-center self-stretch py-(--umc-spacing-padding-8) pe-(--umc-spacing-padding-8)">
      {children}
    </span>
  )
}

const NOTICE_CREATE_GISU_MODE_OPTIONS: {
  value: NoticeCreateGisuMode
  label: string
}[] = [
  { value: "all", label: "전체 기수" },
  { value: "specific", label: "특정 기수" },
]

const NOTICE_CREATE_ORG_MODE_OPTIONS: {
  value: NoticeCreateOrgMode
  label: string
}[] = [
  { value: "umc", label: "UMC 전체" },
  { value: "chapter", label: "지부" },
  { value: "school", label: "학교" },
]

type OrganizationOptions = {
  chapters: { id: number; name: string }[]
  gisuOptions: { value: string; label: string }[]
  schools: { schoolId: number; schoolName: string }[]
}

type NoticeFormMode = "create" | "edit"

type NoticeCreateFormFieldsProps = {
  form: NoticeCreateFormState
  isOrganizationLoading: boolean
  mode?: NoticeFormMode
  onChange: (patch: Partial<NoticeCreateFormState>) => void
  onImageUploadReject?: () => void
  organization: OrganizationOptions
  partOptions: NoticeCreatePartOption[]
  showRequiredFieldErrors: boolean
  targetSummaryLine: string
}

function FormRow({
  children,
  label,
  labelWidth = "w-[60px]",
}: {
  children: ReactNode
  label: string
  labelWidth?: string
}) {
  return (
    <div className="flex w-full items-start gap-(--umc-spacing-gap-8)">
      <p
        className={`text-body-1-regular text-neutral-strong-800 shrink-0 pt-3 ${labelWidth}`}
      >
        {label}
      </p>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}

export function NoticeCreateFormFields({
  form,
  isOrganizationLoading,
  mode = "create",
  onChange,
  onImageUploadReject,
  organization,
  partOptions,
  showRequiredFieldErrors,
  targetSummaryLine,
}: NoticeCreateFormFieldsProps) {
  const isEditMode = mode === "edit"
  const lockAudienceAndTarget = isEditMode
  const titleInvalid = showRequiredFieldErrors && !form.title.trim()
  const titleLength = form.title.length
  const titleAtMax = titleLength >= NOTICE_CREATE_TITLE_MAX_LENGTH
  const contentInvalid = showRequiredFieldErrors && !form.content.trim()
  const chapterSelectOptions = organization.chapters.map((chapter) => ({
    label: chapter.name,
    value: String(chapter.id),
  }))
  const schoolSelectOptions = organization.schools.map((school) => ({
    label: school.schoolName,
    value: String(school.schoolId),
  }))

  const orgModeOptions = useMemo(() => {
    const disableChapterAndSchool = form.gisuMode === "all"

    return NOTICE_CREATE_ORG_MODE_OPTIONS.map((option) => ({
      ...option,
      disabled:
        disableChapterAndSchool &&
        (option.value === "chapter" || option.value === "school"),
    }))
  }, [form.gisuMode])

  const togglePart = (part: NoticeCreatePartOption["value"]) => {
    onChange({
      parts: form.parts.includes(part)
        ? form.parts.filter((item) => item !== part)
        : [...form.parts, part],
    })
  }

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
    <div className="flex flex-col gap-(--umc-spacing-gap-24)">
      <NoticeCreateSection locked={lockAudienceAndTarget} title="공지 종류">
        <div className="flex flex-col gap-(--umc-spacing-gap-16)">
          <div className="flex items-center gap-(--umc-spacing-gap-8)">
            <Checkbox
              checked={form.challengerEnabled}
              color={form.challengerEnabled ? "brand" : "neutral"}
              labelPlacement="end"
              onCheckedChange={(checked) => {
                const challengerEnabled = checked === true
                if (
                  challengerEnabled &&
                  form.gisuMode === "all" &&
                  form.orgMode !== "umc"
                ) {
                  onChange({
                    chapterId: null,
                    challengerEnabled,
                    orgMode: "umc",
                    schoolId: null,
                  })
                  return
                }
                onChange({ challengerEnabled })
              }}
              size="lg"
            >
              챌린저 대상 공지
            </Checkbox>
            <span className="text-body-3-regular text-neutral-medium-600">
              선택한 대상 챌린저의 앱 공지 목록에 게시돼요
            </span>
          </div>
          <div className="flex items-center gap-(--umc-spacing-gap-8)">
            <Checkbox
              checked={form.staffEnabled}
              color={form.staffEnabled ? "brand" : "neutral"}
              labelPlacement="end"
              onCheckedChange={(checked) => {
                onChange({ staffEnabled: checked === true })
              }}
              size="lg"
            >
              운영진 대상 공지
            </Checkbox>
            <span className="text-body-3-regular text-neutral-medium-600">
              운영진에게만 보여요. 받는 운영진 범위도 고를 수 있어요
            </span>
          </div>
        </div>

        {form.staffEnabled ? (
          <>
            <div className="border-neutral-disabled border-t" />
            <div className="flex items-center gap-10">
              <p className="text-body-1-regular text-neutral-strong-800 shrink-0">
                운영진 범위
              </p>
              <OptionButtonGroup
                aria-label="운영진 범위"
                onValueChange={(value) => {
                  onChange({ staffScope: value as NoticeCreateStaffScope })
                }}
                options={NOTICE_CREATE_STAFF_SCOPE_OPTIONS}
                size="sm"
                type="single"
                value={form.staffScope}
                variant="weak"
              />
            </div>
          </>
        ) : null}
      </NoticeCreateSection>

      <NoticeCreateSection locked={lockAudienceAndTarget} title="대상">
        <div className="flex flex-col gap-(--umc-spacing-gap-24)">
          <div className="flex items-center gap-(--umc-spacing-gap-20)">
            <p className="text-body-1-regular text-neutral-strong-800 w-[40px] shrink-0">
              기수
            </p>
            <OptionButtonGroup
              aria-label="기수 범위"
              onValueChange={(value) => {
                const gisuMode = value as NoticeCreateGisuMode
                if (gisuMode === "all") {
                  onChange({
                    chapterId: null,
                    gisuMode,
                    orgMode: "umc",
                    schoolId: null,
                  })
                  return
                }
                onChange({ gisuMode })
              }}
              options={NOTICE_CREATE_GISU_MODE_OPTIONS}
              size="sm"
              type="single"
              value={form.gisuMode}
              variant="weak"
            />
            {form.gisuMode === "specific" ? (
              <Select
                aria-label="대상 기수"
                className="w-[82px] shrink-0"
                disabled={isOrganizationLoading}
                onValueChange={(value) => {
                  onChange({
                    targetGisuId: value ? Number(value) : null,
                  })
                }}
                options={organization.gisuOptions}
                placeholder="기수"
                size="md"
                value={
                  form.targetGisuId != null
                    ? String(form.targetGisuId)
                    : undefined
                }
                variant="filter"
              />
            ) : null}
          </div>

          <div className="flex items-center gap-(--umc-spacing-gap-20)">
            <p className="text-body-1-regular text-neutral-strong-800 w-[40px] shrink-0">
              조직
            </p>
            <OptionButtonGroup
              aria-label="조직 범위"
              onValueChange={(value) => {
                onChange({
                  orgMode: value as NoticeCreateOrgMode,
                  chapterId: null,
                  schoolId: null,
                })
              }}
              options={orgModeOptions}
              size="sm"
              type="single"
              value={form.orgMode}
              variant="weak"
            />
            {form.orgMode === "chapter" ? (
              <Select
                aria-label="지부"
                className="w-[140px] shrink-0"
                disabled={isOrganizationLoading}
                onValueChange={(value) => {
                  onChange({
                    chapterId: value ? Number(value) : null,
                  })
                }}
                options={chapterSelectOptions}
                placeholder="지부"
                size="md"
                value={
                  form.chapterId != null ? String(form.chapterId) : undefined
                }
                variant="filter"
              />
            ) : null}
            {form.orgMode === "school" ? (
              <Select
                aria-label="학교"
                className="w-[140px] shrink-0"
                disabled={isOrganizationLoading}
                onValueChange={(value) => {
                  onChange({
                    schoolId: value ? Number(value) : null,
                  })
                }}
                options={schoolSelectOptions}
                placeholder="학교"
                size="md"
                value={
                  form.schoolId != null ? String(form.schoolId) : undefined
                }
                variant="filter"
              />
            ) : null}
          </div>

          <div className="flex flex-wrap items-start gap-(--umc-spacing-gap-20)">
            <p className="text-body-1-regular text-neutral-strong-800 w-[40px] shrink-0 pt-1">
              파트
            </p>
            <div className="flex flex-wrap gap-x-(--umc-spacing-gap-20) gap-y-(--umc-spacing-gap-12)">
              {partOptions.map((part) => (
                <Checkbox
                  checked={form.parts.includes(part.value)}
                  color={form.parts.includes(part.value) ? "brand" : "neutral"}
                  key={part.value}
                  labelPlacement="end"
                  onCheckedChange={() => {
                    togglePart(part.value)
                  }}
                  size="lg"
                >
                  {part.label}
                </Checkbox>
              ))}
            </div>
          </div>

          <div className="bg-background-neutral-medium border-neutral-medium-300 flex w-full items-center gap-(--umc-spacing-gap-20) rounded-(--umc-radius-6) border-[0.7px] px-(--umc-spacing-padding-16) py-(--umc-spacing-padding-8)">
            <div className="flex shrink-0 items-center gap-1">
              <PersonIcon
                aria-hidden
                className="text-icon-neutral-medium-500"
                weight="regular"
                size={16}
              />
              <span className="text-body-3-regular text-neutral-weak-500">
                받는 사람
              </span>
            </div>
            {targetSummaryLine ? (
              <p className="text-body-3-semibold text-neutral-strong-800 min-w-0">
                {targetSummaryLine}
              </p>
            ) : null}
          </div>
        </div>
      </NoticeCreateSection>

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

          <hr className="border-neutral-weak-200 m-0 w-full shrink-0 border-0 border-t" />

          <div className="flex flex-col gap-(--umc-spacing-gap-20)">
            <FormRow label="이미지">
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
            </FormRow>

            <FormRow label="링크">
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
                          <RemoveCircleIcon
                            aria-hidden
                            size={24}
                            weight="fill"
                          />
                        </button>
                      </NoticeCreateLinkFieldUnit>
                    }
                    value={link}
                  />
                ))}
              </div>
            </FormRow>

            <FormRow label="투표">
              <Button
                leadingIcon={<AddIcon aria-hidden size={16} />}
                size="md"
                type="button"
                variant="fill"
                color="white"
              >
                투표 추가
              </Button>
            </FormRow>
          </div>
        </div>
      </NoticeCreateSection>

      <NoticeCreateSection title="공지 설정">
        <div className="flex flex-col gap-(--umc-spacing-gap-20)">
          <Checkbox
            checked={form.mustRead}
            color={form.mustRead ? "brand" : "neutral"}
            labelPlacement="end"
            onCheckedChange={(checked) => {
              onChange({ mustRead: checked === true })
            }}
            size="lg"
          >
            필독
          </Checkbox>
          <div
            className={cn(
              "flex items-center gap-(--umc-spacing-gap-8)",
              isEditMode && "pointer-events-none opacity-60 select-none",
            )}
          >
            <Checkbox
              checked={form.sendNotification}
              color={form.sendNotification ? "brand" : "neutral"}
              labelPlacement="end"
              readOnly={isEditMode}
              onCheckedChange={(checked) => {
                onChange({ sendNotification: checked === true })
              }}
              size="lg"
            >
              알림 발송
            </Checkbox>
            <span className="text-body-3-regular text-neutral-medium-600">
              게시 즉시 대상자에게 푸시돼요
            </span>
          </div>
        </div>
      </NoticeCreateSection>
    </div>
  )
}
