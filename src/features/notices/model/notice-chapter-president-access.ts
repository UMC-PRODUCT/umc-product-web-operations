import { encodeChapterScope } from "./notice-scope-filter"

import type { NoticeListChapterOption } from "./map-gisu-organization"
import type { NoticeAdminAccessContext } from "./notice-admin-access-context"
import type { NoticeCreateFormState } from "./notice-create-form"
import type { NoticeListOrganizationOptions } from "./notice-list-organization-query"

/** 지부장 — 챌린저 탭·챌린저 대상 공지 작성 UI 제약 (운영진 탭/운영진 공지는 별도) */
export function isNoticeChapterPresidentChallengerContext(
  session: Pick<
    NoticeAdminAccessContext,
    "isSuperAdmin" | "scope" | "roleTypes"
  >,
): boolean {
  if (session.isSuperAdmin) {
    return false
  }

  if (session.scope !== "CHAPTER") {
    return false
  }

  return session.roleTypes.includes("CHAPTER_PRESIDENT")
}

export type NoticeChapterPresidentChallengerLock = {
  chapterId: number
  chapterName: string
  chapterScope: NonNullable<ReturnType<typeof encodeChapterScope>>
  schoolOptions: NoticeListOrganizationOptions["schools"]
}

function resolvePresidentChapter(
  session: Pick<NoticeAdminAccessContext, "schoolId">,
  organization: NoticeListOrganizationOptions,
): NoticeListChapterOption | null {
  const { chapters, schoolsByChapterId } = organization

  if (chapters.length === 1) {
    return chapters[0] ?? null
  }

  if (session.schoolId != null) {
    for (const [chapterId, schools] of schoolsByChapterId) {
      if (schools.some((school) => school.schoolId === session.schoolId)) {
        return chapters.find((chapter) => chapter.id === chapterId) ?? null
      }
    }
  }

  return chapters[0] ?? null
}

function resolveChapterSchoolOptions(
  organization: NoticeListOrganizationOptions,
  chapterId: number,
): NoticeListOrganizationOptions["schools"] {
  const fromChapter = organization.schoolsByChapterId.get(chapterId)
  if (fromChapter != null && fromChapter.length > 0) {
    return fromChapter
  }

  if (organization.chapters.length === 1) {
    return organization.schools
  }

  return fromChapter ?? []
}

export function resolveNoticeChapterPresidentChallengerLock(
  session: Pick<
    NoticeAdminAccessContext,
    "isSuperAdmin" | "scope" | "roleTypes" | "schoolId"
  >,
  organization: NoticeListOrganizationOptions | null | undefined,
): NoticeChapterPresidentChallengerLock | null {
  if (
    !isNoticeChapterPresidentChallengerContext(session) ||
    organization == null
  ) {
    return null
  }

  const chapter = resolvePresidentChapter(session, organization)
  if (chapter == null) {
    return null
  }

  const chapterScope = encodeChapterScope(chapter.id)
  if (chapterScope == null) {
    return null
  }

  return {
    chapterId: chapter.id,
    chapterName: chapter.name,
    chapterScope,
    schoolOptions: resolveChapterSchoolOptions(organization, chapter.id),
  }
}

export function applyNoticeChapterPresidentCreateFormLock(input: {
  form: NoticeCreateFormState
  chapterId: number
  targetGisuId: number
}): NoticeCreateFormState {
  return {
    ...input.form,
    gisuMode: "specific",
    targetGisuId: input.targetGisuId,
    orgMode: "chapter",
    chapterId: input.chapterId,
    schoolId: null,
  }
}
