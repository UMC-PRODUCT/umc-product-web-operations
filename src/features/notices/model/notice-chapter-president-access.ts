import {
  isNoticeSuperAdminContext,
  type NoticeAdminAccessContext,
} from "./notice-admin-access-context"
import { encodeChapterScope } from "./notice-scope-filter"
import {
  isNoticeTargetInfoUmcWideAllStaff,
  resolveNoticeStaffRecipientScope,
} from "./notice-staff-recipient-display"

import type {
  GetNoticeSummaryResponse,
  NoticePart,
  NoticeTargetInfo,
} from "../api/notice-api.types"
import type { NoticeListChapterOption } from "./map-gisu-organization"
import type { ChallengerListScopeFilters } from "./notice-challenger-list-scope-filter"
import type {
  NoticeCreateFormState,
  NoticeCreateStaffScope,
} from "./notice-create-form"
import type { NoticeListOrganizationOptions } from "./notice-list-organization-query"

/** 지부장 — 챌린저 탭·챌린저 대상 공지 작성 UI 제약 (운영진 탭/운영진 공지는 별도) */
export function isNoticeChapterPresidentChallengerContext(
  session: Pick<
    NoticeAdminAccessContext,
    "isSuperAdmin" | "scope" | "roleTypes"
  >,
): boolean {
  if (isNoticeSuperAdminContext(session)) {
    return false
  }

  if (session.scope !== "CHAPTER") {
    return false
  }

  return session.roleTypes.includes("CHAPTER_PRESIDENT")
}

/** 지부장(CHAPTER_ADMIN) 운영진 목록 — 받는 사람 필터 (Figma 2808-42322) */
export const NOTICE_CHAPTER_ADMIN_STAFF_LIST_RECIPIENTS: NoticeCreateStaffScope[] =
  ["ALL_STAFF", "SCHOOL_CORE"]

const CHAPTER_PRESIDENT_STAFF_LIST_SCOPES = new Set<NoticeCreateStaffScope>([
  "ALL_STAFF",
  "SCHOOL_CORE",
])

export type NoticeChapterPresidentChallengerLock = {
  chapterId: number
  chapterName: string
  chapterScope: NonNullable<ReturnType<typeof encodeChapterScope>>
  schoolOptions: NoticeListOrganizationOptions["schools"]
}

export type NoticeChapterPresidentLockResult =
  | { status: "not-applicable" }
  | { status: "locked"; lock: NoticeChapterPresidentChallengerLock }
  | { status: "unresolved" }

function resolvePresidentChapter(
  session: Pick<NoticeAdminAccessContext, "schoolId">,
  organization: NoticeListOrganizationOptions,
): NoticeListChapterOption | null {
  const { chapters, schoolsByChapterId } = organization

  if (chapters.length === 1) {
    return chapters[0] ?? null
  }

  if (session.schoolId == null) {
    return null
  }

  for (const [chapterId, schools] of schoolsByChapterId) {
    if (schools.some((school) => school.schoolId === session.schoolId)) {
      return chapters.find((chapter) => chapter.id === chapterId) ?? null
    }
  }

  return null
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
): NoticeChapterPresidentLockResult {
  if (!isNoticeChapterPresidentChallengerContext(session)) {
    return { status: "not-applicable" }
  }

  if (organization == null) {
    return { status: "unresolved" }
  }

  const chapter = resolvePresidentChapter(session, organization)
  if (chapter == null) {
    return { status: "unresolved" }
  }

  const chapterScope = encodeChapterScope(chapter.id)
  if (chapterScope == null) {
    return { status: "unresolved" }
  }

  return {
    status: "locked",
    lock: {
      chapterId: chapter.id,
      chapterName: chapter.name,
      chapterScope,
      schoolOptions: resolveChapterSchoolOptions(organization, chapter.id),
    },
  }
}

export type ChapterPresidentChallengerListScope = {
  chapterId: number
  schoolIdsInChapter: readonly number[]
  /** NOTICE-001 — 같은 기수의 전 지부 대상 판별 */
  sessionGisuId: number
}

function hasChallengerTargetSchoolScope(target: NoticeTargetInfo): boolean {
  const schoolId = target.targetSchoolId
  return (
    schoolId != null &&
    Number.isFinite(Number(schoolId)) &&
    Number(schoolId) > 0
  )
}

/**
 * 같은 기수의 전 지부 대상 챌린저 공지 (지부·학교 미지정).
 * targetGisuId가 null이면 전 기수·전 지부 공지로 간주한다.
 */
export function isChallengerAllChaptersInGisuTarget(
  target: NoticeTargetInfo,
  sessionGisuId: number,
): boolean {
  if (hasChallengerTargetSchoolScope(target)) {
    return false
  }
  if (target.targetChapterId != null) {
    return false
  }

  const targetGisuId = target.targetGisuId
  if (targetGisuId == null) {
    return true
  }

  return Number(targetGisuId) === sessionGisuId
}

function noticeSummaryEntitledForChapterPresidentChallenger(
  target: NoticeTargetInfo,
  scope: ChapterPresidentChallengerListScope,
): boolean {
  if (isChallengerAllChaptersInGisuTarget(target, scope.sessionGisuId)) {
    return true
  }

  if (target.targetChapterId != null) {
    return Number(target.targetChapterId) === scope.chapterId
  }

  if (hasChallengerTargetSchoolScope(target)) {
    const schoolId = Number(target.targetSchoolId)
    return scope.schoolIdsInChapter.includes(schoolId)
  }

  return false
}

