import {
  isNoticeCentralHqChallengerGisuLocked,
  isNoticeCentralHqStaffGisuLocked,
  isNoticeCentralLeadStaffOrgRowHidden,
} from "../../model/notice-central-create-access"

import type { NoticeCreateFormState } from "../../model/notice-create-form"

export type NoticeChapterPresidentCreateLock = {
  chapterId: number
  targetGisuId: number
}

export type NoticeSchoolExecutiveCreateLock = {
  schoolId: number
  targetGisuId: number
}

export type NoticeSchoolStaffCreateLock = NoticeSchoolExecutiveCreateLock

export type NoticeFormMode = "create" | "edit"

export type NoticeCreateFormLocks = {
  /** 슈퍼·중앙: 챌린저 해제 시 대상 필터 초기화 */
  centralUnrestrictedCreate: boolean
  chapterPresidentCreateLock: NoticeChapterPresidentCreateLock | null
  schoolExecutiveCreateLock: NoticeSchoolExecutiveCreateLock | null
  isEditMode: boolean
  chapterPresidentLocked: boolean
  /** 지부장: 챌린저 대상 공지만 작성 (체크 고정) */
  chapterPresidentAudienceLocked: boolean
  /** 교내 파트장·기타 운영진: 챌린저 대상 공지만 작성 (체크 고정) */
  schoolStaffAudienceLocked: boolean
  schoolStaffCreateLock: NoticeSchoolStaffCreateLock | null
  schoolStaffLocked: boolean
  schoolExecutiveLocked: boolean
  chapterPresidentChallengerActive: boolean
  schoolExecutiveStaffActive: boolean
  targetGisuLocked: boolean
  /** 수정 화면: 공지 종류·대상 잠금 */
  lockAudienceAndTarget: boolean
  /** HQ_ADMIN: 중앙 운영진·학교 운영진 칩 비활성 */
  centralAdminStaffChipRestricted: boolean
  /** HQ_LEAD: 학교 운영진 칩 비활성 */
  centralLeadStaffChipRestricted: boolean
  /** HQ_LEAD + 운영진 칩: 조직 행 숨김 */
  centralLeadStaffOrgRowHidden: boolean
  /** 슈퍼어드민: 기수·조직 잠금 없음 */
  noticeCreateSuperAdmin: boolean
}

export function resolveNoticeCreateFormLocks(input: {
  centralAdminStaffChipRestricted: boolean
  centralUnrestrictedCreate: boolean
  centralLeadStaffChipRestricted: boolean
  chapterPresidentChallengerOnly: boolean
  chapterPresidentCreateLock: NoticeChapterPresidentCreateLock | null
  form: Pick<
    NoticeCreateFormState,
    "challengerEnabled" | "staffEnabled" | "staffScope"
  >
  mode: NoticeFormMode
  schoolExecutiveCreateLock: NoticeSchoolExecutiveCreateLock | null
  noticeCreateSuperAdmin: boolean
  schoolStaffChallengerOnly: boolean
  schoolStaffCreateLock: NoticeSchoolStaffCreateLock | null
}): NoticeCreateFormLocks {
  const isEditMode = input.mode === "edit"

  if (input.noticeCreateSuperAdmin) {
    return {
      centralAdminStaffChipRestricted: false,
      centralLeadStaffChipRestricted: false,
      centralLeadStaffOrgRowHidden: false,
      centralUnrestrictedCreate: input.centralUnrestrictedCreate,
      noticeCreateSuperAdmin: true,
      chapterPresidentAudienceLocked: false,
      schoolStaffAudienceLocked: false,
      schoolStaffCreateLock: null,
      schoolStaffLocked: false,
      chapterPresidentChallengerActive: false,
      chapterPresidentCreateLock: null,
      chapterPresidentLocked: false,
      isEditMode,
      lockAudienceAndTarget: isEditMode,
      schoolExecutiveCreateLock: null,
      schoolExecutiveLocked: false,
      schoolExecutiveStaffActive: false,
      targetGisuLocked: false,
    }
  }

  const chapterPresidentLocked = input.chapterPresidentCreateLock != null
  const schoolStaffLocked = input.schoolStaffCreateLock != null
  const schoolExecutiveLocked =
    input.schoolExecutiveCreateLock != null && !input.schoolStaffChallengerOnly
  const chapterPresidentChallengerActive =
    chapterPresidentLocked && input.form.challengerEnabled
  const schoolExecutiveStaffActive =
    schoolExecutiveLocked && input.form.staffEnabled
  const centralHqChallengerGisuLocked = isNoticeCentralHqChallengerGisuLocked(
    input.centralLeadStaffChipRestricted,
    input.centralAdminStaffChipRestricted,
    input.form,
  )
  const centralLeadStaffGisuLocked = isNoticeCentralHqStaffGisuLocked(
    input.centralLeadStaffChipRestricted,
    input.centralAdminStaffChipRestricted,
    input.form,
  )
  const centralLeadStaffOrgRowHidden = isNoticeCentralLeadStaffOrgRowHidden(
    input.centralLeadStaffChipRestricted,
    input.form,
  )

  return {
    centralAdminStaffChipRestricted: input.centralAdminStaffChipRestricted,
    centralLeadStaffOrgRowHidden,
    centralLeadStaffChipRestricted: input.centralLeadStaffChipRestricted,
    centralUnrestrictedCreate: input.centralUnrestrictedCreate,
    noticeCreateSuperAdmin: input.noticeCreateSuperAdmin,
    chapterPresidentAudienceLocked: input.chapterPresidentChallengerOnly,
    schoolStaffAudienceLocked: input.schoolStaffChallengerOnly,
    schoolStaffCreateLock: input.schoolStaffCreateLock,
    schoolStaffLocked,
    chapterPresidentChallengerActive,
    chapterPresidentCreateLock: input.chapterPresidentCreateLock,
    chapterPresidentLocked,
    isEditMode,
    lockAudienceAndTarget: isEditMode,
    schoolExecutiveCreateLock: input.schoolExecutiveCreateLock,
    schoolExecutiveLocked,
    schoolExecutiveStaffActive,
    targetGisuLocked: input.noticeCreateSuperAdmin
      ? false
      : chapterPresidentChallengerActive ||
        schoolStaffLocked ||
        schoolExecutiveLocked ||
        centralHqChallengerGisuLocked ||
        centralLeadStaffGisuLocked,
  }
}
