import { describe, expect, it } from "vitest"

import {
  challengerPointList,
  toGrantPointBody,
  toPointHistoryItem,
} from "./map-point-history"
import {
  toChapterOptions,
  toMemberSearchPart,
  toOrganizationId,
  toPointsMember,
  toSchoolOptions,
  usesLegacyPartLabel,
} from "./map-search-member"
import { buildSummary } from "./point-history"

describe("challenger search mapping", () => {
  it("maps a challenger search row onto the table fields", () => {
    const member = toPointsMember({
      memberId: 12,
      name: "김운영",
      nickname: "하늘",
      schoolName: "중앙대학교",
      challengerId: 34,
      generation: 11,
      part: "WEB",
      isAdminInActiveGisu: true,
      roleTypes: ["SCHOOL_PART_LEADER"],
      challengerStatus: "ACTIVE",
    })

    expect(member).toMatchObject({
      id: "12",
      name: "김운영",
      nickname: "하늘",
      schoolLabel: "중앙대학교",
      part: "web-pe",
      sourcePart: "WEB",
      partLabel: "Web",
      generation: "11기",
      generationNumber: 11,
      role: "campus",
      roleLabel: "파트장",
      roles: [{ color: "campus", label: "파트장" }],
      challengerId: 34,
    })
    expect(usesLegacyPartLabel(member.generationNumber)).toBe(false)
  })

  it("maps multiple admin roles and keeps overflow labels distinct", () => {
    const member = toPointsMember({
      memberId: 12,
      name: "김운영",
      nickname: "하늘",
      schoolName: "중앙대학교",
      challengerId: 34,
      generation: 11,
      part: "WEB",
      isAdminInActiveGisu: true,
      roleTypes: ["SCHOOL_PRESIDENT", "SCHOOL_PART_LEADER", "SCHOOL_ETC_ADMIN"],
      challengerStatus: "ACTIVE",
    })

    expect(member.roles).toEqual([
      { color: "product", label: "회장" },
      { color: "campus", label: "파트장" },
      { color: "campus", label: "기타 운영진" },
    ])
    expect(member.roleLabel).toBe("회장")
  })

  it("keeps legacy part labels for generations before 11", () => {
    const member = toPointsMember({
      memberId: 12,
      name: "김운영",
      nickname: "하늘",
      schoolName: "중앙대학교",
      challengerId: 34,
      generation: 10,
      part: "SPRINGBOOT",
      isAdminInActiveGisu: false,
      roleTypes: [],
      challengerStatus: "ACTIVE",
    })

    expect(member).toMatchObject({
      part: "web-pe",
      sourcePart: "SPRINGBOOT",
      partLabel: "Spring",
      generation: "10기",
      generationNumber: 10,
    })
    expect(usesLegacyPartLabel(member.generationNumber)).toBe(true)
  })

  it("builds chapter and school options from the organization response", () => {
    const gisus = [
      {
        gisuId: 1,
        chapters: [
          {
            chapterId: 7,
            chapterName: "서울",
            schools: [{ schoolId: 3, schoolName: "중앙대학교" }],
          },
          {
            chapterId: 7,
            chapterName: "서울",
            schools: [{ schoolId: 3, schoolName: "중앙대학교" }],
          },
        ],
        schools: [{ schoolId: 3, schoolName: "중앙대학교" }],
      },
      {
        gisuId: 2,
        chapters: [
          {
            chapterId: 8,
            chapterName: "경기",
            schools: [{ schoolId: 9, schoolName: "성균관대학교" }],
          },
        ],
        schools: [{ schoolId: 3, schoolName: "중앙대학교" }],
      },
    ]

    expect(toChapterOptions(gisus)).toEqual([
      { value: "7", label: "서울" },
      { value: "8", label: "경기" },
    ])
    expect(toSchoolOptions(gisus)).toEqual([
      { value: "3", label: "중앙대학교" },
      { value: "9", label: "성균관대학교" },
    ])
    expect(toSchoolOptions(gisus, 8)).toEqual([
      { value: "9", label: "성균관대학교" },
    ])
    expect(toOrganizationId("7")).toBe(7)
    expect(toOrganizationId(null)).toBeUndefined()
    expect(toMemberSearchPart("design")).toBe("DESIGN")
    expect(toMemberSearchPart("web-pe")).toBe("WEB_PRODUCT_ENGINEER")
    expect(toMemberSearchPart("mobile-pe")).toBe("MOBILE_PRODUCT_ENGINEER")
    expect(toMemberSearchPart(null)).toBeUndefined()
  })

  it("maps modern PE part enums onto Web/Mobile PE tags", () => {
    expect(
      toPointsMember({
        memberId: 1,
        name: "웹페",
        generation: 11,
        part: "WEB_PRODUCT_ENGINEER",
        isAdminInActiveGisu: false,
      }),
    ).toMatchObject({
      part: "web-pe",
      sourcePart: "WEB_PRODUCT_ENGINEER",
      partLabel: "Web PE",
    })

    expect(
      toPointsMember({
        memberId: 2,
        name: "모페",
        generation: 11,
        part: "MOBILE_PRODUCT_ENGINEER",
        isAdminInActiveGisu: false,
      }),
    ).toMatchObject({
      part: "mobile-pe",
      sourcePart: "MOBILE_PRODUCT_ENGINEER",
      partLabel: "Mobile PE",
    })
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

  it("shows a newly granted penalty ahead of the previous history", () => {
    const history = challengerPointList({
      challengerId: 1,
      challengerPoints: [
        {
          id: 1,
          pointType: "BLOG_CHALLENGE",
          point: 3,
          createdAt: "2026-10-01T00:00:00.000Z",
        },
      ],
      points: [
        {
          id: 1,
          pointType: "BLOG_CHALLENGE",
          point: 3,
          createdAt: "2026-10-01T00:00:00.000Z",
        },
        {
          id: 2,
          pointType: "STUDY_LATE",
          point: "2",
          description: "지각",
          createdAt: "2026-10-20T00:00:00.000Z",
        },
      ],
    }).map(toPointHistoryItem)

    expect(history.map((item) => item.typeLabel)).toEqual([
      "스터디 지각",
      "블로그 챌린지",
    ])
    expect(history[0]?.score).toBe(-2)
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

  it("sums reward and penalty totals from signed scores", () => {
    const history = [
      toPointHistoryItem({
        id: 1,
        pointType: "BLOG_CHALLENGE",
        point: "3",
      }),
      toPointHistoryItem({
        id: 2,
        pointType: "STUDY_LATE",
        point: "2",
      }),
      toPointHistoryItem({
        id: 3,
        pointType: "CUSTOM",
        point: "-1",
      }),
    ]

    expect(history.map((item) => item.score)).toEqual([3, -2, -1])
    expect(buildSummary(history)).toEqual({
      total: 0,
      rewardTotal: 3,
      penaltyTotal: -3,
    })
  })
})
