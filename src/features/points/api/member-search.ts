import { api } from "@/shared/api/client"
import { unwrapApiResult } from "@/shared/api/unwrap-api-result"

export type MemberSearchPart =
  | "PLAN"
  | "DESIGN"
  | "WEB"
  | "ANDROID"
  | "IOS"
  | "NODEJS"
  | "SPRINGBOOT"
  | "ADMIN"
  | "WEB_PRODUCT_ENGINEER"
  | "MOBILE_PRODUCT_ENGINEER"

export type CurrentChallenger = {
  challengerId?: number | null
  gisuId?: number | null
  generation?: number | null
  part?: MemberSearchPart | null
  challengerStatus?: string | null
}

export type ChallengerRecord = {
  part?: MemberSearchPart | null
  gisu?: number | null
  gisuId?: number | null
  schoolId?: number | null
  schoolName?: string | null
  chapterId?: number | null
  chapterName?: string | null
  challengerRoleType?: string | null
}

export type SearchMemberItem = {
  memberId: number
  name?: string | null
  nickname?: string | null
  schoolId?: number | null
  schoolName?: string | null
  currentChallenger?: CurrentChallenger | null
  isAdminInActiveGisu?: boolean | null
  challengerRecords?: ChallengerRecord[] | null
}

export type SearchMemberPage = {
  content?: SearchMemberItem[] | null
  totalElements?: number | null
  totalPages?: number | null
  hasNext?: boolean | null
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

export async function searchMembers(params: SearchMembersParams) {
  const { data } = await api.get<unknown>("/v2/member/search", {
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
