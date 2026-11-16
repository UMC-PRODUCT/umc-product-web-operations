import type { NoticeCreateFormState } from "../../model/notice-create-form"

export type NoticeChapterPresidentCreateLock = {
  chapterId: number
  targetGisuId: number
}

export type NoticeSchoolExecutiveCreateLock = {
  schoolId: number
  targetGisuId: number
}

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
  schoolExecutiveLocked: boolean
  chapterPresidentChallengerActive: boolean
  schoolExecutiveStaffActive: boolean
  targetGisuLocked: boolean
  /** 수정 화면: 공지 종류·대상 잠금 */
  lockAudienceAndTarget: boolean
}

export function resolveNoticeCreateFormLocks(input: {
  centralUnrestrictedCreate: boolean
  chapterPresidentChallengerOnly: boolean
  chapterPresidentCreateLock: NoticeChapterPresidentCreateLock | null
  form: Pick<NoticeCreateFormState, "challengerEnabled" | "staffEnabled">
  mode: NoticeFormMode
  schoolExecutiveCreateLock: NoticeSchoolExecutiveCreateLock | null
}): NoticeCreateFormLocks {
  const isEditMode = input.mode === "edit"
  const chapterPresidentLocked = input.chapterPresidentCreateLock != null
  const schoolExecutiveLocked = input.schoolExecutiveCreateLock != null
  const chapterPresidentChallengerActive =
    chapterPresidentLocked && input.form.challengerEnabled
  const schoolExecutiveStaffActive =
    schoolExecutiveLocked && input.form.staffEnabled

  return {
    centralUnrestrictedCreate: input.centralUnrestrictedCreate,
    chapterPresidentAudienceLocked: input.chapterPresidentChallengerOnly,
    chapterPresidentChallengerActive,
    chapterPresidentCreateLock: input.chapterPresidentCreateLock,
    chapterPresidentLocked,
    isEditMode,
    lockAudienceAndTarget: isEditMode,
    schoolExecutiveCreateLock: input.schoolExecutiveCreateLock,
    schoolExecutiveLocked,
    schoolExecutiveStaffActive,
    targetGisuLocked: chapterPresidentChallengerActive || schoolExecutiveLocked,
  }
}
