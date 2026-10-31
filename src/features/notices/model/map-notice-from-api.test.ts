import { describe, expect, it } from "vitest"

import {
  mapNoticeDetailResponse,
  mapNoticeSummaryToNotice,
} from "./map-notice-from-api"
import { buildGisuGenerationLookup } from "./notice-gisu-generation"

describe("mapNoticeSummaryToNotice", () => {
  it("maps summary fields for the list table", () => {
    const notice = mapNoticeSummaryToNotice(
      {
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
          targetGisuId: 6,
          targetParts: ["WEB", "ANDROID"],
        },
      },
      {
        gisuGenerationById: buildGisuGenerationLookup([
          { gisuId: 6, generation: 11 },
        ]),
      },
    )

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
    expect(notice.target).toContain("11기")
    expect(notice.target).toContain("Web")
  })

  it("maps school and chapter ids to organization names", () => {
    const notice = mapNoticeSummaryToNotice(
      {
        id: 1,
        title: "t",
        content: "c",
        createdAt: "2026-10-20T05:00:00.000Z",
        mustRead: false,
        viewCount: 1,
        hasImages: false,
        hasLinks: false,
        hasVote: false,
        targetInfo: {
          targetNoticeTab: "CHALLENGER",
          targetGisuId: 6,
          targetSchoolId: 19,
          targetChapterId: 27,
        },
      },
      {
        gisuGenerationById: buildGisuGenerationLookup([
          { gisuId: 6, generation: 11 },
        ]),
        schoolNameById: new Map([[19, "숙명여자대학교"]]),
        chapterNameById: new Map([[27, "Neon"]]),
      },
    )

    expect(notice.target).toContain("숙명여자대학교")
    expect(notice.target).toContain("Neon")
    expect(notice.target).not.toContain("학교 #")
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

  it("maps CLOSED vote to closed poll status for detail card", () => {
    const detail = mapNoticeDetailResponse({
      id: 1,
      title: "투표 종료 공지",
      content: "본문",
      createdAt: "2026-10-20T05:00:00.000Z",
      updatedAt: "2026-10-21T05:00:00.000Z",
      mustRead: false,
      viewCount: 1,
      authorMemberId: 2,
      author: { memberId: 2, name: "작성자" },
      images: [],
      links: [],
      vote: {
        voteId: 9,
        title: "일정",
        allowMultipleChoice: false,
        isAnonymous: true,
        status: "CLOSED",
        startsAt: "2026-10-01T05:00:00.000Z",
        endsAtExclusive: "2026-10-10T05:00:00.000Z",
        totalParticipants: 4,
        options: [
          {
            optionId: 100,
            content: "A",
            voteCount: 3,
            voteRate: 0.75,
          },
          {
            optionId: 101,
            content: "B",
            voteCount: 1,
            voteRate: 0.25,
          },
        ],
      },
    })

    expect(detail.poll?.status).toBe("closed")
    expect(detail.poll?.options).toHaveLength(2)
    expect(detail.hasVote).toBe(true)
  })
})
