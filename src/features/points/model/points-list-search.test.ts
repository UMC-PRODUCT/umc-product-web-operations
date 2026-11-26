import { describe, expect, it } from "vitest"

import {
  parsePointsListSearch,
  toPointsListPageIndex,
  toPointsListPageParam,
} from "./points-list-search"

describe("parsePointsListSearch", () => {
  it("유효한 값을 그대로 읽는다", () => {
    expect(
      parsePointsListSearch({
        chapter: "3",
        school: 12,
        part: "WEB",
        q: "  김  ",
        page: "4",
      }),
    ).toEqual({
      chapter: "3",
      school: "12",
      part: "WEB",
      q: "김",
      page: 4,
    })
  })

  it("PE 파트 value(web-pe 등)도 허용한다", () => {
    expect(parsePointsListSearch({ part: "web-pe" }).part).toBe("web-pe")
    expect(parsePointsListSearch({ part: "pm" }).part).toBe("pm")
  })

  it("잘못된 값은 undefined로 버린다", () => {
    expect(
      parsePointsListSearch({
        chapter: "abc",
        school: "-1",
        part: "web",
        q: "   ",
        page: 1,
      }),
    ).toEqual({
      chapter: undefined,
      school: undefined,
      part: undefined,
      q: undefined,
      page: undefined,
    })
  })
})

describe("points list page param", () => {
  it("URL 페이지와 0-based 인덱스를 변환한다", () => {
    expect(toPointsListPageIndex(undefined)).toBe(0)
    expect(toPointsListPageIndex(3)).toBe(2)
    expect(toPointsListPageParam(0)).toBeUndefined()
    expect(toPointsListPageParam(2)).toBe(3)
  })
})
