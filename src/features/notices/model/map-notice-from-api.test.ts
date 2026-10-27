import { describe, expect, it } from "vitest"

import {
  mapNoticeDetailResponse,
  mapNoticeSummaryToNotice,
} from "./map-notice-from-api"

describe("mapNoticeSummaryToNotice", () => {
  it("maps summary fields for the list table", () => {
    const notice = mapNoticeSummaryToNotice({
      id: 12,
      title: "공지 제목",
      content: "본문",
      createdAt: "2026-10-20T05:00:00.000Z",
      mustRead: true,
      viewCount: 42,
      hasImages: true,
      hasLinks: false,
      hasVote: true,
      authorMemberId: 7,
      author: {
        memberId: 7,
        name: "홍길동",
        roleName: "중앙 운영국",
        organizationName: "중앙",
      },
      targetInfo: {
        targetNoticeTab: "CHALLENGER",
        targetGisuId: 11,
        targetParts: ["WEB", "ANDROID"],
      },
    })

    expect(notice).toMatchObject({
      id: "12",
      title: "공지 제목",
      author: "홍길동",
      authorMemberId: 7,
      required: true,
      views: 42,
      audience: "challenger",
      hasImages: true,
      hasVote: true,
    })
    expect(notice.target).toContain("Web")
  })
})

describe("mapNoticeDetailResponse", () => {
  it("maps vote and attachments", () => {
    const detail = mapNoticeDetailResponse({
      id: 1,
      title: "투표 공지",
      content: "본문",
      createdAt: "2026-10-20T05:00:00.000Z",
      updatedAt: "2026-10-21T05:00:00.000Z",
      mustRead: false,
      viewCount: 3,
      authorMemberId: 2,
      author: { memberId: 2, name: "작성자" },
      images: [
        { id: 1, url: "https://cdn/image.png", fileId: "f1", displayOrder: 0 },
      ],
      links: [{ id: 2, url: "https://forms.gle/test", displayOrder: 0 }],
      vote: {
        voteId: 9,
        title: "일정",
        allowMultipleChoice: true,
        isAnonymous: true,
        status: "OPEN",
        startsAt: "2026-10-20T05:00:00.000Z",
        endsAtExclusive: "2026-10-24T15:00:00.000Z",
        totalParticipants: 10,
        mySelectedOptionIds: [100],
        options: [
          {
            optionId: 100,
            content: "오전",
            voteCount: 6,
            voteRate: 0.6,
          },
        ],
      },
    })

    expect(detail.body).toBe("본문")
    expect(detail.images).toHaveLength(1)
    expect(detail.link?.url).toBe("https://forms.gle/test")
    expect(detail.poll?.options[0]?.isSelected).toBe(true)
    expect(detail.poll?.settingsLabel).toContain("복수선택")
  })
})
