import { describe, expect, it } from "vitest"

import { toGrantPointBody, toPointHistoryItem } from "./map-point-history"
import {
  toChapterOptions,
  toMemberSearchPart,
  toOrganizationId,
  toPointsMember,
  toSchoolOptions,
} from "./map-search-member"

describe("member search mapping", () => {
  it("maps a search item onto the table fields", () => {
    const member = toPointsMember({
      memberId: 12,
      name: "김운영",
      nickname: "하늘",
      schoolName: "중앙대학교",
      isAdminInActiveGisu: true,
      currentChallenger: {
        challengerId: 34,
        generation: 11,
        part: "WEB_PRODUCT_ENGINEER",
      },
      challengerRecords: [
        {
          gisu: 11,
          chapterName: "서울",
          challengerRoleType: "SCHOOL_PART_LEADER",
        },
      ],
    })

    expect(member).toMatchObject({
      id: "12",
      name: "김운영",
      nickname: "하늘",
      schoolLabel: "중앙대학교",
      part: "web-pe",
      generation: "11기",
      role: "campus",
      roleLabel: "교내 운영진",
      challengerId: 34,
      regionLabel: "서울",
    })
  })

  it("builds chapter and school options from the organization response", () => {
    const gisus = [
      {
        gisuId: 1,
        chapters: [
          { id: 7, name: "서울" },
          { id: 7, name: "서울" },
        ],
        schools: [{ schoolId: 3, schoolName: "중앙대학교" }],
      },
      {
        gisuId: 2,
        chapters: [{ id: 8, name: "경기" }],
        schools: [{ schoolId: 3, schoolName: "중앙대학교" }],
      },
    ]

    expect(toChapterOptions(gisus)).toEqual([
      { value: "7", label: "서울" },
      { value: "8", label: "경기" },
    ])
    expect(toSchoolOptions(gisus)).toEqual([
      { value: "3", label: "중앙대학교" },
    ])
    expect(toOrganizationId("7")).toBe(7)
    expect(toOrganizationId(null)).toBeUndefined()
    expect(toMemberSearchPart("design")).toBe("DESIGN")
    expect(toMemberSearchPart(null)).toBeUndefined()
  })
})

describe("point grant body", () => {
  it("sends pointValue only for custom scores", () => {
    expect(
      toGrantPointBody({
        tab: "reward",
        typeLabel: "블로그 챌린지",
        score: 3,
        reason: "제출",
      }),
    ).toEqual({ pointType: "BLOG_CHALLENGE", description: "제출" })

    expect(
      toGrantPointBody({
        tab: "other",
        typeLabel: "기타 상점",
        score: 5,
        reason: "기타",
      }),
    ).toEqual({
      pointType: "CUSTOM",
      pointValue: 5,
      description: "기타",
    })
  })

  it("maps a point record onto a history row", () => {
    expect(
      toPointHistoryItem({
        id: 9,
        pointType: "STUDY_LATE",
        point: -2,
        description: "지각",
        createdAt: "2026-03-01T01:02:00.000Z",
      }).typeLabel,
    ).toBe("스터디 지각")
  })
})
