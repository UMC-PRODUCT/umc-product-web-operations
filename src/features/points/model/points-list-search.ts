/** 상벌점 목록 `/activity/points` URL 검색 파라미터 */
export type PointsListSearch = {
  /** 지부 ID (숫자 문자열) */
  chapter?: string
  /** 학교 ID (숫자 문자열) */
  school?: string
  /** 파트 필터 값 */
  part?: string
  /** 검색어 */
  q?: string
  /** 1부터 시작. 1페이지는 생략 */
  page?: number
}

const NUMERIC_ID_PATTERN = /^\d+$/
/** 툴바 파트 value: PE(pm/design/web-pe/…) + legacy(WEB/NODEJS/…) */
const PART_VALUES = new Set([
  "pm",
  "design",
  "web-pe",
  "mobile-pe",
  "WEB",
  "NODEJS",
  "SPRINGBOOT",
  "ANDROID",
  "IOS",
])

function parseNumericId(value: unknown): string | undefined {
  const text =
    typeof value === "number" && Number.isInteger(value) ? String(value) : value
  if (typeof text !== "string" || !NUMERIC_ID_PATTERN.test(text)) {
    return undefined
  }
  return text
}

function parsePartValue(value: unknown): string | undefined {
  if (typeof value !== "string" || !PART_VALUES.has(value)) {
    return undefined
  }
  return value
}

function parseQuery(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined
  }
  const trimmed = value.trim()
  return trimmed === "" ? undefined : trimmed
}

export function parsePointsListPage(value: unknown): number | undefined {
  const parsed = typeof value === "number" ? value : Number(value)
  if (!Number.isInteger(parsed) || parsed < 2) {
    return undefined
  }
  return parsed
}

export function parsePointsListSearch(
  search: Record<string, unknown>,
): PointsListSearch {
  return {
    chapter: parseNumericId(search.chapter),
    school: parseNumericId(search.school),
    part: parsePartValue(search.part),
    q: parseQuery(search.q),
    page: parsePointsListPage(search.page),
  }
}

/** 0-based API 페이지 ↔ URL 페이지 변환 */
export function toPointsListPageIndex(page: number | undefined): number {
  return page == null ? 0 : page - 1
}

export function toPointsListPageParam(pageIndex: number): number | undefined {
  return pageIndex > 0 ? pageIndex + 1 : undefined
}
