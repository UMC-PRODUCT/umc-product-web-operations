import { describe, expect, it } from "vitest"

import { Route as PointsRoute } from "./activity/points.index"
import { Route as WithdrawalRoute } from "./activity/withdrawal.index"
import { Route as NoticesRoute } from "./notices/index"

type Validate = (search: Record<string, unknown>) => Record<string, unknown>

const validateNotices = NoticesRoute.options
  .validateSearch as unknown as Validate
const validatePoints = PointsRoute.options.validateSearch as unknown as Validate
const validateWithdrawal = WithdrawalRoute.options
  .validateSearch as unknown as Validate

describe("공지 목록 라우트 validateSearch", () => {
  it("목록 필터는 URL search에 두지 않는다", () => {
    expect(
      validateNotices({
        audience: "challenger",
        chapterScope: "chapter:3",
        page: "4",
        part: "WEB",
        q: "모집",
      }),
    ).toEqual({})
  })
})

describe("상벌점 목록 라우트 validateSearch", () => {
  it("목록 필터는 URL search에 두지 않고 mock만 유지한다", () => {
    expect(
      validatePoints({
        chapter: "2",
        page: 3,
        part: "WEB",
        q: "김",
        school: 10,
        mock: "roles",
      }),
    ).toEqual({
      mock: import.meta.env.DEV ? "roles" : undefined,
    })
  })
})

describe("탈부 목록 라우트 validateSearch", () => {
  it("목록 필터는 URL search에 두지 않고 mock만 유지한다", () => {
    expect(
      validateWithdrawal({
        chapter: "2",
        page: 3,
        part: "web-pe",
        q: "김",
        reason: "voluntary",
        mock: "empty",
      }),
    ).toEqual({
      mock: import.meta.env.DEV ? "empty" : undefined,
    })
  })
})
