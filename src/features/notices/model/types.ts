export type NoticeAudience = "challenger" | "staff"

export type NoticeRangeFilter = "all" | "branch" | "school" | "part"

export type NoticeTargetFilter = "all" | "web" | "server" | "design"

export type Notice = {
  audience: NoticeAudience
  author: string
  createdAt: string
  id: string
  required: boolean
  target: string
  title: string
  views: number
}

export type NoticeListFilters = {
  audience: NoticeAudience
  query: string
  range: NoticeRangeFilter
  target: NoticeTargetFilter
}
