import { Checkbox, OptionButtonGroup } from "@umc-product/react"
import { useMemo } from "react"

import {
  applyCentralChallengerDisabledTargetReset,
  applyCentralStaffDisabledTargetReset,
} from "../../model/notice-central-create-access"
import { applyNoticeChapterPresidentCreateFormLock } from "../../model/notice-chapter-president-access"
import {
  NOTICE_CREATE_STAFF_SCOPE_OPTIONS,
  type NoticeCreateFormState,
  type NoticeCreateStaffScope,
} from "../../model/notice-create-form"
import {
  applyNoticeSchoolExecutiveChallengerCreateLock,
  NOTICE_SCHOOL_EXECUTIVE_STAFF_CREATE_SCOPE,
} from "../../model/notice-school-executive-access"
import { isStaffCentralNoticeTab } from "../../model/notice-staff-target-rules"
import { NoticeCreateSection } from "./notice-create-section"

import type { NoticeCreateFormLocks } from "./notice-create-form-locks"

type NoticeCreateAudienceSectionProps = {
  form: NoticeCreateFormState
  locks: NoticeCreateFormLocks
  onChange: (patch: Partial<NoticeCreateFormState>) => void
}

/** 공지 종류 (챌린저 / 운영진 대상, 운영진 범위) */
export function NoticeCreateAudienceSection({
  form,
  locks,
  onChange,
}: NoticeCreateAudienceSectionProps) {
  const {
    centralUnrestrictedCreate,
    chapterPresidentAudienceLocked,
    chapterPresidentCreateLock,
    chapterPresidentLocked,
    lockAudienceAndTarget,
    schoolExecutiveCreateLock,
    schoolExecutiveLocked,
    schoolExecutiveStaffActive,
  } = locks

  const staffScopeOptions = useMemo(
    () =>
      NOTICE_CREATE_STAFF_SCOPE_OPTIONS.map((option) => ({
        ...option,
        disabled:
          schoolExecutiveStaffActive &&
          option.value !== NOTICE_SCHOOL_EXECUTIVE_STAFF_CREATE_SCOPE,
      })),
    [schoolExecutiveStaffActive],
  )

  const applyStaffScopeChange = (staffScope: NoticeCreateStaffScope) => {
    const patch: Partial<NoticeCreateFormState> = { staffScope }

    if (isStaffCentralNoticeTab(staffScope)) {
      if (form.orgMode === "school") {
        patch.orgMode = "umc"
        patch.schoolId = null
      }
      if (!form.challengerEnabled) {
        patch.parts = []
      }
    }

    onChange(patch)
  }

  return (
    <NoticeCreateSection locked={lockAudienceAndTarget} title="공지 종류">
      <div className="flex flex-col gap-(--umc-spacing-gap-16)">
        <div className="flex items-center gap-(--umc-spacing-gap-8)">
          <Checkbox
            checked={
              chapterPresidentAudienceLocked ? true : form.challengerEnabled
            }
            color={
              chapterPresidentAudienceLocked || form.challengerEnabled
                ? "brand"
                : "neutral"
            }
            disabled={!chapterPresidentAudienceLocked && lockAudienceAndTarget}
            labelPlacement="end"
            readOnly={chapterPresidentAudienceLocked}
            onCheckedChange={(checked) => {
              if (chapterPresidentAudienceLocked) {
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
                    form: { ...form, challengerEnabled: true },
                    ...chapterPresidentCreateLock,
                  }),
                  challengerEnabled: true,
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
                    form: { ...form, challengerEnabled: true },
                    ...schoolExecutiveCreateLock,
                  }),
                  challengerEnabled: true,
                })
                return
              }

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

              if (
                !challengerEnabled &&
                centralUnrestrictedCreate &&
                !chapterPresidentLocked &&
                !schoolExecutiveLocked
              ) {
                onChange(applyCentralChallengerDisabledTargetReset(form))
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
            disabled={chapterPresidentAudienceLocked || lockAudienceAndTarget}
            labelPlacement="end"
            onCheckedChange={(checked) => {
              if (chapterPresidentAudienceLocked) {
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
                  staffScope: NOTICE_SCHOOL_EXECUTIVE_STAFF_CREATE_SCOPE,
                  targetGisuId: schoolExecutiveCreateLock.targetGisuId,
                })
                return
              }

              if (
                staffEnabled &&
                !form.challengerEnabled &&
                !schoolExecutiveLocked &&
                (form.orgMode === "chapter" || form.gisuMode === "all")
              ) {
                onChange({
                  chapterId: null,
                  gisuMode:
                    form.gisuMode === "all" ? "specific" : form.gisuMode,
                  orgMode: form.orgMode === "chapter" ? "umc" : form.orgMode,
                  staffEnabled,
                })
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

              onChange({ staffEnabled })
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
                if (
                  schoolExecutiveLocked &&
                  value !== NOTICE_SCHOOL_EXECUTIVE_STAFF_CREATE_SCOPE
                ) {
                  return
                }

                applyStaffScopeChange(value as NoticeCreateStaffScope)
              }}
              options={staffScopeOptions}
              size="sm"
              type="single"
              value={form.staffScope}
              variant="weak"
            />
          </div>
        </>
      ) : null}
    </NoticeCreateSection>
  )
}
