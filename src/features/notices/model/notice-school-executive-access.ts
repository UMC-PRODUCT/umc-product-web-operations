import { encodeChapterScope, encodeSchoolScope } from "./notice-scope-filter"

import type { NoticeListChapterOption } from "./map-gisu-organization"
import type { NoticeAdminAccessContext } from "./notice-admin-access-context"
import type {
  NoticeCreateFormState,
  NoticeCreateStaffScope,
} from "./notice-create-form"
import type { NoticeListOrganizationOptions } from "./notice-list-organization-query"

const SCHOOL_EXECUTIVE_ROLES = new Set([
  "SCHOOL_PRESIDENT",
  "SCHOOL_VICE_PRESIDENT",
])

/** 학교 회장·부회장 — 공지 목록/작성 UI 제약 */
export function isNoticeSchoolExecutiveContext(
  session: Pick<
    NoticeAdminAccessContext,
    "isSuperAdmin" | "scope" | "roleTypes"
  >,
): boolean {
  if (session.isSuperAdmin) {
    return false
  }

  if (session.scope !== "SCHOOL") {
    return false
  }

  return session.roleTypes.some((role) => SCHOOL_EXECUTIVE_ROLES.has(role))
}

export const NOTICE_SCHOOL_EXECUTIVE_STAFF_LIST_RECIPIENTS: NoticeCreateStaffScope[] =
  ["SCHOOL_CORE", "SCHOOL_PART_LEADER"]

export const NOTICE_SCHOOL_EXECUTIVE_STAFF_CREATE_SCOPE: NoticeCreateStaffScope =
  "SCHOOL_PART_LEADER"

export type NoticeSchoolExecutiveLock = {
  chapterId: number
  chapterScope: NonNullable<ReturnType<typeof encodeChapterScope>>
  schoolId: number
  schoolName: string
  schoolScope: NonNullable<ReturnType<typeof encodeSchoolScope>>
}

function resolveChapterForSchool(
  session: Pick<NoticeAdminAccessContext, "schoolId">,
  organization: NoticeListOrganizationOptions,
): NoticeListChapterOption | null {
  const { chapters, schoolsByChapterId } = organization

  if (session.schoolId != null) {
    for (const [chapterId, schools] of schoolsByChapterId) {
      if (schools.some((school) => school.schoolId === session.schoolId)) {
        return chapters.find((chapter) => chapter.id === chapterId) ?? null
      }
    }
  }

  if (chapters.length === 1) {
    return chapters[0] ?? null
  }

  return null
}

export function resolveNoticeSchoolExecutiveLock(
  session: Pick<
    NoticeAdminAccessContext,
    "isSuperAdmin" | "scope" | "roleTypes" | "schoolId" | "schoolName"
  >,
  organization: NoticeListOrganizationOptions | null | undefined,
): NoticeSchoolExecutiveLock | null {
  if (!isNoticeSchoolExecutiveContext(session) || organization == null) {
    return null
  }

  if (session.schoolId == null) {
    return null
  }

  const chapter = resolveChapterForSchool(session, organization)
  if (chapter == null) {
    return null
  }

  const chapterScope = encodeChapterScope(chapter.id)
  const schoolScope = encodeSchoolScope(session.schoolId)
  if (chapterScope == null || schoolScope == null) {
    return null
  }

  const schoolName =
    organization.schools.find((school) => school.schoolId === session.schoolId)
      ?.schoolName ??
    session.schoolName ??
    ""

  return {
    chapterId: chapter.id,
    chapterScope,
    schoolId: session.schoolId,
    schoolName,
    schoolScope,
  }
}

export function applyNoticeSchoolExecutiveChallengerCreateLock(input: {
  form: NoticeCreateFormState
  schoolId: number
  targetGisuId: number
}): NoticeCreateFormState {
  return {
    ...input.form,
    gisuMode: "specific",
    targetGisuId: input.targetGisuId,
    orgMode: "school",
    chapterId: null,
    schoolId: input.schoolId,
  }
}

export function applyNoticeSchoolExecutiveStaffCreateLock(input: {
  form: NoticeCreateFormState
  schoolId: number
  targetGisuId: number
}): NoticeCreateFormState {
  return {
    ...applyNoticeSchoolExecutiveChallengerCreateLock(input),
    staffEnabled: true,
    staffScope: NOTICE_SCHOOL_EXECUTIVE_STAFF_CREATE_SCOPE,
  }
}
