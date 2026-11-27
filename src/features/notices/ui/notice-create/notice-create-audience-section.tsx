import { Checkbox, OptionButtonGroup } from "@umc-product/react"
import { useMemo } from "react"

import {
  applyCentralChallengerDisabledTargetReset,
  applyCentralStaffDisabledTargetReset,
  applyNoticeCentralHqChallengerGisuTarget,
  applyNoticeCentralHqStaffScopeTarget,
  enableNoticeCreateChallengerAudience,
  enableNoticeCreateStaffAudience,
} from "../../model/notice-central-create-access"
import { applyNoticeCreateChallengerUmcOnlyOrgPatch } from "../../model/notice-challenger-target-rules"
import { applyNoticeChapterPresidentCreateFormLock } from "../../model/notice-chapter-president-access"
import {
  NOTICE_CREATE_STAFF_SCOPE_OPTIONS,
  type NoticeCreateFormState,
  type NoticeCreateStaffScope,
} from "../../model/notice-create-form"
import {
  isStaffUmcWideRecipientScope,
  NOTICE_CREATE_STAFF_SCOPE_HINTS,
} from "../../model/notice-create-staff-scope"
import {
  applyNoticeSchoolExecutiveChallengerCreateLock,
  NOTICE_SCHOOL_EXECUTIVE_STAFF_CREATE_SCOPE,
} from "../../model/notice-school-executive-access"
import { NoticeCreateSection } from "./notice-create-section"

import type { NoticeCreateFormLocks } from "./notice-create-form-locks"

type NoticeCreateAudienceSectionProps = {
  form: NoticeCreateFormState
  locks: NoticeCreateFormLocks
  onChange: (patch: Partial<NoticeCreateFormState>) => void
  /** HQ_LEAD: 활성 기수·중앙운영진 대상 보정 */
  sessionGisuId?: number | null
}

