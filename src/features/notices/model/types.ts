import type { NoticePart } from "../api/notice-api.types"
import type { NoticeScopeFilterValue } from "./notice-scope-filter"
import type { NoticeScopeStage } from "./notice-scope-stage"

export type NoticeAudience = "challenger" | "staff"

/** @deprecated mock 목록 필터 — API 연동 후 `NoticeListFilters` 사용 */
export type NoticeRangeFilter = "all" | "branch" | "school" | "part"

/** @deprecated mock 목록 필터 — API 연동 후 `NoticeListFilters` 사용 */
export type NoticeTargetFilter = "all" | "web" | "server" | "design"

export type Notice = {
  audience: NoticeAudience
  author: string
  authorMemberId?: number
  createdAt: string
  hasImages?: boolean
  hasLinks?: boolean
  hasVote?: boolean
  id: string
  required: boolean
  target: string
  title: string
  views: number
}

export type NoticeListFilters = {
  audience: NoticeAudience
  query: string
  /** 지부별·학교별·파트별 중 하나. null이면 범위 전체 */
  scopeStage: NoticeScopeStage | null
  /** scopeStage가 chapter|school일 때만 사용 */
  scope: NoticeScopeFilterValue
  /** scopeStage가 part일 때만 사용 */
  part: NoticePart | null
}
