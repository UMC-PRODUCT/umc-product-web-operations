import { describe, expect, it } from "vitest"

import {
  clearWithdrawalListSearch,
  parseWithdrawalListSearch,
  toWithdrawalListPageIndex,
  toWithdrawalListPageParam,
} from "./withdrawal-list-search"

describe("parseWithdrawalListSearch", () => {
  it("유효한 필터를 그대로 읽는다", () => {
    expect(
      parseWithdrawalListSearch({
        chapter: "2",
        page: 3,
        part: "web-pe",
        q: " 김 ",
        reason: "voluntary",
        school: 10,
        status: "pending",
      }),
    ).toEqual({
      chapter: "2",
      page: 3,
      part: "web-pe",
      q: "김",
      reason: "voluntary",
      school: "10",
      status: "pending",
    })
  })

  it("잘못된 값·1페이지·빈 검색어는 버린다", () => {
    expect(
      parseWithdrawalListSearch({
        chapter: "abc",
        page: 1,
        part: "WEB",
        q: "   ",
        reason: "other",
        school: "1;drop",
        status: "done",
      }),
    ).toEqual({
      chapter: undefined,
      page: undefined,
      part: undefined,
      q: undefined,
      reason: undefined,
      school: undefined,
      status: undefined,
    })
  })

  it("검증 결과를 다시 검증해도 같다", () => {
    const once = parseWithdrawalListSearch({
      chapter: "2",
      page: "5",
      q: "a",
      reason: "involuntary",
    })

    expect(parseWithdrawalListSearch(once)).toEqual(once)
  })
})

describe("withdrawal list page helpers", () => {
  it("URL 페이지와 API page index를 변환한다", () => {
    expect(toWithdrawalListPageIndex(undefined)).toBe(0)
    expect(toWithdrawalListPageIndex(3)).toBe(2)
    expect(toWithdrawalListPageParam(0)).toBeUndefined()
    expect(toWithdrawalListPageParam(2)).toBe(3)
  })

  it("필터 초기화 객체를 만든다", () => {
    expect(clearWithdrawalListSearch()).toEqual({
      chapter: undefined,
      school: undefined,
      part: undefined,
      reason: undefined,
      status: undefined,
      q: undefined,
      page: undefined,
    })
  })
})
