import { parseNoticeScopeFilter } from "./notice-scope-filter"
import {
  canStaffNoticeUseSchoolOrg,
  isStaffCentralNoticeTab,
} from "./notice-staff-target-rules"

import type { NoticePart } from "../api/notice-api.types"
import type { NoticeCreateFormState } from "./notice-create-form"
import type { NoticeAudience, NoticeListFilters } from "./types"

export type NoticeListCreatePrefill = {
  audience: NoticeAudience
  filters: Omit<NoticeListFilters, "audience" | "query">
}

function resolveChallengerOrgPrefill(
  filters: NoticeListCreatePrefill["filters"],
): Pick<NoticeCreateFormState, "orgMode" | "chapterId" | "schoolId" | "parts"> {
  const { chapterId } = parseNoticeScopeFilter(filters.chapterScope)
  const { schoolId } = parseNoticeScopeFilter(filters.schoolScope)
  const parts: NoticePart[] = filters.part != null ? [filters.part] : []

  if (schoolId != null) {
    return {
      orgMode: "school",
      chapterId: null,
      schoolId,
      parts,
    }
  }

  if (chapterId != null) {
    return {
      orgMode: "chapter",
      chapterId,
      schoolId: null,
      parts,
    }
  }

  return {
    orgMode: "umc",
    chapterId: null,
    schoolId: null,
    parts,
  }
}

function resolveStaffOrgPrefill(
  filters: NoticeListCreatePrefill["filters"],
): Pick<NoticeCreateFormState, "orgMode" | "chapterId" | "schoolId" | "parts"> {
  const staffScope = filters.staffRecipient ?? "CENTRAL_MEMBER"

  if (!canStaffNoticeUseSchoolOrg(staffScope)) {
    return {
      orgMode: "umc",
      chapterId: null,
      schoolId: null,
      parts: [],
    }
  }

  switch (filters.scopeStage) {
    case "school": {
      const { schoolId } = parseNoticeScopeFilter(filters.scope)
      if (schoolId == null) {
        break
      }
      return {
        orgMode: "school",
        chapterId: null,
        schoolId,
        parts: [],
      }
    }
    case "part":
      if (filters.part == null) {
        break
      }
      return {
        orgMode: "umc",
        chapterId: null,
        schoolId: null,
        parts: [filters.part],
      }
    default:
      break
  }

  return {
    orgMode: "umc",
    chapterId: null,
    schoolId: null,
    parts: [],
  }
}

/** 목록 필터 → 작성 폼 prefill (NOTICE-201·운영진 지부 미지원 반영) */
export function sanitizeNoticeListCreatePrefill(
  prefill: NoticeListCreatePrefill,
): NoticeListCreatePrefill {
  if (prefill.audience === "challenger") {
    return prefill
  }

  const filters = { ...prefill.filters }

  if (filters.scopeStage === "chapter") {
    filters.scopeStage = null
    filters.scope = null
  }

  const recipient = filters.staffRecipient ?? "CENTRAL_MEMBER"
  if (isStaffCentralNoticeTab(recipient)) {
    filters.scopeStage = null
    filters.scope = null
    filters.part = null
  }

  return { ...prefill, filters }
}

/** 목록 필터 → 공지 작성 폼 초기 대상 (기수는 session에서 별도 반영) */
export function applyNoticeListPrefillToCreateForm(
  prefill: NoticeListCreatePrefill | null | undefined,
  sessionGisuId: number | null,
): Partial<NoticeCreateFormState> {
  if (!prefill) {
    return {}
  }

  const gisuPatch: Partial<NoticeCreateFormState> =
    sessionGisuId != null
      ? {
          gisuMode: "specific",
          targetGisuId: sessionGisuId,
        }
      : {}

  if (prefill.audience === "challenger") {
    return {
      ...gisuPatch,
      challengerEnabled: true,
      staffEnabled: false,
      ...resolveChallengerOrgPrefill(prefill.filters),
    }
  }

  return {
    ...gisuPatch,
    challengerEnabled: false,
    staffEnabled: true,
    ...(prefill.filters.staffRecipient
      ? { staffScope: prefill.filters.staffRecipient }
      : {}),
    ...resolveStaffOrgPrefill(prefill.filters),
  }
}
