import { PersonIcon } from "@umc-product/icons"
import { Checkbox, OptionButtonGroup, Select, Tag } from "@umc-product/react"
import { useMemo } from "react"

import {
  canNoticeCreateShowChallengerChapterOrg,
  canNoticeCreateShowChallengerSchoolOrg,
  isNoticeCreateChallengerUmcOnlyOrg,
} from "../../model/notice-challenger-target-rules"
import {
  type NoticeCreateFormState,
  type NoticeCreateGisuMode,
  type NoticeCreateOrgMode,
} from "../../model/notice-create-form"
import {
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
  /** PersonIcon 받는 사람 요약 */
  recipientSummaryLine: string
  /** 헤더 활성 기수 (HQ_LEAD 잠금 시 Select 표시) */
  sessionGisuId?: number | null
  sessionGisuLabel?: string | null
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
  recipientSummaryLine,
  sessionGisuId = null,
  sessionGisuLabel = null,
}: NoticeCreateTargetSectionProps) {
  const {
    centralLeadStaffOrgRowHidden,
    chapterPresidentChallengerActive,
    lockAudienceAndTarget,
    schoolExecutiveLocked,
    schoolStaffLocked,
    noticeCreateSuperAdmin,
    targetGisuLocked,
  } = locks

  const schoolOrgLocked = schoolExecutiveLocked || schoolStaffLocked

  const chapterSelectOptions = useMemo(() => {
    const options = organization.chapters.map((chapter) => ({
      label: chapter.name,
      value: String(chapter.id),
    }))

    if (!chapterPresidentChallengerActive) {
      return [{ value: "", label: "지부" }, ...options]
    }

    return options
  }, [chapterPresidentChallengerActive, organization.chapters])
  const schoolSelectOptions = useMemo(() => {
    const options = organization.schools.map((school) => ({
      label: school.schoolName,
      value: String(school.schoolId),
    }))

    if (!schoolOrgLocked) {
      return [{ value: "", label: "학교" }, ...options]
    }

    return options
  }, [organization.schools, schoolOrgLocked])

  const effectiveGisuMode = targetGisuLocked ? "specific" : form.gisuMode
  const effectiveTargetGisuId =
    form.targetGisuId ??
    (targetGisuLocked && sessionGisuId != null ? sessionGisuId : null)

  const gisuModeOptions = useMemo(
    () =>
      NOTICE_CREATE_GISU_MODE_OPTIONS.map((option) => ({
        ...option,
        disabled:
          (targetGisuLocked && option.value !== effectiveGisuMode) ||
          (form.staffEnabled &&
            !form.challengerEnabled &&
            !targetGisuLocked &&
            !noticeCreateSuperAdmin &&
            option.value === "all"),
      })),
    [
      effectiveGisuMode,
      form.challengerEnabled,
      form.staffEnabled,
      noticeCreateSuperAdmin,
      targetGisuLocked,
    ],
  )

  const gisuSelectOptions = useMemo(() => {
    let options = organization.gisuOptions

    if (
      effectiveTargetGisuId != null &&
      !options.some((option) => option.value === String(effectiveTargetGisuId))
    ) {
      options = [
        ...options,
        {
          value: String(effectiveTargetGisuId),
          label: sessionGisuLabel ?? String(effectiveTargetGisuId),
        },
      ]
    }

    if (!targetGisuLocked) {
      return [{ value: "", label: "기수" }, ...options]
    }

    return options
  }, [
    effectiveTargetGisuId,
    organization.gisuOptions,
    sessionGisuLabel,
    targetGisuLocked,
  ])

  const challengerOrgLocks = useMemo(
    () => ({
      chapterPresidentChallengerActive,
      schoolExecutiveLocked: schoolOrgLocked,
    }),
    [chapterPresidentChallengerActive, schoolOrgLocked],
  )

  const challengerUmcOnlyOrg =
    !noticeCreateSuperAdmin &&
    isNoticeCreateChallengerUmcOnlyOrg(form, challengerOrgLocks)

  const challengerOrgUiOptions = useMemo(
    () => ({ unrestrictedChallengerOrg: noticeCreateSuperAdmin }),
    [noticeCreateSuperAdmin],
  )

  const showChallengerChapterOrg = useMemo(
    () =>
      canNoticeCreateShowChallengerChapterOrg(
        form,
        challengerOrgLocks,
        challengerOrgUiOptions,
      ),
    [challengerOrgLocks, challengerOrgUiOptions, form],
  )

  const showChallengerSchoolOrg = useMemo(
    () =>
      canNoticeCreateShowChallengerSchoolOrg(
        form,
        challengerOrgLocks,
        challengerOrgUiOptions,
      ),
    [challengerOrgLocks, challengerOrgUiOptions, form],
  )

  const orgModeOptions = useMemo(() => {
    const disableChapterAndSchoolForAllGisu =
      form.gisuMode === "all" && !challengerUmcOnlyOrg

    return NOTICE_CREATE_ORG_MODE_OPTIONS.map((option) => ({
      ...option,
      disabled:
        (challengerUmcOnlyOrg &&
          (option.value === "chapter" || option.value === "school")) ||
        (chapterPresidentChallengerActive &&
          (option.value === "umc" || option.value === "school")) ||
        (schoolOrgLocked &&
          (option.value === "umc" || option.value === "chapter")) ||
        (disableChapterAndSchoolForAllGisu &&
          (option.value === "chapter" || option.value === "school")) ||
        (option.value === "chapter" &&
          !(
            form.challengerEnabled &&
            !form.staffEnabled &&
            showChallengerChapterOrg
          )) ||
        (option.value === "school" &&
          form.staffEnabled &&
          !canStaffNoticeUseSchoolOrg(form.staffScope)) ||
        (option.value === "school" &&
          form.challengerEnabled &&
          !form.staffEnabled &&
          !showChallengerSchoolOrg),
    }))
  }, [
    challengerUmcOnlyOrg,
    chapterPresidentChallengerActive,
    form,
    schoolOrgLocked,
    showChallengerChapterOrg,
    showChallengerSchoolOrg,
  ])

  const showPartSelection =
    canNoticeCreateUsePartSelection(form, sessionGisuId) ||
    (schoolStaffPartsRequired && form.challengerEnabled)

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
              onChange({
                gisuMode,
                ...(gisuMode === "specific" && form.gisuMode === "all"
                  ? { targetGisuId: null }
                  : {}),
              })
            }}
            options={gisuModeOptions}
            size="sm"
            type="single"
            value={effectiveGisuMode}
            variant="weak"
          />
          {effectiveGisuMode === "specific" ? (
            <div
              className={
                targetGisuLocked
                  ? "pointer-events-none w-auto shrink-0"
                  : "w-auto shrink-0"
              }
            >
              <Select
                aria-label="대상 기수"
                className="w-auto shrink-0"
                disabled={isOrganizationLoading}
                onValueChange={(value) => {
                  if (!value) {
                    onChange({ targetGisuId: null, parts: [] })
                    return
                  }

                  const targetGisuId = Number(value)
                  const patch: Partial<NoticeCreateFormState> = {
                    targetGisuId,
                  }
                  if (
                    form.challengerEnabled &&
                    sessionGisuId != null &&
                    targetGisuId != null &&
                    targetGisuId !== sessionGisuId
                  ) {
                    patch.parts = []
                  }
                  onChange(patch)
                }}
                options={gisuSelectOptions}
                placeholder="기수"
                size="md"
                value={
                  effectiveTargetGisuId != null
                    ? String(effectiveTargetGisuId)
                    : targetGisuLocked
                      ? undefined
                      : ""
                }
                variant="filter"
              />
            </div>
          ) : null}
        </div>

        {centralLeadStaffOrgRowHidden ? null : (
          <div className="flex items-center gap-(--umc-spacing-gap-20)">
            <p className="text-body-1-regular text-neutral-strong-800 w-[40px] shrink-0">
              조직
            </p>
            <OptionButtonGroup
              aria-label="조직 범위"
              onValueChange={(value) => {
                if (chapterPresidentChallengerActive || schoolOrgLocked) {
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
            {form.orgMode === "chapter" && showChallengerChapterOrg ? (
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

                  if (!value) {
                    onChange({
                      chapterId: null,
                      orgMode: "chapter",
                      schoolId: null,
                    })
                    return
                  }

                  onChange({
                    chapterId: Number(value),
                    orgMode: "chapter",
                    schoolId: null,
                  })
                }}
                options={chapterSelectOptions}
                placeholder="지부"
                size="md"
                value={
                  form.chapterId != null
                    ? String(form.chapterId)
                    : chapterPresidentChallengerActive
                      ? undefined
                      : ""
                }
                variant="filter"
              />
            ) : null}
            {form.orgMode === "school" &&
            (showChallengerSchoolOrg ||
              (form.staffEnabled &&
                canStaffNoticeUseSchoolOrg(form.staffScope))) ? (
              <Select
                aria-label="학교"
                className="w-auto shrink-0"
                disabled={isOrganizationLoading || schoolOrgLocked}
                onValueChange={(value) => {
                  if (schoolOrgLocked) {
                    return
                  }

                  if (!value) {
                    onChange({
                      chapterId: null,
                      orgMode: "school",
                      schoolId: null,
                    })
                    return
                  }

                  onChange({
                    chapterId: null,
                    orgMode: "school",
                    schoolId: Number(value),
                  })
                }}
                options={schoolSelectOptions}
                placeholder="학교"
                size="md"
                value={
                  form.schoolId != null
                    ? String(form.schoolId)
                    : schoolOrgLocked
                      ? undefined
                      : ""
                }
                variant="filter"
              />
            ) : null}
          </div>
        )}

        {showPartSelection ? (
          <div className="flex flex-wrap items-start gap-(--umc-spacing-gap-20)">
            <p className="text-body-1-regular text-neutral-strong-800 w-[40px] shrink-0 pt-1">
              파트
            </p>
            <div className="flex flex-wrap items-center gap-x-(--umc-spacing-gap-20) gap-y-(--umc-spacing-gap-12)">
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
              {schoolStaffPartsRequired ? (
                <Tag color="error" size="sm" variant="weak">
                  필수
                </Tag>
              ) : (
                <Tag color="neutral" size="sm" variant="weak">
                  선택
                </Tag>
              )}
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
          {recipientSummaryLine ? (
            <p className="text-body-3-semibold text-neutral-strong-800 min-w-0">
              {recipientSummaryLine}
            </p>
          ) : null}
        </div>
      </div>
    </NoticeCreateSection>
  )
}
