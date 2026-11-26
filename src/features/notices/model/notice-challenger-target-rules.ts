import type { NoticeCreateFormState } from "./notice-create-form"

export type NoticeCreateChallengerOrgLockContext = {
  chapterPresidentChallengerActive: boolean
  schoolExecutiveLocked: boolean
}

/** 챌린저 공지 — 조직은 UMC 전체만 (지부장·학교 회장단 잠금 제외) */
export function isNoticeCreateChallengerUmcOnlyOrg(
  form: Pick<NoticeCreateFormState, "challengerEnabled" | "staffEnabled">,
  locks: NoticeCreateChallengerOrgLockContext,
): boolean {
  return (
    form.challengerEnabled &&
    !form.staffEnabled &&
    !locks.chapterPresidentChallengerActive &&
    !locks.schoolExecutiveLocked
  )
}

export function canNoticeCreateUseChallengerChapterOrg(
  form: Pick<NoticeCreateFormState, "challengerEnabled">,
  locks: NoticeCreateChallengerOrgLockContext,
): boolean {
  return form.challengerEnabled && locks.chapterPresidentChallengerActive
}

export function canNoticeCreateUseChallengerSchoolOrg(
  form: Pick<NoticeCreateFormState, "challengerEnabled">,
  locks: NoticeCreateChallengerOrgLockContext,
): boolean {
  return form.challengerEnabled && locks.schoolExecutiveLocked
}

type ChallengerOrgUiOptions = {
  /** 슈퍼어드민만: 특정 기수 챌린저에서 지부·학교 조직 선택 허용 */
  unrestrictedChallengerOrg: boolean
}

/** 챌린저 — 지부 Select·조직 칩 (지부장 잠금 또는 슈퍼어드민 특정 기수) */
export function canNoticeCreateShowChallengerChapterOrg(
  form: Pick<
    NoticeCreateFormState,
    "challengerEnabled" | "staffEnabled" | "gisuMode"
  >,
  locks: NoticeCreateChallengerOrgLockContext,
  options: ChallengerOrgUiOptions,
): boolean {
  if (!form.challengerEnabled || form.staffEnabled) {
    return false
  }

  if (locks.chapterPresidentChallengerActive) {
    return true
  }

  return options.unrestrictedChallengerOrg && form.gisuMode === "specific"
}

/** 챌린저 — 학교 Select·조직 칩 (학교 잠금 또는 슈퍼어드민 특정 기수) */
export function canNoticeCreateShowChallengerSchoolOrg(
  form: Pick<
    NoticeCreateFormState,
    "challengerEnabled" | "staffEnabled" | "gisuMode"
  >,
  locks: NoticeCreateChallengerOrgLockContext,
  options: ChallengerOrgUiOptions,
): boolean {
  if (!form.challengerEnabled || form.staffEnabled) {
    return false
  }

  if (locks.schoolExecutiveLocked) {
    return true
  }

  return options.unrestrictedChallengerOrg && form.gisuMode === "specific"
}

/** 특정 기수 + 활성 기수일 때만 파트 선택 */
export function canNoticeCreateUseChallengerPartSelection(
  form: Pick<
    NoticeCreateFormState,
    "challengerEnabled" | "gisuMode" | "targetGisuId"
  >,
  sessionGisuId: number | null | undefined,
): boolean {
  if (!form.challengerEnabled || form.gisuMode !== "specific") {
    return false
  }

  if (sessionGisuId == null || form.targetGisuId == null) {
    return false
  }

  return form.targetGisuId === sessionGisuId
}

export function applyNoticeCreateChallengerUmcOnlyOrgPatch(
  form: NoticeCreateFormState,
  locks: NoticeCreateChallengerOrgLockContext,
): Partial<NoticeCreateFormState> {
  if (!isNoticeCreateChallengerUmcOnlyOrg(form, locks)) {
    return {}
  }

  if (
    form.orgMode === "umc" &&
    form.chapterId == null &&
    form.schoolId == null
  ) {
    return {}
  }

  return {
    chapterId: null,
    orgMode: "umc",
    schoolId: null,
  }
}
