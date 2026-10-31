import { describe, expect, it } from "vitest"

import {
  isNoticeListFilterForbidden,
  MOCK_NOTICE_VIEWER_SCOPE,
} from "./notice-list-scope"

describe("isNoticeListFilterForbidden", () => {
  it("allows default scope filters", () => {
    expect(
      isNoticeListFilterForbidden(
        { range: "all", target: "all" },
        MOCK_NOTICE_VIEWER_SCOPE,
      ),
    ).toBe(false)
    expect(
      isNoticeListFilterForbidden(
        { range: "branch", target: "web" },
        MOCK_NOTICE_VIEWER_SCOPE,
      ),
    ).toBe(false)
  })

  it("forbids out-of-scope range or target (NT-L01 403)", () => {
    expect(
      isNoticeListFilterForbidden(
        { range: "school", target: "all" },
        MOCK_NOTICE_VIEWER_SCOPE,
      ),
    ).toBe(true)
    expect(
      isNoticeListFilterForbidden(
        { range: "all", target: "server" },
        MOCK_NOTICE_VIEWER_SCOPE,
      ),
    ).toBe(true)
  })
})
