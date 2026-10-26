import { describe, expect, it } from "vitest"

import { filterNotices } from "./filter-notices"
import { MOCK_NOTICES } from "./mock-notices"

describe("filterNotices", () => {
  it("keeps challenger notices for the default filters", () => {
    const result = filterNotices(MOCK_NOTICES, {
      audience: "challenger",
      query: "",
      scopeStage: null,
      scope: null,
      part: null,
    })

    expect(result).toHaveLength(7)
    expect(result.every((notice) => notice.audience === "challenger")).toBe(
      true,
    )
  })

  it("filters by title query", () => {
    const result = filterNotices(MOCK_NOTICES, {
      audience: "challenger",
      query: "없는제목",
      scopeStage: null,
      scope: null,
      part: null,
    })

    expect(result).toHaveLength(0)
  })
})
