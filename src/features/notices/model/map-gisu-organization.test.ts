import { describe, expect, it } from "vitest"

import {
  normalizeChapterOption,
  normalizeGisuOrganizationLists,
  normalizeSchoolOption,
} from "./map-gisu-organization"

describe("normalizeChapterOption", () => {
  it("accepts chapterId and chapterName from GISU v2", () => {
    expect(
      normalizeChapterOption({ chapterId: 3, chapterName: "서울" }),
    ).toEqual({
      id: 3,
      name: "서울",
    })
  })

  it("accepts id and name from chapter list API", () => {
    expect(normalizeChapterOption({ id: 1, name: "경기" })).toEqual({
      id: 1,
      name: "경기",
    })
  })

  it("returns null when chapter id is missing", () => {
    expect(normalizeChapterOption({ name: "서울" })).toBeNull()
  })
})

describe("normalizeGisuOrganizationLists", () => {
  it("deduplicates invalid chapter rows", () => {
    const result = normalizeGisuOrganizationLists({
      chapters: [
        { chapterId: 1, chapterName: "서울" },
        { name: "이름없음" },
        { chapterId: 1, chapterName: "서울" },
      ],
      schools: [{ schoolId: 2, schoolName: "중앙대학교" }],
    })

    expect(result.chapters).toEqual([{ id: 1, name: "서울" }])
    expect(result.schools).toEqual([{ schoolId: 2, schoolName: "중앙대학교" }])
  })
})

describe("normalizeSchoolOption", () => {
  it("keeps schoolId and schoolName", () => {
    expect(
      normalizeSchoolOption({ schoolId: 5, schoolName: "가천대학교" }),
    ).toEqual({
      schoolId: 5,
      schoolName: "가천대학교",
    })
  })
})
