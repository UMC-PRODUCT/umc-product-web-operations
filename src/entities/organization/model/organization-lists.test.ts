import { describe, expect, it } from "vitest"

import {
  EMPTY_ORGANIZATION_LISTS,
  toOrganizationLists,
} from "./organization-lists"

describe("toOrganizationLists", () => {
  it("returns the shared empty lists when gisu is null", () => {
    expect(toOrganizationLists(null)).toBe(EMPTY_ORGANIZATION_LISTS)
    expect(toOrganizationLists(undefined)).toBe(EMPTY_ORGANIZATION_LISTS)
  })

  it("maps chapters and nested schools", () => {
    const result = toOrganizationLists({
      chapters: [
        {
          chapterId: 1,
          chapterName: "서울",
          schools: [{ schoolId: 2, schoolName: "중앙대학교" }],
        },
      ],
      schools: [],
    })

    expect(result.chapters).toEqual([{ id: 1, name: "서울" }])
    expect(result.schools).toEqual([{ schoolId: 2, schoolName: "중앙대학교" }])
    expect(result.schoolsByChapterId.get(1)).toEqual([
      { schoolId: 2, schoolName: "중앙대학교" },
    ])
  })

  it("assigns flat schools to the only chapter when nested schools are empty", () => {
    const result = toOrganizationLists({
      chapters: [{ chapterId: 1, chapterName: "서울", schools: [] }],
      schools: [{ schoolId: 2, schoolName: "중앙대학교" }],
    })

    expect(result.schoolsByChapterId.get(1)).toEqual([
      { schoolId: 2, schoolName: "중앙대학교" },
    ])
  })
})
