export type NoticeScopeFilterValue = string | null

export function encodeChapterScope(chapterId: number): NoticeScopeFilterValue {
  return `chapter:${chapterId}`
}

export function encodeSchoolScope(schoolId: number): NoticeScopeFilterValue {
  return `school:${schoolId}`
}

export function parseNoticeScopeFilter(value: NoticeScopeFilterValue): {
  chapterId: number | null
  schoolId: number | null
} {
  if (!value) {
    return { chapterId: null, schoolId: null }
  }

  if (value.startsWith("chapter:")) {
    const chapterId = Number(value.slice("chapter:".length))
    return {
      chapterId: Number.isFinite(chapterId) ? chapterId : null,
      schoolId: null,
    }
  }

  if (value.startsWith("school:")) {
    const schoolId = Number(value.slice("school:".length))
    return {
      chapterId: null,
      schoolId: Number.isFinite(schoolId) ? schoolId : null,
    }
  }

  return { chapterId: null, schoolId: null }
}
