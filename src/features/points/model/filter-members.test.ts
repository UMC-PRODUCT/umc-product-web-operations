import { describe, expect, it } from "vitest"

import { filterMembers } from "./filter-members"
import { MOCK_MEMBERS } from "./mock-members"

describe("filterMembers", () => {
  it("returns all members without filters", () => {
    const result = filterMembers({
      members: MOCK_MEMBERS,
      region: null,
      school: null,
      part: null,
      query: "",
    })

    expect(result).toHaveLength(MOCK_MEMBERS.length)
  })

  it("filters by part", () => {
    const result = filterMembers({
      members: MOCK_MEMBERS,
      region: null,
      school: null,
      part: "design",
      query: "",
    })

    expect(result).toHaveLength(1)
    expect(result[0]?.part).toBe("design")
  })

  it("filters by name query", () => {
    const result = filterMembers({
      members: MOCK_MEMBERS,
      region: null,
      school: null,
      part: null,
      query: "없는이름",
    })

    expect(result).toEqual([])
  })
})
