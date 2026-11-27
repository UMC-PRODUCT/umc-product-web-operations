import {
  applyNoticeCentralHqChallengerGisuTarget,
  applyNoticeCentralHqStaffScopeTarget,
} from "./notice-central-create-access"
import {
  applyNoticeCreateChallengerUmcOnlyOrgPatch,
  canNoticeCreateUseChallengerPartSelection,
} from "./notice-challenger-target-rules"
import { applyNoticeChapterPresidentCreateFormLock } from "./notice-chapter-president-access"
import { filterNoticeCreateParts } from "./notice-create-part-options"
import {
  applyNoticeSchoolExecutiveChallengerCreateLock,
  NOTICE_SCHOOL_EXECUTIVE_STAFF_CREATE_SCOPE,
} from "./notice-school-executive-access"

import type { NoticeCreateFormState } from "./notice-create-form"

export type NormalizeNoticeCreateFormContext = {
  /** HQ_ADMIN: 중앙 운영진·학교 운영진 칩 선택 불가 */
  centralAdminStaffChipRestricted: boolean
  /** HQ_LEAD: 학교 운영진 칩 선택 불가 */
  centralLeadStaffChipRestricted: boolean
  /** 세션(헤더) 활성 기수 */
  sessionGisuId: number | null
  /** 지부장: 챌린저 공지만 작성 가능 */
  chapterPresidentChallengerOnly: boolean
  chapterPresidentCreateLock: {
    chapterId: number
    targetGisuId: number
  } | null
  /** 교내 파트장·기타 운영진: 챌린저 공지만 작성 */
  schoolStaffChallengerOnly: boolean
  schoolStaffCreateLock: {
    schoolId: number
    targetGisuId: number
  } | null
  schoolExecutiveCreateLock: {
    schoolId: number
    targetGisuId: number
  } | null
  /** 공지 대상 기수의 기수 번호. 허용되지 않는 파트를 걸러낸다 */
  contextGeneration: number | null
  /** 슈퍼어드민: 역할·대상 잠금 보정 없음 */
  noticeCreateSuperAdmin: boolean
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

  if (context.noticeCreateSuperAdmin) {
    const nextParts = filterNoticeCreateParts(
      next.parts,
      context.contextGeneration,
    )
    if (
      nextParts.length !== next.parts.length ||
      nextParts.some((part, index) => part !== next.parts[index])
    ) {
      return { ...next, parts: nextParts }
    }
    return next
  }

  if (
    context.chapterPresidentChallengerOnly &&
    !(next.challengerEnabled && !next.staffEnabled)
  ) {
    next = { ...next, challengerEnabled: true, staffEnabled: false }
  }

  if (
    context.schoolStaffChallengerOnly &&
    !(next.challengerEnabled && !next.staffEnabled)
  ) {
    next = { ...next, challengerEnabled: true, staffEnabled: false }
  }

  if (
    (context.centralLeadStaffChipRestricted ||
      context.centralAdminStaffChipRestricted) &&
    next.staffEnabled &&
    next.staffScope === "SCHOOL_PART_LEADER"
  ) {
    next = { ...next, staffScope: "ALL_STAFF" }
  }

  if (
    context.centralAdminStaffChipRestricted &&
    next.staffEnabled &&
    next.staffScope === "CENTRAL_MEMBER"
  ) {
    next = { ...next, staffScope: "ALL_STAFF" }
  }

  if (next.challengerEnabled && !next.staffEnabled) {
    const challengerOrgLocks = {
      chapterPresidentChallengerActive:
        context.chapterPresidentCreateLock != null,
      schoolExecutiveLocked: context.schoolExecutiveCreateLock != null,
    }
    const challengerOrgPatch = applyNoticeCreateChallengerUmcOnlyOrgPatch(
      next,
      challengerOrgLocks,
    )
    if (Object.keys(challengerOrgPatch).length > 0) {
      next = { ...next, ...challengerOrgPatch }
    }

    if (
      !canNoticeCreateUseChallengerPartSelection(next, context.sessionGisuId) &&
      next.parts.length > 0
    ) {
      next = { ...next, parts: [] }
    }

    if (
      (context.centralLeadStaffChipRestricted ||
        context.centralAdminStaffChipRestricted) &&
      context.sessionGisuId != null
    ) {
      const challengerGisuPatch = applyNoticeCentralHqChallengerGisuTarget(
        next,
        context.sessionGisuId,
        {
          centralAdminStaffChipRestricted:
            context.centralAdminStaffChipRestricted,
          centralLeadStaffChipRestricted:
            context.centralLeadStaffChipRestricted,
        },
      )
      if (Object.keys(challengerGisuPatch).length > 0) {
        next = { ...next, ...challengerGisuPatch }
      }
    }
  }

  if (
    (context.centralLeadStaffChipRestricted ||
      context.centralAdminStaffChipRestricted) &&
    next.staffEnabled &&
    context.sessionGisuId != null
  ) {
    const leadTargetPatch = applyNoticeCentralHqStaffScopeTarget(
      next,
      context.sessionGisuId,
      {
        centralAdminStaffChipRestricted:
          context.centralAdminStaffChipRestricted,
        centralLeadStaffChipRestricted: context.centralLeadStaffChipRestricted,
      },
    )
    if (Object.keys(leadTargetPatch).length > 0) {
      next = { ...next, ...leadTargetPatch }
    }
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

  if (context.schoolStaffCreateLock != null && next.challengerEnabled) {
    const locked = applyNoticeSchoolExecutiveChallengerCreateLock({
      form: { ...next, staffEnabled: false },
      ...context.schoolStaffCreateLock,
    })

    if (
      locked.gisuMode !== next.gisuMode ||
      locked.targetGisuId !== next.targetGisuId ||
      locked.orgMode !== next.orgMode ||
      locked.chapterId !== next.chapterId ||
      locked.schoolId !== next.schoolId ||
      locked.staffEnabled !== next.staffEnabled
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
