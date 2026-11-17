import { PersonIcon } from "@umc-product/icons"
import { Checkbox, OptionButtonGroup, Select } from "@umc-product/react"
import { useMemo } from "react"

import {
  type NoticeCreateFormState,
  type NoticeCreateGisuMode,
  type NoticeCreateOrgMode,
} from "../../model/notice-create-form"
import {
  canNoticeCreateUseChapterOrg,
  canNoticeCreateUsePartSelection,
  canStaffNoticeUseSchoolOrg,
} from "../../model/notice-staff-target-rules"
import { NoticeCreateSection } from "./notice-create-section"

import type { NoticeCreatePartOption } from "../../model/notice-create-part-options"
import type { NoticeCreateFormLocks } from "./notice-create-form-locks"

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

export type NoticeCreateOrganizationOptions = {
  chapters: { id: number; name: string }[]
  gisuOptions: { value: string; label: string }[]
  schools: { schoolId: number; schoolName: string }[]
}

type NoticeCreateTargetSectionProps = {
  form: NoticeCreateFormState
  isOrganizationLoading: boolean
  locks: NoticeCreateFormLocks
  onChange: (patch: Partial<NoticeCreateFormState>) => void
  organization: NoticeCreateOrganizationOptions
  partOptions: NoticeCreatePartOption[]
  /** 교내 파트장·기타 운영진: 챌린저/운영진 공지 시 파트 필수 */
  schoolStaffPartsRequired: boolean
  targetSummaryLine: string
}

/** 대상 (기수 · 조직 · 파트 · 받는 사람 요약) */
export function NoticeCreateTargetSection({
  form,
  isOrganizationLoading,
  locks,
  onChange,
  organization,
  partOptions,
  schoolStaffPartsRequired,
  targetSummaryLine,
}: NoticeCreateTargetSectionProps) {
  const {
    chapterPresidentChallengerActive,
    lockAudienceAndTarget,
    schoolExecutiveLocked,
    targetGisuLocked,
  } = locks

  const chapterSelectOptions = organization.chapters.map((chapter) => ({
    label: chapter.name,
    value: String(chapter.id),
  }))
  const schoolSelectOptions = organization.schools.map((school) => ({
    label: school.schoolName,
    value: String(school.schoolId),
  }))

  const gisuModeOptions = useMemo(
    () =>
      NOTICE_CREATE_GISU_MODE_OPTIONS.map((option) => ({
        ...option,
        disabled:
          (targetGisuLocked && option.value === "all") ||
          (form.staffEnabled &&
            !form.challengerEnabled &&
            option.value === "all"),
      })),
    [form.challengerEnabled, form.staffEnabled, targetGisuLocked],
  )

  const orgModeOptions = useMemo(() => {
    const disableChapterAndSchool = form.gisuMode === "all"
    const challengerChapterSchoolExclusive = form.challengerEnabled

    return NOTICE_CREATE_ORG_MODE_OPTIONS.map((option) => ({
      ...option,
      disabled:
        (chapterPresidentChallengerActive &&
          (option.value === "umc" || option.value === "school")) ||
        (schoolExecutiveLocked &&
          (option.value === "umc" || option.value === "chapter")) ||
        (challengerChapterSchoolExclusive &&
          option.value === "school" &&
          form.orgMode === "chapter" &&
          form.chapterId != null) ||
        (challengerChapterSchoolExclusive &&
          option.value === "chapter" &&
          form.orgMode === "school" &&
          form.schoolId != null) ||
        (disableChapterAndSchool &&
          (option.value === "chapter" || option.value === "school")) ||
        (option.value === "chapter" && !canNoticeCreateUseChapterOrg(form)) ||
        (option.value === "school" &&
          form.staffEnabled &&
          !canStaffNoticeUseSchoolOrg(form.staffScope)),
    }))
  }, [chapterPresidentChallengerActive, form, schoolExecutiveLocked])

  const showPartSelection =
    canNoticeCreateUsePartSelection(form) ||
    (schoolStaffPartsRequired && (form.challengerEnabled || form.staffEnabled))

  const togglePart = (part: NoticeCreatePartOption["value"]) => {
    onChange({
      parts: form.parts.includes(part)
        ? form.parts.filter((item) => item !== part)
        : [...form.parts, part],
    })
  }

  return (
    <NoticeCreateSection locked={lockAudienceAndTarget} title="대상">
      <div className="flex flex-col gap-(--umc-spacing-gap-24)">
        <div className="flex items-center gap-(--umc-spacing-gap-20)">
          <p className="text-body-1-regular text-neutral-strong-800 w-[40px] shrink-0">
            기수
          </p>
          <OptionButtonGroup
            aria-label="기수 범위"
            onValueChange={(value) => {
              if (targetGisuLocked) {
                return
              }

              const gisuMode = value
              if (gisuMode === "all") {
                onChange({
                  chapterId: null,
                  gisuMode,
                  orgMode: "umc",
                  parts: [],
                  schoolId: null,
                })
                return
              }
              onChange({ gisuMode })
            }}
            options={gisuModeOptions}
            size="sm"
            type="single"
            value={form.gisuMode}
            variant="weak"
          />
          {form.gisuMode === "specific" ? (
            <Select
              aria-label="대상 기수"
              className="w-auto shrink-0"
              disabled={isOrganizationLoading || targetGisuLocked}
              onValueChange={(value) => {
                if (targetGisuLocked) {
                  return
                }

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
              if (chapterPresidentChallengerActive || schoolExecutiveLocked) {
                return
              }

              onChange({
                orgMode: value,
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
          {form.orgMode === "chapter" && canNoticeCreateUseChapterOrg(form) ? (
            <Select
              aria-label="지부"
              className="w-auto shrink-0"
              disabled={
                isOrganizationLoading || chapterPresidentChallengerActive
              }
              onValueChange={(value) => {
                if (chapterPresidentChallengerActive) {
                  return
                }

                onChange({
                  chapterId: value ? Number(value) : null,
                  orgMode: "chapter",
                  schoolId: null,
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
              className="w-auto shrink-0"
              disabled={isOrganizationLoading || schoolExecutiveLocked}
              onValueChange={(value) => {
                if (schoolExecutiveLocked) {
                  return
                }

                onChange({
                  chapterId: null,
                  orgMode: "school",
                  schoolId: value ? Number(value) : null,
                })
              }}
              options={schoolSelectOptions}
              placeholder="학교"
              size="md"
              value={form.schoolId != null ? String(form.schoolId) : undefined}
              variant="filter"
            />
          ) : null}
        </div>

        {showPartSelection ? (
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
        ) : null}

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
  )
}
