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

/** 교내 파트장·교내 기타 운영진 — 회장단과 별도 staff 탭 필터, 파트 필수 */
export function isNoticeSchoolStaffContext(
  session: Pick<
    NoticeAdminAccessContext,
    "isSuperAdmin" | "scope" | "roleTypes"
  >,
): boolean {
  if (session.isSuperAdmin) {
    return false
  }

  if (session.roleTypes.some((role) => SCHOOL_EXECUTIVE_ROLES.has(role))) {
    return false
  }

  if (
    session.scope === "SCHOOL" &&
    session.roleTypes.includes("SCHOOL_ETC_ADMIN")
  ) {
    return true
  }

  if (
    session.scope === "SCHOOL_PART" &&
    session.roleTypes.includes("SCHOOL_PART_LEADER")
  ) {
    return true
  }

  return false
}

export const NOTICE_SCHOOL_STAFF_STAFF_LIST_RECIPIENTS: NoticeCreateStaffScope[] =
  ["SCHOOL_PART_LEADER"]

export const NOTICE_SCHOOL_STAFF_STAFF_FIXED_RECIPIENT: NoticeCreateStaffScope =
  "SCHOOL_PART_LEADER"

export type NoticeSchoolStaffLock = {
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

export function resolveNoticeSchoolStaffLock(
  session: Pick<
    NoticeAdminAccessContext,
    "isSuperAdmin" | "scope" | "roleTypes" | "schoolId" | "schoolName"
  >,
  organization: NoticeListOrganizationOptions | null | undefined,
): NoticeSchoolStaffLock | null {
  if (!isNoticeSchoolStaffContext(session) || organization == null) {
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

export function validateNoticeSchoolStaffCreateParts(
  form: NoticeCreateFormState,
): string | null {
  if (!form.challengerEnabled && !form.staffEnabled) {
    return null
  }

  if (form.parts.length === 0) {
    return "파트를 하나 이상 선택해 주세요"
  }

  return null
}
