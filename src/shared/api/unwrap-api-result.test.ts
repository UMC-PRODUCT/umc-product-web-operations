import { describe, expect, it } from "vitest"

import { unwrapApiResult } from "./unwrap-api-result"

describe("unwrapApiResult", () => {
  it("returns result when the body is an envelope", () => {
    expect(
      unwrapApiResult<{ id: number }>({
        success: true,
        code: "OK",
        message: "성공",
        result: { id: 7 },
      }),
    ).toEqual({ id: 7 })
  })

  it("returns the body when it is already the payload", () => {
    expect(
      unwrapApiResult<{ accessToken: string }>({ accessToken: "token" }),
    ).toEqual({ accessToken: "token" })
  })
})
