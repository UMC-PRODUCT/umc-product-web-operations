import type { NoticePart } from "../api/notice-api.types"
import type { NoticeCreateStaffScope } from "./notice-create-form"
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

export type NoticeListQueryFilterFields = Pick<
  NoticeListFilters,
  | "query"
  | "chapterScope"
  | "schoolScope"
  | "part"
  | "scopeStage"
  | "scope"
  | "staffRecipient"
>

export type NoticeListFilters = {
  audience: NoticeAudience
  query: string
  /** 챌린저: 지부 필터. null이면 지부 전체 */
  chapterScope: NoticeScopeFilterValue
  /** 챌린저: 학교 필터. null이면 학교 전체 */
  schoolScope: NoticeScopeFilterValue
  /** 챌린저: 파트 필터. null이면 파트 전체 / 운영진: scopeStage가 part일 때 대상 */
  part: NoticePart | null
  /** 운영진: 지부별·학교별·파트별 중 하나. null이면 범위 전체 */
  scopeStage: NoticeScopeStage | null
  /** 운영진: scopeStage가 chapter|school일 때만 사용 */
  scope: NoticeScopeFilterValue
  /** 운영진: 받는 사람(noticeTab). null이면 세션 기본 탭 */
  staffRecipient: NoticeCreateStaffScope | null
}
