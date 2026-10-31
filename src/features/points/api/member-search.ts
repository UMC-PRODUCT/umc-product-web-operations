import { api } from "@/shared/api/client"
import { unwrapApiResult } from "@/shared/api/unwrap-api-result"

/** CHALLENGER-201 `/api/v2/challenger/search` part 필터·응답 */
export type MemberSearchPart =
  | "PLAN"
  | "DESIGN"
  | "WEB"
  | "WEB_PRODUCT_ENGINEER"
  | "ANDROID"
  | "IOS"
  | "MOBILE_PRODUCT_ENGINEER"
  | "NODEJS"
  | "SPRINGBOOT"
  | "ADMIN"

export type ChallengerStatus = "ACTIVE" | "GRADUATED" | "EXPELLED" | "WITHDRAWN"

export type ChallengerSearchRoleType =
  | "CENTRAL_PRESIDENT"
  | "CENTRAL_VICE_PRESIDENT"
  | "CENTRAL_OPERATING_TEAM_MEMBER"
  | "CENTRAL_EDUCATION_TEAM_MEMBER"
  | "CHAPTER_PRESIDENT"
  | "SCHOOL_PRESIDENT"
  | "SCHOOL_VICE_PRESIDENT"
  | "SCHOOL_PART_LEADER"
  | "SCHOOL_ETC_ADMIN"

/** 챌린저 단위 검색 행 — 기수별로 별도 row */
export type SearchMemberItem = {
  memberId?: number | null
  name?: string | null
  nickname?: string | null
  email?: string | null
  schoolId?: number | null
  schoolName?: string | null
  profileImageLink?: string | null
  challengerId?: number | null
  gisuId?: number | null
  generation?: number | null
  part?: MemberSearchPart | null
  challengerStatus?: ChallengerStatus | null
  roleTypes?: ChallengerSearchRoleType[] | null
  isAdminInActiveGisu?: boolean | null
}

export type SearchMemberPage = {
  content?: SearchMemberItem[] | null
  page?: number | null
  size?: number | null
  totalElements?: number | null
  totalPages?: number | null
  hasNext?: boolean | null
  hasPrevious?: boolean | null
}

export type SearchMembersResult = {
  totalCount?: number | null
  page?: SearchMemberPage | null
}

export type SearchMembersParams = {
  keyword?: string
  part?: MemberSearchPart
  schoolId?: number
  chapterId?: number
  gisuId?: number
  page: number
  size: number
}

export const MEMBER_SEARCH_PAGE_SIZE = 10

/** GET /api/v2/challenger/search (CHALLENGER-201) */
export async function searchMembers(params: SearchMembersParams) {
  const { data } = await api.get<unknown>("/v2/challenger/search", {
    params: {
      page: params.page,
      size: params.size,
      ...(params.keyword ? { keyword: params.keyword } : {}),
      ...(params.part ? { part: params.part } : {}),
      ...(params.schoolId != null ? { schoolId: params.schoolId } : {}),
      ...(params.chapterId != null ? { chapterId: params.chapterId } : {}),
      ...(params.gisuId != null ? { gisuId: params.gisuId } : {}),
    },
  })
  return unwrapApiResult<SearchMembersResult>(data)
}
