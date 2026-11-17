import { describe, expect, it } from "vitest"

import { Route as PointsRoute } from "./activity/points.index"
import { Route as NoticesRoute } from "./notices/index"

type Validate = (search: Record<string, unknown>) => Record<string, unknown>

const validateNotices = NoticesRoute.options
  .validateSearch as unknown as Validate
const validatePoints = PointsRoute.options.validateSearch as unknown as Validate

describe("공지 목록 라우트 validateSearch", () => {
  it("빈 URL은 모든 필터가 비어 있다", () => {
    const search = validateNotices({})

    expect(search.q).toBeUndefined()
    expect(search.chapterScope).toBeUndefined()
    expect(search).not.toHaveProperty("audience")
    expect(search).not.toHaveProperty("page")
  })

  it("챌린저 필터를 읽는다", () => {
    expect(
      validateNotices({
        audience: "challenger",
        chapterScope: "chapter:3",
        page: "1",
        part: "WEB",
        q: "모집",
      }),
    ).toMatchObject({
      chapterScope: "chapter:3",
      part: "WEB",
      q: "모집",
    })
  })

  it("page·audience는 URL 계약에서 제외한다", () => {
    const search = validateNotices({ page: "4", audience: "staff" })
    expect(search).not.toHaveProperty("page")
    expect(search).not.toHaveProperty("audience")
  })

  it("알 수 없는 값은 버린다", () => {
    const search = validateNotices({
      audience: "nobody",
      chapterScope: "school:1",
      page: "abc",
      part: "COOKING",
    })

    expect(search).toMatchObject({
      chapterScope: undefined,
      part: undefined,
    })
  })

  it("운영진 필터는 받는 사람·범위 단계를 유지하고 챌린저 전용 값은 버린다", () => {
    expect(
      validateNotices({
        audience: "staff",
        chapterScope: "chapter:1",
        scope: "school:7",
        scopeStage: "school",
        staffRecipient: "SCHOOL_CORE",
      }),
    ).toMatchObject({
      chapterScope: "chapter:1",
      scope: "school:7",
      scopeStage: "school",
      staffRecipient: "SCHOOL_CORE",
    })
  })

  it("검증 결과를 다시 검증해도 같다 (뒤로가기 복원 안정성)", () => {
    const once = validateNotices({
      part: "WEB",
      q: "x",
      scopeStage: "part",
      staffRecipient: "SCHOOL_CORE",
    })

    expect(validateNotices(once)).toEqual(once)
  })
})

describe("상벌점 목록 라우트 validateSearch", () => {
  it("유효한 필터를 그대로 읽는다", () => {
    expect(
      validatePoints({
        chapter: "2",
        page: 3,
        part: "WEB",
        q: " 김 ",
        school: 10,
      }),
    ).toMatchObject({
      chapter: "2",
      page: 3,
      part: "WEB",
      q: "김",
      school: "10",
    })
  })

  it("숫자가 아닌 ID·소문자 파트·빈 검색어·1페이지는 버린다", () => {
    expect(
      validatePoints({
        chapter: "abc",
        page: 1,
        part: "web",
        q: "   ",
        school: "1;drop",
      }),
    ).toMatchObject({
      chapter: undefined,
      page: undefined,
      part: undefined,
      q: undefined,
      school: undefined,
    })
  })

  it("개발 모드에서만 mock=roles를 유지한다", () => {
    expect(validatePoints({ mock: "roles" }).mock).toBe(
      import.meta.env.DEV ? "roles" : undefined,
    )
    expect(validatePoints({ mock: "other" }).mock).toBeUndefined()
  })

  it("검증 결과를 다시 검증해도 같다", () => {
    const once = validatePoints({ chapter: "2", page: "5", q: "a" })

    expect(validatePoints(once)).toEqual(once)
  })
})
