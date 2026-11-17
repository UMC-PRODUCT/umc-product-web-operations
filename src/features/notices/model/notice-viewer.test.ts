import { describe, expect, it } from "vitest"

import {
  canManageNoticeDetail,
  isNoticeAuthor,
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
    expect(isNoticeAuthor({ authorMemberId: 7 }, { id: 7 })).toBe(true)
  })

  it("matches when API sends string member id on the notice", () => {
    expect(
      isNoticeAuthor({ authorMemberId: "7" as unknown as number }, { id: 7 }),
    ).toBe(true)
  })

  it("does not fall back when member id is missing", () => {
    expect(isNoticeAuthor({}, { id: 7 })).toBe(false)
  })

  it("returns false when member ids differ", () => {
    expect(isNoticeAuthor({ authorMemberId: 1 }, { id: 2 })).toBe(false)
  })
})

describe("canManageNoticeDetail", () => {
  it("allows SUPER_ADMIN even when not the author", () => {
    expect(
      canManageNoticeDetail(
        { authorMemberId: 9 },
        { id: 1, isSuperAdmin: true },
      ),
    ).toBe(true)
  })

  it("still requires authorship for non-super-admin", () => {
    expect(
      canManageNoticeDetail(
        { authorMemberId: 9 },
        { id: 1, isSuperAdmin: false },
      ),
    ).toBe(false)
  })
})
