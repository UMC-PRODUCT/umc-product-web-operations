import { isStaffUmcWideRecipientScope } from "./notice-create-staff-scope"

import type { NoticePart } from "../api/notice-api.types"
import type { NoticeCreateStaffScope } from "./notice-create-form"
import type { NoticeScopeFilterValue } from "./notice-scope-filter"
import type { NoticeListFilters } from "./types"

export type NoticeListFilterFields = Omit<NoticeListFilters, "audience">

export type NormalizeNoticeListFiltersContext = {
  /** 인코딩된 지부 범위 값(`chapter:{id}`) 목록 */
  chapterScopeOptions: readonly NoticeScopeFilterValue[]
  /** 인코딩된 학교 범위 값(`school:{id}`) 목록 */
  schoolScopeOptions: readonly NoticeScopeFilterValue[]
  partOptions: readonly NoticePart[]
  /** false면 조직·기수 옵션 로딩 중이라 옵션 기반 검증을 건너뜀 */
  optionsReady: boolean
  /** 챌린저 탭: 지부 고정 시 본인 지부 외 선택값 제거 */
  lockedChapterScope?: string | null
  /** 챌린저 탭: 학교 고정 시 본인 학교 외 선택값 제거 */
  challengerLockedSchoolScope?: string | null
  /** 운영진 탭: 학교별 범위일 때 학교 고정 */
  staffLockedSchoolScope?: string | null
  /** 운영진 탭: 허용된 받는 사람만 선택 가능 */
  staffRecipientScopeAllowlist?: readonly NoticeCreateStaffScope[] | null
  /** 운영진 탭: 받는 사람 고정 */
  staffFixedStaffRecipient?: NoticeCreateStaffScope | null
}

/**
 * URL 필터를 현재 조직·권한 컨텍스트에 맞게 보정한다.
 * 보정 결과는 렌더 시 파생값으로만 쓰고 별도 state/URL 동기화는 하지 않는다.
 */
export function normalizeNoticeListFilters(
  filters: NoticeListFilterFields,
  context: NormalizeNoticeListFiltersContext,
): NoticeListFilterFields {
  const {
    chapterScopeOptions,
    challengerLockedSchoolScope = null,
    lockedChapterScope = null,
    optionsReady,
    partOptions,
    schoolScopeOptions,
    staffFixedStaffRecipient = null,
    staffLockedSchoolScope = null,
    staffRecipientScopeAllowlist = null,
  } = context

  let { chapterScope, part, schoolScope, scope, scopeStage, staffRecipient } =
    filters

  if (optionsReady) {
    if (chapterScope != null && !chapterScopeOptions.includes(chapterScope)) {
      chapterScope = null
    }

    if (schoolScope != null && !schoolScopeOptions.includes(schoolScope)) {
      schoolScope = null
    }

    if (part != null && !partOptions.includes(part)) {
      part = null
    }

    if (scopeStage === "chapter" && scope != null) {
      if (!chapterScopeOptions.includes(scope)) {
        scope = null
      }
    } else if (scopeStage === "school" && scope != null) {
      if (!schoolScopeOptions.includes(scope)) {
        scope = null
      }
    }
  }

  if (
    lockedChapterScope != null &&
    chapterScope != null &&
    chapterScope !== lockedChapterScope
  ) {
    chapterScope = null
  }

  if (
    challengerLockedSchoolScope != null &&
    schoolScope != null &&
    schoolScope !== challengerLockedSchoolScope
  ) {
    schoolScope = null
  }

  if (
    staffRecipientScopeAllowlist != null &&
    staffRecipient != null &&
    !staffRecipientScopeAllowlist.includes(staffRecipient)
  ) {
    staffRecipient = null
  }

  if (staffFixedStaffRecipient != null) {
    staffRecipient = staffFixedStaffRecipient
  }

  if (staffRecipient != null && isStaffUmcWideRecipientScope(staffRecipient)) {
    scopeStage = null
    scope = null
    part = null
  }

  if (staffLockedSchoolScope != null && scopeStage === "school") {
    scope = staffLockedSchoolScope
  }

  if (
    chapterScope === filters.chapterScope &&
    part === filters.part &&
    schoolScope === filters.schoolScope &&
    scope === filters.scope &&
    scopeStage === filters.scopeStage &&
    staffRecipient === filters.staffRecipient
  ) {
    return filters
  }

  return {
    ...filters,
    chapterScope,
    part,
    schoolScope,
    scope,
    scopeStage,
    staffRecipient,
  }
}