function matchesChallengerPartForChapterPresident(
  target: NoticeTargetInfo,
  scope: ChapterPresidentChallengerListScope,
  partFilter: NoticePart,
): boolean {
  if (isChallengerAllChaptersInGisuTarget(target, scope.sessionGisuId)) {
    return true
  }

  const parts = target.targetParts ?? []
  if (parts.length === 0) {
    return false
  }

  return parts.includes(partFilter)
}

/**
 * 지부장 챌린저 목록 (NOTICE-001)
 * — 같은 기수 전 지부 대상은 파트 무관 열람, 학교 전용은 담당 지부 소속 학교만.
 */
export function noticeSummaryVisibleToChapterPresidentChallengerList(
  summary: GetNoticeSummaryResponse,
  scope: ChapterPresidentChallengerListScope,
  uiFilters: ChallengerListScopeFilters = {
    chapterId: null,
    schoolId: null,
    part: null,
  },
): boolean {
  const target = summary.targetInfo
  if (target?.targetNoticeTab !== "CHALLENGER") {
    return false
  }

  if (!noticeSummaryEntitledForChapterPresidentChallenger(target, scope)) {
    return false
  }

  if (uiFilters.chapterId != null) {
    if (isChallengerAllChaptersInGisuTarget(target, scope.sessionGisuId)) {
      return false
    }

    if (target.targetChapterId != null) {
      if (Number(target.targetChapterId) !== uiFilters.chapterId) {
        return false
      }
    } else if (hasChallengerTargetSchoolScope(target)) {
      const schoolId = Number(target.targetSchoolId)
      if (!scope.schoolIdsInChapter.includes(schoolId)) {
        return false
      }
    } else {
      return false
    }
  }

  if (uiFilters.schoolId != null) {
    if (
      !hasChallengerTargetSchoolScope(target) ||
      Number(target.targetSchoolId) !== uiFilters.schoolId
    ) {
      return false
    }
  }

  if (uiFilters.part != null) {
    return matchesChallengerPartForChapterPresident(
      target,
      scope,
      uiFilters.part,
    )
  }

  return true
}

export function filterChallengerNoticeSummariesForChapterPresident(
  content: GetNoticeSummaryResponse[],
  scope: ChapterPresidentChallengerListScope,
  uiFilters?: ChallengerListScopeFilters,
): GetNoticeSummaryResponse[] {
  return content.filter((summary) =>
    noticeSummaryVisibleToChapterPresidentChallengerList(
      summary,
      scope,
      uiFilters,
    ),
  )
}

/** NOTICE-001 — 교내(학교 지정)·학교 운영진 대상 공지 */
export function isNoticeStaffTargetSchoolBound(
  targetInfo: NoticeTargetInfo,
): boolean {
  if (hasChallengerTargetSchoolScope(targetInfo)) {
    return true
  }

  if (targetInfo.targetNoticeTab === "SCHOOL_PART_LEADER") {
    return !isNoticeTargetInfoUmcWideAllStaff(targetInfo)
  }

  return false
}

/**
 * 지부장 열람 가능 운영진 받는 사람(목록·필터 공통).
 * — 모든 운영진·회장단(UMC 전체)만, 교내·학교 운영진·중앙 운영진 제외.
 */
export function resolveChapterPresidentStaffRecipientScope(
  targetInfo: NoticeTargetInfo | null | undefined,
): NoticeCreateStaffScope | null {
  if (!targetInfo || targetInfo.targetNoticeTab === "CHALLENGER") {
    return null
  }

  if (targetInfo.targetNoticeTab === "CENTRAL_MEMBER") {
    return null
  }

  if (isNoticeStaffTargetSchoolBound(targetInfo)) {
    return null
  }

  const scope = resolveNoticeStaffRecipientScope(targetInfo)
  if (scope == null || !CHAPTER_PRESIDENT_STAFF_LIST_SCOPES.has(scope)) {
    return null
  }

  return scope
}

export function noticeSummaryVisibleToChapterPresidentStaffList(
  summary: GetNoticeSummaryResponse,
): boolean {
  return resolveChapterPresidentStaffRecipientScope(summary.targetInfo) != null
}

export function noticeSummaryMatchesChapterPresidentStaffRecipient(
  summary: GetNoticeSummaryResponse,
  staffRecipient: NoticeCreateStaffScope,
): boolean {
  return (
    resolveChapterPresidentStaffRecipientScope(summary.targetInfo) ===
    staffRecipient
  )
}

export function filterStaffNoticeSummariesForChapterPresident(
  content: GetNoticeSummaryResponse[],
): GetNoticeSummaryResponse[] {
  return content.filter((summary) =>
    noticeSummaryVisibleToChapterPresidentStaffList(summary),
  )
}

export function filterStaffNoticeSummariesForChapterPresidentRecipient(
  content: GetNoticeSummaryResponse[],
  staffRecipient: NoticeCreateStaffScope,
): GetNoticeSummaryResponse[] {
  return content.filter((summary) =>
    noticeSummaryMatchesChapterPresidentStaffRecipient(summary, staffRecipient),
  )
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
