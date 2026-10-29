export type NoticeTab =
  "CHALLENGER" | "CENTRAL_MEMBER" | "SCHOOL_CORE" | "SCHOOL_PART_LEADER"

export type NoticePart =
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

export type NoticeAuthorInfo = {
  gisuId?: number
  memberId?: number
  name?: string
  nickname?: string
  organizationId?: number
  organizationName?: string | null
  organizationType?: "CENTRAL" | "CHAPTER" | "SCHOOL" | null
  roleName?: string | null
  roleType?: string | null
}

export type NoticeTargetInfo = {
  targetNoticeTab: NoticeTab
  targetChapterId?: number | null
  targetGisuId?: number | null
  targetParts?: NoticePart[]
  targetSchoolId?: number | null
}

export type GetNoticeSummaryResponse = {
  author?: NoticeAuthorInfo | null
  authorChallengerId?: number
  authorMemberId?: number
  authorName?: string
  authorNickname?: string
  content?: string
  createdAt: string
  hasImages: boolean
  hasLinks: boolean
  hasVote: boolean
  id: number
  mustRead: boolean
  shouldSendNotification?: boolean
  targetInfo?: NoticeTargetInfo | null
  title: string
  viewCount: number
}

export type PageResponseGetNoticeSummaryResponse = {
  content: GetNoticeSummaryResponse[]
  hasNext: boolean
  hasPrevious: boolean
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export type NoticeImageInfo = {
  displayOrder: number
  fileId: string
  id: number
  url: string
}

export type NoticeLinkInfo = {
  displayOrder: number
  id: number
  url: string
}

export type VoteOptionInfo = {
  content: string
  optionId: number
  selectedMemberIds?: number[]
  voteCount: number
  voteRate: number
}

export type NoticeVoteInfo = {
  allowMultipleChoice: boolean
  endsAtExclusive: string
  isAnonymous: boolean
  mySelectedOptionIds?: number[]
  options: VoteOptionInfo[]
  startsAt: string
  status: "NOT_STARTED" | "OPEN" | "CLOSED"
  title: string
  totalParticipants: number
  voteId: number
}

export type GetNoticeDetailResponse = {
  author?: NoticeAuthorInfo | null
  authorChallengerId?: number
  authorMemberId?: number
  content: string
  createdAt: string
  id: number
  images: NoticeImageInfo[]
  links: NoticeLinkInfo[]
  mustRead: boolean
  targetInfo?: NoticeTargetInfo | null
  title: string
  updatedAt: string
  viewCount: number
  vote?: NoticeVoteInfo | null
}

export type GetNoticeStaticsResponse = {
  readCount: number
  readRate: number
  totalCount: number
  unreadCount: number
}

export type NoticeReadStatusFilter = "READ" | "UNREAD"

export type NoticeReadOrganizationFilter = "CHAPTER" | "SCHOOL" | "ALL"

export type GetNoticeReadStatusResponse = {
  challengerId: number
  chapterId?: number
  chapterName?: string
  name: string
  part?: NoticePart
  profileImageUrl?: string
  schoolId?: number
  schoolName?: string
}

export type CursorResponseGetNoticeReadStatusResponse = {
  content: GetNoticeReadStatusResponse[]
  hasNext: boolean
  nextCursor?: number | null
}

export type ListNoticesParams = {
  gisuId: number
  noticeTab: NoticeTab
  chapterId?: number
  schoolId?: number
  part?: NoticePart
  page?: number
  size?: number
  sort?: string[]
}

export type SearchNoticesParams = ListNoticesParams & {
  keyword: string
}

export type GetNoticeReadStatusParams = {
  noticeId: number
  status: NoticeReadStatusFilter
  filterType: NoticeReadOrganizationFilter
  cursorId?: number | null
  organizationIds?: number[]
}

export type CreateNoticeLinkRequest = {
  displayOrder: number
  url: string
}

/** NOTICE-101 — 공지 등록 요청 본문 */
export type CreateNoticeRequest = {
  title: string
  content: string
  mustRead: boolean
  shouldSendNotification: boolean
  targetNoticeTab: NoticeTab
  targetGisuId?: number | null
  targetChapterId?: number | null
  targetSchoolId?: number | null
  targetParts?: NoticePart[]
  links?: CreateNoticeLinkRequest[]
}

export type CreateNoticeResponse = {
  id: number
}