/** 공지 종류 (챌린저 / 운영진 대상, 운영진 범위) */
export function NoticeCreateAudienceSection({
  form,
  locks,
  onChange,
  sessionGisuId = null,
}: NoticeCreateAudienceSectionProps) {
  const {
    centralAdminStaffChipRestricted,
    centralLeadStaffChipRestricted,
    centralUnrestrictedCreate,
    chapterPresidentAudienceLocked,
    chapterPresidentChallengerActive,
    chapterPresidentCreateLock,
    chapterPresidentLocked,
    lockAudienceAndTarget,
    schoolExecutiveCreateLock,
    schoolExecutiveLocked,
    schoolExecutiveStaffActive,
    schoolStaffAudienceLocked,
    schoolStaffCreateLock,
    schoolStaffLocked,
    noticeCreateSuperAdmin,
  } = locks

  const challengerAudienceLocked =
    chapterPresidentAudienceLocked || schoolStaffAudienceLocked

  const staffScopeOptions = useMemo(
    () =>
      NOTICE_CREATE_STAFF_SCOPE_OPTIONS.map((option) => ({
        ...option,
        disabled:
          (schoolExecutiveStaffActive &&
            option.value !== NOTICE_SCHOOL_EXECUTIVE_STAFF_CREATE_SCOPE) ||
          ((centralLeadStaffChipRestricted ||
            centralAdminStaffChipRestricted) &&
            option.value === "SCHOOL_PART_LEADER") ||
          (centralAdminStaffChipRestricted &&
            option.value === "CENTRAL_MEMBER"),
      })),
    [
      centralAdminStaffChipRestricted,
      centralLeadStaffChipRestricted,
      schoolExecutiveStaffActive,
    ],
  )

  const applyStaffScopeChange = (staffScope: NoticeCreateStaffScope) => {
    const patch: Partial<NoticeCreateFormState> = { staffScope }

    if (isStaffUmcWideRecipientScope(staffScope)) {
      if (form.orgMode === "school") {
        patch.orgMode = "umc"
        patch.schoolId = null
      }
      if (!form.challengerEnabled) {
        patch.parts = []
      }
    }

    if (
      (centralLeadStaffChipRestricted || centralAdminStaffChipRestricted) &&
      sessionGisuId != null
    ) {
      Object.assign(
        patch,
        applyNoticeCentralHqStaffScopeTarget(
          { ...form, ...patch },
          sessionGisuId,
          {
            centralAdminStaffChipRestricted,
            centralLeadStaffChipRestricted,
          },
        ),
      )
    }

    onChange(patch)
  }

  const withChallengerUmcOnlyOrg = (
    patch: Partial<NoticeCreateFormState>,
  ): Partial<NoticeCreateFormState> => {
    if (
      noticeCreateSuperAdmin ||
      centralUnrestrictedCreate ||
      chapterPresidentLocked ||
      schoolExecutiveLocked ||
      schoolStaffLocked
    ) {
      return patch
    }

    return {
      ...patch,
      ...applyNoticeCreateChallengerUmcOnlyOrgPatch(
        { ...form, ...patch },
        {
          chapterPresidentChallengerActive:
            chapterPresidentChallengerActive || chapterPresidentLocked,
          schoolExecutiveLocked,
        },
      ),
    }
  }

  const withCentralHqTarget = (
    patch: Partial<NoticeCreateFormState>,
  ): Partial<NoticeCreateFormState> => {
    if (
      sessionGisuId == null ||
      (!centralLeadStaffChipRestricted && !centralAdminStaffChipRestricted)
    ) {
      return patch
    }

    const merged = { ...form, ...patch }

    return {
      ...patch,
      ...applyNoticeCentralHqChallengerGisuTarget(merged, sessionGisuId, {
        centralAdminStaffChipRestricted,
        centralLeadStaffChipRestricted,
      }),
      ...applyNoticeCentralHqStaffScopeTarget(merged, sessionGisuId, {
        centralAdminStaffChipRestricted,
        centralLeadStaffChipRestricted,
      }),
    }
  }

  return (
    <NoticeCreateSection locked={lockAudienceAndTarget} title="공지 종류">
      <div className="flex flex-col gap-(--umc-spacing-gap-16)">
        <div className="flex items-center gap-(--umc-spacing-gap-8)">
          <Checkbox
            checked={challengerAudienceLocked ? true : form.challengerEnabled}
            color={
              lockAudienceAndTarget
                ? "neutral"
                : challengerAudienceLocked || form.challengerEnabled
                  ? "brand"
                  : "neutral"
            }
            disabled={!challengerAudienceLocked && lockAudienceAndTarget}
            labelPlacement="end"
            readOnly={challengerAudienceLocked}
            onCheckedChange={(checked) => {
              if (challengerAudienceLocked) {
                return
              }

              const challengerEnabled = checked === true

              if (
                chapterPresidentLocked &&
                chapterPresidentCreateLock != null &&
                challengerEnabled
              ) {
                onChange({
                  ...applyNoticeChapterPresidentCreateFormLock({
                    form: {
                      ...form,
                      ...enableNoticeCreateChallengerAudience(
                        form,
                        centralUnrestrictedCreate,
                      ),
                    },
                    ...chapterPresidentCreateLock,
                  }),
                  challengerEnabled: true,
                  staffEnabled: false,
                })
                return
              }

              if (
                schoolExecutiveLocked &&
                schoolExecutiveCreateLock != null &&
                challengerEnabled
              ) {
                onChange({
                  ...applyNoticeSchoolExecutiveChallengerCreateLock({
                    form: {
                      ...form,
                      ...enableNoticeCreateChallengerAudience(
                        form,
                        centralUnrestrictedCreate,
                      ),
                    },
                    ...schoolExecutiveCreateLock,
                  }),
                  challengerEnabled: true,
                  staffEnabled: false,
                })
                return
              }

              if (
                schoolStaffLocked &&
                schoolStaffCreateLock != null &&
                challengerEnabled
              ) {
                onChange({
                  ...applyNoticeSchoolExecutiveChallengerCreateLock({
                    form: {
                      ...form,
                      ...enableNoticeCreateChallengerAudience(
                        form,
                        centralUnrestrictedCreate,
                      ),
                    },
                    ...schoolStaffCreateLock,
                  }),
                  challengerEnabled: true,
                  staffEnabled: false,
                })
                return
              }

              if (
                challengerEnabled &&
                form.gisuMode === "all" &&
                form.orgMode !== "umc"
              ) {
                onChange(
                  withCentralHqTarget({
                    ...enableNoticeCreateChallengerAudience(
                      form,
                      centralUnrestrictedCreate,
                    ),
                    chapterId: null,
                    orgMode: "umc",
                    schoolId: null,
                  }),
                )
                return
              }

              if (
                !challengerEnabled &&
                centralUnrestrictedCreate &&
                !chapterPresidentLocked &&
                !schoolExecutiveLocked &&
                !schoolStaffLocked
              ) {
                onChange(applyCentralChallengerDisabledTargetReset(form))
                return
              }

              if (challengerEnabled) {
                onChange(
                  withCentralHqTarget(
                    withChallengerUmcOnlyOrg(
                      enableNoticeCreateChallengerAudience(
                        form,
                        centralUnrestrictedCreate,
                      ),
                    ),
                  ),
                )
                return
              }

              onChange({ challengerEnabled: false })
            }}
            size="lg"
          >
            챌린저 대상 공지
          </Checkbox>
          <span className="text-body-3-regular text-neutral-medium-600">
            선택한 챌린저의 앱 공지 목록에 올라가요
          </span>
        </div>
        <div className="flex items-center gap-(--umc-spacing-gap-8)">
          <Checkbox
            checked={form.staffEnabled}
            color={
              lockAudienceAndTarget
                ? "neutral"
                : form.staffEnabled
                  ? "brand"
                  : "neutral"
            }
            disabled={
              challengerAudienceLocked ||
              schoolStaffAudienceLocked ||
              lockAudienceAndTarget
            }
            labelPlacement="end"
            onCheckedChange={(checked) => {
              if (challengerAudienceLocked || schoolStaffAudienceLocked) {
                return
              }

              const staffEnabled = checked === true

              if (
                schoolExecutiveLocked &&
                staffEnabled &&
                schoolExecutiveCreateLock != null
              ) {
                onChange({
                  gisuMode: "specific",
                  orgMode: "school",
                  chapterId: null,
                  schoolId: schoolExecutiveCreateLock.schoolId,
                  staffEnabled: true,
                  challengerEnabled: false,
                  staffScope: NOTICE_SCHOOL_EXECUTIVE_STAFF_CREATE_SCOPE,
                  targetGisuId: schoolExecutiveCreateLock.targetGisuId,
                })
                return
              }

              if (
                staffEnabled &&
                !schoolExecutiveLocked &&
                (form.orgMode === "chapter" || form.gisuMode === "all")
              ) {
                onChange(
                  withCentralHqTarget({
                    ...enableNoticeCreateStaffAudience(
                      form,
                      centralUnrestrictedCreate,
                    ),
                    chapterId: null,
                    gisuMode:
                      form.gisuMode === "all" ? "specific" : form.gisuMode,
                    orgMode: form.orgMode === "chapter" ? "umc" : form.orgMode,
                  }),
                )
                return
              }

              if (
                !staffEnabled &&
                centralUnrestrictedCreate &&
                !chapterPresidentLocked &&
                !schoolExecutiveLocked
              ) {
                onChange(applyCentralStaffDisabledTargetReset(form))
                return
              }

              if (staffEnabled) {
                onChange(
                  withCentralHqTarget(
                    enableNoticeCreateStaffAudience(
                      form,
                      centralUnrestrictedCreate,
                    ),
                  ),
                )
                return
              }

              onChange({ staffEnabled: false })
            }}
            size="lg"
          >
            운영진 대상 공지
          </Checkbox>
          <span className="text-body-3-regular text-neutral-medium-600">
            운영진만 볼 수 있어요
          </span>
        </div>
      </div>

      {form.staffEnabled ? (
        <>
          <div className="border-neutral-disabled border-t" />
          <div className="flex items-start gap-10">
            <p className="text-body-1-regular text-teal-grey-700 w-[73px] shrink-0">
              받는 운영진
            </p>
            <div className="flex min-w-0 flex-col gap-(--umc-spacing-gap-8)">
              <OptionButtonGroup
                aria-label="받는 운영진"
                onValueChange={(value) => {
                  if (
                    schoolExecutiveLocked &&
                    value !== NOTICE_SCHOOL_EXECUTIVE_STAFF_CREATE_SCOPE
                  ) {
                    return
                  }

                  applyStaffScopeChange(value)
                }}
                options={staffScopeOptions}
                size="sm"
                type="single"
                value={form.staffScope}
                variant="weak"
              />
              <p className="text-body-3-regular text-neutral-medium-600">
                {NOTICE_CREATE_STAFF_SCOPE_HINTS[form.staffScope]}
              </p>
            </div>
          </div>
        </>
      ) : null}
    </NoticeCreateSection>
  )
}
