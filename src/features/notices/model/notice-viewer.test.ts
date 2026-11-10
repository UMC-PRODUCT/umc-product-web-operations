import { describe, expect, it } from "vitest"

import {
  isNoticeAuthor,
  MOCK_NOTICE_VIEWER_AUTHOR,
  parseNoticeMemberId,
} from "./notice-viewer"

describe("parseNoticeMemberId", () => {
  it("coerces string ids from the notice API", () => {
    expect(parseNoticeMemberId("42")).toBe(42)
  })

  it("rejects non-positive values", () => {
    expect(parseNoticeMemberId(0)).toBeUndefined()
    expect(parseNoticeMemberId("abc")).toBeUndefined()
  })
})

describe("isNoticeAuthor", () => {
  it("matches author and session member ids", () => {
    expect(
      isNoticeAuthor({ author: "홍길동", authorMemberId: 7 }, { id: 7 }),
    ).toBe(true)
  })

  it("matches when API sends string member id on the notice", () => {
    expect(
      isNoticeAuthor(
        { author: "홍길동", authorMemberId: "7" as unknown as number },
        { id: 7 },
      ),
    ).toBe(true)
  })

  it("falls back to session display name when member id is missing", () => {
    expect(
      isNoticeAuthor({ author: "홍길동" }, { id: 7 }, undefined, "홍길동"),
    ).toBe(true)
  })

  it("uses QA mock author when ids and names are unavailable", () => {
    expect(
      isNoticeAuthor(
        { author: MOCK_NOTICE_VIEWER_AUTHOR },
        null,
        MOCK_NOTICE_VIEWER_AUTHOR,
      ),
    ).toBe(true)
  })

  it("returns false when member ids differ", () => {
    expect(
      isNoticeAuthor(
        { author: "홍길동", authorMemberId: 1 },
        { id: 2 },
        undefined,
        "홍길동",
      ),
    ).toBe(false)
  })
})
