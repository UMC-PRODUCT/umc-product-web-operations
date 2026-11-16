import { applyNoticeChapterPresidentCreateFormLock } from "./notice-chapter-president-access"
import { filterNoticeCreateParts } from "./notice-create-part-options"
import {
  applyNoticeSchoolExecutiveChallengerCreateLock,
  NOTICE_SCHOOL_EXECUTIVE_STAFF_CREATE_SCOPE,
} from "./notice-school-executive-access"

import type { NoticeCreateFormState } from "./notice-create-form"

export type NormalizeNoticeCreateFormContext = {
  /** 세션(헤더) 기수. 특정 기수 모드에서 대상 기수가 비어 있으면 채운다 */
  sessionGisuId: number | null
  /** 지부장: 챌린저 공지만 작성 가능 */
  chapterPresidentChallengerOnly: boolean
  chapterPresidentCreateLock: {
    chapterId: number
    targetGisuId: number
  } | null
  schoolExecutiveCreateLock: {
    schoolId: number
    targetGisuId: number
  } | null
  /** 공지 대상 기수의 기수 번호. 허용되지 않는 파트를 걸러낸다 */
  contextGeneration: number | null
}

/**
 * 공지 작성 폼에 권한 잠금·기수·파트 보정을 순서대로 적용한다.
 * 변경이 없으면 입력과 같은 참조를 반환한다.
 */
export function normalizeNoticeCreateForm(
  form: NoticeCreateFormState,
  context: NormalizeNoticeCreateFormContext,
): NoticeCreateFormState {
  let next = form

  if (
    context.sessionGisuId != null &&
    next.gisuMode === "specific" &&
    next.targetGisuId == null
  ) {
    next = { ...next, targetGisuId: context.sessionGisuId }
  }

  if (
    context.chapterPresidentChallengerOnly &&
    !(next.challengerEnabled && !next.staffEnabled)
  ) {
    next = { ...next, challengerEnabled: true, staffEnabled: false }
  }

  if (context.chapterPresidentCreateLock != null && next.challengerEnabled) {
    const locked = applyNoticeChapterPresidentCreateFormLock({
      form: { ...next, staffEnabled: false },
      ...context.chapterPresidentCreateLock,
    })

    if (
      locked.gisuMode !== next.gisuMode ||
      locked.targetGisuId !== next.targetGisuId ||
      locked.orgMode !== next.orgMode ||
      locked.chapterId !== next.chapterId ||
      locked.schoolId !== next.schoolId
    ) {
      next = locked
    }
  }

  if (context.schoolExecutiveCreateLock != null) {
    let locked = applyNoticeSchoolExecutiveChallengerCreateLock({
      form: next,
      ...context.schoolExecutiveCreateLock,
    })

    if (
      next.staffEnabled &&
      next.staffScope !== NOTICE_SCHOOL_EXECUTIVE_STAFF_CREATE_SCOPE
    ) {
      locked = {
        ...locked,
        staffScope: NOTICE_SCHOOL_EXECUTIVE_STAFF_CREATE_SCOPE,
      }
    }

    if (
      locked.gisuMode !== next.gisuMode ||
      locked.targetGisuId !== next.targetGisuId ||
      locked.orgMode !== next.orgMode ||
      locked.chapterId !== next.chapterId ||
      locked.schoolId !== next.schoolId ||
      locked.staffScope !== next.staffScope
    ) {
      next = locked
    }
  }

  const nextParts = filterNoticeCreateParts(
    next.parts,
    context.contextGeneration,
  )
  if (
    nextParts.length !== next.parts.length ||
    nextParts.some((part, index) => part !== next.parts[index])
  ) {
    next = { ...next, parts: nextParts }
  }

  return next
}

/** 잠금이 없을 때 대상 기수가 바뀌면 지부·학교 선택을 비운다 */
export function resetNoticeCreateOrganization(
  form: NoticeCreateFormState,
): NoticeCreateFormState {
  if (form.chapterId == null && form.schoolId == null) {
    return form
  }

  return { ...form, chapterId: null, schoolId: null }
}
