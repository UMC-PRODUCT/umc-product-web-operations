import type { NoticeDetail } from "./notice-detail.types"

const GALLERY_PLACEHOLDER = "/assets/notices/detail-gallery-placeholder.png"

const DETAIL_BODY = ["블라블라", "블라블라", "블라블라"].join("\n")

const MOCK_POLL_OPTIONS = [
  {
    id: "opt-1",
    isSelected: true,
    label: "토요일 오전",
    progressPercent: 60,
    voteCount: 20,
  },
  {
    id: "opt-2",
    label: "토요일 오후",
    progressPercent: 30,
    voteCount: 20,
  },
  {
    id: "opt-3",
    label: "일요일 오후",
    progressPercent: 30,
    voteCount: 20,
  },
] as const

function createMockNoticeDetail({
  author,
  id,
  pollId,
}: {
  author: string
  id: string
  pollId: string
}): NoticeDetail {
  return {
    id,
    audience: "challenger",
    author,
    authorDisplay: author,
    body: DETAIL_BODY,
    createdAt: "2026.10.20 14:00",
    images: Array.from({ length: 7 }, (_, index) => ({
      alt: "",
      id: `notice-${id}-image-${index + 1}`,
      src: GALLERY_PLACEHOLDER,
    })),
    link: {
      id: `link-${id}`,
      title: "UMC 설문조사(링크 제목)",
      url: "https://forms.gle/AbCdEf123456",
    },
    poll: {
      id: pollId,
      options: MOCK_POLL_OPTIONS.map((option) => ({ ...option })),
      participantCount: 55,
      periodLabel: "10/21 00:00 ~ 10/24 23:59",
      settingsLabel: "복수선택 · 익명투표",
      status: "in_progress",
      title: "발표 희망 시간대",
    },
    required: true,
    target: "11기 · 중앙대학교 · Web, Android",
    targetDisplay: "11기 · 중앙대학교 · Web, Android",
    title: "11기 중간 발표 일정 안내",
    updatedAt: "2026.10.20 14:00",
    views: 59121,
  }
}

export const MOCK_NOTICE_DETAILS: Record<string, NoticeDetail> = {
  "1": createMockNoticeDetail({
    author: "중앙 총괄",
    id: "1",
    pollId: "poll-1",
  }),
  /** id=1과 동일 UI · mock 조회자(중앙 운영국) = 작성자 → 수정·삭제·투표 종료 */
  "2": createMockNoticeDetail({
    author: "중앙 운영국",
    id: "2",
    pollId: "poll-2",
  }),
}
