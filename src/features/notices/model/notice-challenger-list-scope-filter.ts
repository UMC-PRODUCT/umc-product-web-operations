import type {
  GetNoticeSummaryResponse,
  NoticePart,
} from "../api/notice-api.types"
import type { NoticeListRequest } from "./build-notice-list-params"

export type ChallengerListScopeFilters = {
  chapterId: number | null
  schoolId: number | null
  part: NoticePart | null
  /** 지부 필터 시 학교 대상 공지 판별 (targetChapterId 없음) */
  chapterSchoolIds?: readonly number[]
}

export function countActiveChallengerListScopeFilters(
  scope: ChallengerListScopeFilters,
): number {
  return [scope.chapterId, scope.schoolId, scope.part].filter(
    (value) => value != null,
  ).length
}

function hasTargetSchoolId(target: {
  targetSchoolId?: number | null
}): boolean {
  const schoolId = target.targetSchoolId
  return (
    schoolId != null &&
    Number.isFinite(Number(schoolId)) &&
    Number(schoolId) > 0
  )
}

export function challengerListScopeNeedsClientAndFilter(
  scope: ChallengerListScopeFilters,
): boolean {
  return countActiveChallengerListScopeFilters(scope) >= 2
}

/** NOTICE-001 — API가 chapter+part 조회 시 part만 반영하는 경우가 있어 part는 클라이언트 AND */
export function shouldStripPartFromChallengerListRequest(
  scope: ChallengerListScopeFilters,
): boolean {
  return (
    scope.part != null && (scope.chapterId != null || scope.schoolId != null)
  )
}

export function prepareNoticeListRequestForChallengerClientFilter(
  request: NoticeListRequest,
  scope: ChallengerListScopeFilters,
): NoticeListRequest {
  if (!shouldStripPartFromChallengerListRequest(scope)) {
    return request
  }

  if (request.kind === "search") {
    const { part, ...params } = request.params
    void part
    return { kind: "search", params }
  }

  const { part, ...params } = request.params
  void part
  return { kind: "list", params }
}

/** NOTICE-001 — 복합 조회 시 targetInfo 기준 AND 필터 */
export function noticeSummaryMatchesChallengerListScope(
  summary: GetNoticeSummaryResponse,
  scope: ChallengerListScopeFilters,
): boolean {
  const target = summary.targetInfo
  if (target?.targetNoticeTab !== "CHALLENGER") {
    return false
  }

  if (scope.chapterId != null) {
    const chapterId = target.targetChapterId
    if (chapterId != null) {
      if (Number(chapterId) !== scope.chapterId) {
        return false
      }
    } else if (hasTargetSchoolId(target)) {
      const schoolId = Number(target.targetSchoolId)
      const chapterSchoolIds = scope.chapterSchoolIds ?? []
      if (!chapterSchoolIds.includes(schoolId)) {
        return false
      }
    } else {
      return false
    }
  }

  if (scope.schoolId != null) {
    const schoolId = target.targetSchoolId
    if (schoolId == null || Number(schoolId) !== scope.schoolId) {
      return false
    }
  }

  if (scope.part != null) {
    const parts = target.targetParts ?? []
    if (parts.length === 0 || !parts.includes(scope.part)) {
      return false
    }
  }

  return true
}

export function filterChallengerNoticeSummariesByScope(
  content: GetNoticeSummaryResponse[],
  scope: ChallengerListScopeFilters,
): GetNoticeSummaryResponse[] {
  return content.filter((summary) =>
    noticeSummaryMatchesChallengerListScope(summary, scope),
  )
}
