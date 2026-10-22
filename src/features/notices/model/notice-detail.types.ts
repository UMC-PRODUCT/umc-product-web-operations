import type { Notice } from "./types"

export type NoticeImageAsset = {
  alt: string
  id: string
  src: string
}

export type NoticeLinkAttachment = {
  id: string
  title: string
  url: string
}

export type NoticePollOption = {
  id: string
  isSelected?: boolean
  label: string
  progressPercent: number
  voteCount: number
}

export type NoticePoll = {
  id: string
  options: NoticePollOption[]
  participantCount: number
  periodLabel: string
  settingsLabel: string
  status: "in_progress" | "closed"
  title: string
}

export type NoticeDetail = Notice & {
  authorDisplay: string
  body: string
  images: NoticeImageAsset[]
  link?: NoticeLinkAttachment
  poll?: NoticePoll
  targetDisplay: string
  updatedAt: string
}

/** TODO: API 연동 시 제거. 공지 상세 이미지 불러오기 인라인 토스트 (Figma 525:7982–7984) */
export type NoticeImageLoadState = "pending" | "loading" | "success"

/** @deprecated QA용 `?imageLoadOutcome=error|success` — `imageLoadState`로 대체 */
export type NoticeImageLoadOutcome = "error" | "success"
