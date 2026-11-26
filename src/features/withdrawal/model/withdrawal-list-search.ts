/** 탈부 목록 `/activity/withdrawal` URL 검색 파라미터 */
export type WithdrawalListSearch = {
  /** 지부 ID (숫자 문자열) */
  chapter?: string
  /** 학교 ID (숫자 문자열) */
  school?: string
  /** 파트 필터 값 (toolbar value) */
  part?: string
  /** 사유 필터: voluntary | involuntary */
  reason?: string
  /** 상태 필터: pending | withdrawn */
  status?: string
  /** 검색어 */
  q?: string
  /** 1부터 시작. 1페이지는 생략 */
  page?: number
}

const NUMERIC_ID_PATTERN = /^\d+$/
const PART_VALUES = new Set(["web-pe", "design", "pm", "mobile-pe"])
const REASON_VALUES = new Set(["voluntary", "involuntary"])
const STATUS_VALUES = new Set(["pending", "withdrawn"])

function parseNumericId(value: unknown): string | undefined {
  const text =
    typeof value === "number" && Number.isInteger(value) ? String(value) : value
  if (typeof text !== "string" || !NUMERIC_ID_PATTERN.test(text)) {
    return undefined
  }
  return text
}

function parseAllowed(
  value: unknown,
  allowed: ReadonlySet<string>,
): string | undefined {
  if (typeof value !== "string" || !allowed.has(value)) {
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

export function parseWithdrawalListPage(value: unknown): number | undefined {
  const parsed = typeof value === "number" ? value : Number(value)
  if (!Number.isInteger(parsed) || parsed < 2) {
    return undefined
  }
  return parsed
}

export function parseWithdrawalListSearch(
  search: Record<string, unknown>,
): WithdrawalListSearch {
  return {
    chapter: parseNumericId(search.chapter),
    school: parseNumericId(search.school),
    part: parseAllowed(search.part, PART_VALUES),
    reason: parseAllowed(search.reason, REASON_VALUES),
    status: parseAllowed(search.status, STATUS_VALUES),
    q: parseQuery(search.q),
    page: parseWithdrawalListPage(search.page),
  }
}

/** 0-based API 페이지 ↔ URL 페이지 변환 */
export function toWithdrawalListPageIndex(page: number | undefined): number {
  return page == null ? 0 : page - 1
}

export function toWithdrawalListPageParam(
  pageIndex: number,
): number | undefined {
  return pageIndex > 0 ? pageIndex + 1 : undefined
}

export function clearWithdrawalListSearch(): WithdrawalListSearch {
  return {
    chapter: undefined,
    school: undefined,
    part: undefined,
    reason: undefined,
    status: undefined,
    q: undefined,
    page: undefined,
  }
}
